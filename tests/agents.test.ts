/**
 * Tests for the agent runtime's security boundaries.
 *
 *   npm run test:agents
 *
 * Uses node:test so there is no new dependency. These are pure unit tests:
 * no network, no database, no model calls.
 *
 * Two claims are load-bearing and were previously asserted only in code
 * comments, which is to say not asserted at all:
 *   1. an install never receives a tool above its permission level
 *   2. a caller never reaches a company they do not belong to
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { resolveTools } from '../api/_lib/agents/runtime.js';
import { resolveCompany, AuthError } from '../api/_lib/agents/auth.js';
import { TOOL_REGISTRY } from '../api/_lib/agents/tools.js';
import handler from '../api/agents/run.js';
import { PERMISSION_RANK } from '../api/_lib/agents/types.js';
import type { AgentManifest, AgentTool, PermissionLevel } from '../api/_lib/agents/types.js';
import type { Caller } from '../api/_lib/agents/auth.js';

/**
 * A synthetic registry with one tool per permission level.
 *
 * The real registry is entirely `read` today, so testing the ceiling
 * against it proves nothing: an earlier version of this file passed all
 * 13 assertions with the ceiling check deleted from resolveTools. The
 * fixture has to contain writing tools for the test to mean anything.
 */
const stub = (name: string, requires: PermissionLevel): AgentTool => ({
  name,
  requires,
  description: `${name} (test fixture)`,
  parameters: { type: 'object', properties: {} },
  handler: async () => 'stub',
});

const FIXTURE: Record<string, AgentTool> = {
  reader: stub('reader', 'read'),
  appender: stub('appender', 'append'),
  updater: stub('updater', 'update'),
};
const FIXTURE_NAMES = Object.keys(FIXTURE);

const ALL_TOOLS = Object.keys(TOOL_REGISTRY);

function manifest(permissionLevel: PermissionLevel, grantedTools = ALL_TOOLS): AgentManifest {
  return {
    installId: 'install-1',
    companyId: 'company-a',
    key: 'test',
    name: 'Test Agent',
    icon: null,
    category: null,
    systemPrompt: 'test',
    model: 'llama-3.3-70b-versatile',
    permissionLevel,
    grantedTools,
    grantedConnectors: [],
    monthlyBudgetUsd: null,
    config: {},
  };
}

describe('resolveTools — permission ceiling', () => {
  test('a read-only install gets ONLY the read tool, though all three are granted', () => {
    const tools = resolveTools(manifest('read', FIXTURE_NAMES), FIXTURE);
    assert.deepEqual(tools.map((t) => t.name), ['reader']);
  });

  test('an append install gets read and append, never update', () => {
    const tools = resolveTools(manifest('append', FIXTURE_NAMES), FIXTURE);
    assert.deepEqual(tools.map((t) => t.name), ['reader', 'appender']);
  });

  test('an update install gets all three', () => {
    const tools = resolveTools(manifest('update', FIXTURE_NAMES), FIXTURE);
    assert.deepEqual(tools.map((t) => t.name), ['reader', 'appender', 'updater']);
  });

  test('never returns a tool above the install permission level', () => {
    for (const level of ['read', 'append', 'update'] as PermissionLevel[]) {
      for (const t of resolveTools(manifest(level, FIXTURE_NAMES), FIXTURE)) {
        assert.ok(
          PERMISSION_RANK[t.requires] <= PERMISSION_RANK[level],
          `${level} install was handed "${t.name}" which requires ${t.requires}`,
        );
      }
    }
  });

  test('the same holds for the real registry', () => {
    for (const level of ['read', 'append', 'update'] as PermissionLevel[]) {
      for (const t of resolveTools(manifest(level))) {
        assert.ok(PERMISSION_RANK[t.requires] <= PERMISSION_RANK[level]);
      }
    }
  });

  test('ignores granted names that are not in the registry', () => {
    const tools = resolveTools(manifest('update', ['knowledge_search', 'definitely_not_a_tool']));
    assert.deepEqual(tools.map((t) => t.name), ['knowledge_search']);
  });

  test('grants nothing when nothing is granted', () => {
    assert.deepEqual(resolveTools(manifest('update', [])), []);
  });

  test('a tool is only reachable if explicitly granted', () => {
    const tools = resolveTools(manifest('update', ['projects_read']));
    assert.deepEqual(tools.map((t) => t.name), ['projects_read']);
  });

  test('every registry tool declares a valid permission level', () => {
    for (const [name, tool] of Object.entries(TOOL_REGISTRY)) {
      assert.ok(tool.requires in PERMISSION_RANK, `${name} has an unknown level: ${tool.requires}`);
      assert.equal(tool.name, name, `${name} is registered under a mismatched key`);
    }
  });

  test('no tool exposes a numeric parameter to the model', () => {
    // Groq rejects the whole request when a model emits a number as a
    // string, which cost us two failed runs. Page size belongs to the
    // runtime, not the model.
    for (const [name, tool] of Object.entries(TOOL_REGISTRY)) {
      const props = (tool.parameters as any)?.properties ?? {};
      for (const [param, schema] of Object.entries<any>(props)) {
        assert.notEqual(schema?.type, 'number', `${name}.${param} exposes a number to the model`);
        assert.notEqual(schema?.type, 'integer', `${name}.${param} exposes an integer to the model`);
      }
    }
  });
});

describe('POST /api/agents/run — request contract', () => {
  // Mocked req/res so the handler can be exercised without a server. The
  // happy path needs a real signed-in session and is covered by using the
  // cockpit; what matters here is that nothing reaches the runtime without
  // a token, since the tools bypass RLS.
  function mock(method: string, headers: Record<string, string>, body: unknown) {
    const res: any = {
      statusCode: 0,
      payload: undefined,
      headers: {} as Record<string, string>,
      setHeader(k: string, v: string) { this.headers[k] = v; },
      status(c: number) { this.statusCode = c; return this; },
      json(p: unknown) { this.payload = p; return this; },
      end() { return this; },
    };
    return { req: { method, headers, body } as any, res };
  }

  const AUTHED = { authorization: 'Bearer fake-token-not-verified-here' };

  test('rejects a request with no Authorization header', async () => {
    const { req, res } = mock('POST', {}, { agentKey: 'ops', message: 'hi' });
    await handler(req, res);
    assert.equal(res.statusCode, 401);
  });

  test('rejects a non-Bearer Authorization header', async () => {
    const { req, res } = mock('POST', { authorization: 'Basic abc' }, { agentKey: 'ops', message: 'hi' });
    await handler(req, res);
    assert.equal(res.statusCode, 401);
  });

  test('rejects a missing agentKey before touching the runtime', async () => {
    const { req, res } = mock('POST', AUTHED, { message: 'hi' });
    await handler(req, res);
    assert.equal(res.statusCode, 400);
  });

  test('rejects an empty message', async () => {
    const { req, res } = mock('POST', AUTHED, { agentKey: 'ops', message: '   ' });
    await handler(req, res);
    assert.equal(res.statusCode, 400);
  });

  test('rejects an oversized message', async () => {
    const { req, res } = mock('POST', AUTHED, { agentKey: 'ops', message: 'x'.repeat(8001) });
    await handler(req, res);
    assert.equal(res.statusCode, 413);
  });

  test('rejects a GET', async () => {
    const { req, res } = mock('GET', AUTHED, {});
    await handler(req, res);
    assert.equal(res.statusCode, 405);
  });

  test('does not echo an arbitrary Origin back', async () => {
    const { req, res } = mock('OPTIONS', { origin: 'https://evil.example' }, {});
    await handler(req, res);
    assert.equal(res.headers['Access-Control-Allow-Origin'], undefined);
  });

  test('allows the production origin', async () => {
    const { req, res } = mock('OPTIONS', { origin: 'https://www.nexacore-innovations.com' }, {});
    await handler(req, res);
    assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://www.nexacore-innovations.com');
  });
});

describe('resolveCompany — tenant isolation', () => {
  const caller = (companyIds: string[]): Caller => ({ userId: 'user-1', companyIds, isSystem: false });

  test('rejects a company the caller does not belong to', () => {
    assert.throws(
      () => resolveCompany(caller(['company-a']), 'company-b'),
      (e: unknown) => e instanceof AuthError && (e as AuthError).status === 403,
    );
  });

  test('allows a company the caller does belong to', () => {
    assert.equal(resolveCompany(caller(['company-a', 'company-b']), 'company-b'), 'company-b');
  });

  test('defaults to the only company when none is requested', () => {
    assert.equal(resolveCompany(caller(['company-a'])), 'company-a');
  });

  test('refuses to guess when the caller is in several companies', () => {
    assert.throws(() => resolveCompany(caller(['company-a', 'company-b'])), AuthError);
  });

  test('a caller with no companies reaches nothing', () => {
    assert.throws(() => resolveCompany(caller([]), 'company-a'), AuthError);
    assert.throws(() => resolveCompany(caller([])), AuthError);
  });

  test('does not reveal whether the rejected company exists', () => {
    // Same message for "no such company" and "not yours", so the endpoint
    // cannot be used to enumerate tenants.
    const missing = (() => { try { resolveCompany(caller(['a']), 'nope'); } catch (e: any) { return e.message; } })();
    const forbidden = (() => { try { resolveCompany(caller(['a']), 'b'); } catch (e: any) { return e.message; } })();
    assert.equal(missing, forbidden);
  });
});
