/**
 * The generic agent runtime.
 *
 * This is the `runNotionAgent()` pattern from api/_lib/notion.ts, generalised
 * so that any agent in the catalog runs on it. Adding a new AI employee means
 * inserting a manifest row and (at most) writing a tool, never writing another
 * loop like this one.
 *
 * Responsibilities:
 *   1. Resolve a company's install of an agent into a manifest.
 *   2. Filter the tool list by the install's permission level, so a read-only
 *      agent is never handed a writing tool in the first place.
 *   3. Run the tool-calling loop.
 *   4. Record every invocation in agent_runs, which is how we find out whether
 *      the platform is economically viable.
 *
 * Env: GROQ_API_KEY, OPENAI_API_KEY (embeddings), VITE_SUPABASE_URL,
 *      SUPABASE_SERVICE_ROLE_KEY.
 */

import { PERMISSION_RANK } from './types.js';
import type { AgentManifest, AgentRunResult, AgentTool, Msg, PermissionLevel, ToolContext } from './types.js';
import { TOOL_REGISTRY, execTool, toolSchemas } from './tools.js';
import { resolveCaller, resolveCompany } from './auth.js';
import type { Actor } from './auth.js';

// Read lazily, not at module load: ESM hoists imports above any dotenv call,
// so a module-level capture would be empty in local scripts.
const supabaseUrl = () => process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const primaryModel = () => process.env.GROQ_TOOL_MODEL || 'openai/gpt-oss-120b';
const fallbackModel = () => process.env.GROQ_TOOL_FALLBACK || 'openai/gpt-oss-20b';
const MAX_ITERATIONS = 6;

/** Tool-call scaffolding that leaked into an assistant message as plain text. */
const LEAKED_TOOL_CALL = /^\s*(<function|<\|python_tag\|>|\{"name"\s*:|\{"function"\s*:)/i;

/**
 * Rough per-million-token USD rates, used only to populate agent_runs so the
 * cost dashboard has real numbers. Groq's free tier bills nothing today; these
 * exist so the ledger is already meaningful when we move to paid inference.
 */
const RATES: Record<string, { in: number; out: number }> = {
  'openai/gpt-oss-120b': { in: 0.15, out: 0.6 },
  'openai/gpt-oss-20b': { in: 0.075, out: 0.3 },
  'claude-sonnet-5': { in: 3.0, out: 15.0 },
  'claude-haiku-4-5': { in: 1.0, out: 5.0 },
};

function estimateCost(model: string, inTok: number, outTok: number): number {
  const r = RATES[model] || { in: 0, out: 0 };
  return (inTok / 1_000_000) * r.in + (outTok / 1_000_000) * r.out;
}

/**
 * Model routing.
 *
 * A manifest may name any model, but this runtime currently speaks only the
 * Groq/OpenAI chat-completions dialect. Anthropic models are therefore mapped
 * down to the Groq default unless an Anthropic key is present AND a translation
 * layer exists for its tool schema (it does not yet).
 *
 * Doing this here rather than in the catalog means a manifest can already
 * declare its intended production model without breaking today's $0 setup.
 */
export function resolveModel(requested: string): { model: string; provider: 'groq'; downgradedFrom?: string } {
  const isAnthropic = requested.startsWith('claude');
  if (isAnthropic) {
    // TODO: when ANTHROPIC_API_KEY is set, add a translation layer for
    // Anthropic's tool-use format and route these natively instead.
    return { model: primaryModel(), provider: 'groq', downgradedFrom: requested };
  }
  return { model: requested, provider: 'groq' };
}

async function sbGet(path: string): Promise<any> {
  const resp = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    headers: { apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`supabase ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return resp.json();
}

async function sbPost(path: string, body: unknown): Promise<void> {
  await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${serviceKey()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  }).catch(() => undefined); // logging must never break the reply
}

/** Resolve a company's install of an agent (by catalog key) into a manifest. */
export async function loadManifest(companyId: string, agentKey: string): Promise<AgentManifest | null> {
  const rows = await sbGet(
    `company_agents?select=id,company_id,display_name,system_prompt_override,granted_tools,granted_connectors,` +
      `permission_level,model,config,monthly_budget_usd,is_enabled,` +
      `ai_agents!inner(key,name,icon,category,system_prompt,default_model,default_tools)` +
      `&company_id=eq.${companyId}&ai_agents.key=eq.${encodeURIComponent(agentKey)}&is_enabled=eq.true&limit=1`,
  );
  const row = rows?.[0];
  if (!row) return null;
  const cat = row.ai_agents;
  return {
    installId: row.id,
    companyId: row.company_id,
    key: cat.key,
    name: row.display_name || cat.name,
    icon: cat.icon ?? null,
    category: cat.category ?? null,
    systemPrompt: row.system_prompt_override || cat.system_prompt,
    model: row.model || cat.default_model || primaryModel(),
    permissionLevel: (row.permission_level || 'read') as PermissionLevel,
    grantedTools: (row.granted_tools?.length ? row.granted_tools : cat.default_tools) || [],
    grantedConnectors: row.granted_connectors || [],
    monthlyBudgetUsd: row.monthly_budget_usd ?? null,
    config: row.config || {},
  };
}

/**
 * Tools this install may actually use: granted by name, present in the
 * registry, and within the install's permission level.
 */
export function resolveTools(
  manifest: AgentManifest,
  // Injectable so tests can exercise the ceiling against write-level tools.
  // Every tool in the real registry is currently `read`, which made an
  // earlier version of the test vacuous: deleting the ceiling check below
  // changed nothing and the suite still passed.
  registry: Record<string, AgentTool> = TOOL_REGISTRY,
) {
  const ceiling = PERMISSION_RANK[manifest.permissionLevel];
  return manifest.grantedTools
    .map((name) => registry[name])
    .filter((t): t is AgentTool => Boolean(t) && PERMISSION_RANK[t.requires] <= ceiling);
}

async function groqCall(model: string, messages: Msg[], tools: ReturnType<typeof toolSchemas>) {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      ...(tools.length ? { tools } : {}),
      temperature: 0.3,
      max_tokens: 2400,
    }),
    signal: AbortSignal.timeout(45000),
  });
}

async function attempt(model: string, messages: Msg[], tools: ReturnType<typeof toolSchemas>) {
  const resp = await groqCall(model, messages, tools);
  return { ok: resp.ok, status: resp.status, text: await resp.text() };
}

/**
 * Shrink a conversation that a model refused on size grounds: keep the system
 * prompt and the most recent exchanges, and cap any single message (tool
 * results are the usual culprit).
 */
function trim(messages: Msg[], keep = 6, cap = 1500): Msg[] {
  const [system, ...rest] = messages;
  const tail = rest.slice(-keep).map((m) => ({
    ...m,
    content: typeof m.content === 'string' && m.content.length > cap ? `${m.content.slice(0, cap)}…` : m.content,
  }));
  return [system, ...tail];
}

/**
 * One model turn, hardened against the three failures seen in practice:
 *   429/5xx  the primary is busy, so try the higher-throughput fallback
 *   413      the fallback has a much SMALLER per-minute token ceiling than
 *            the primary, so a large context can be rejected there even
 *            though the primary would have taken it. Retry trimmed.
 *   400 tool_use_failed
 *            the model emitted a malformed function call and Groq rejects
 *            the whole request. A tool-free answer beats failing the turn.
 */
async function callModel(model: string, messages: Msg[], tools: ReturnType<typeof toolSchemas>) {
  let r = await attempt(model, messages, tools);

  if (r.status === 429 || r.status >= 500) r = await attempt(fallbackModel(), messages, tools);
  if (r.status === 413) r = await attempt(model, trim(messages), tools);

  // Both models throttled. These are TOKENS-per-minute limits, so the useful
  // move is to ask for less, not merely to wait: back off briefly, then retry
  // the primary with a trimmed context.
  if (r.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    r = await attempt(model, trim(messages, 4, 900), tools);
  }

  if (r.status === 400 && r.text.includes('tool_use_failed')) r = await attempt(model, messages, []);

  if (r.status === 429) {
    // Give the caller something truthful and actionable instead of a generic
    // failure. Groq's free tier is 6000 TPM on the fallback model.
    throw new Error('rate_limited: both models are over their per-minute token limit');
  }

  if (!r.ok) throw new Error(`groq ${r.status}: ${r.text.slice(0, 200)}`);

  const data = JSON.parse(r.text);
  return {
    message: data.choices?.[0]?.message,
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
  };
}

export interface RunAgentOptions {
  /** Who is asking. A user token is verified; a system actor must justify itself. */
  actor: Actor;
  agentKey: string;
  request: string;
  /** Optional. Validated against the caller's memberships, never trusted as given. */
  companyId?: string | null;
  history?: { role: 'user' | 'assistant'; content: string }[];
  conversationId?: string | null;
  trigger?: 'chat' | 'workflow' | 'cron' | 'webhook' | 'api';
}

export async function runAgent(opts: RunAgentOptions): Promise<AgentRunResult> {
  const started = Date.now();

  // Auth first: tools run with the service role key and therefore bypass
  // RLS, so this is the only thing enforcing company isolation.
  const caller = await resolveCaller(opts.actor);
  const companyId = resolveCompany(caller, opts.companyId);

  const manifest = await loadManifest(companyId, opts.agentKey);

  if (!manifest) {
    return {
      reply: `No enabled install of "${opts.agentKey}" was found for this company.`,
      toolsUsed: [],
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - started,
      status: 'error',
      error: 'manifest_not_found',
    };
  }

  const { model: activeModel, provider } = resolveModel(manifest.model);
  const tools = resolveTools(manifest);
  const schemas = toolSchemas(tools);
  const byName = new Map(tools.map((t) => [t.name, t]));
  const ctx: ToolContext = {
    companyId: manifest.companyId,
    userId: caller.userId,
    permissionLevel: manifest.permissionLevel,
  };

  const capability = tools.length
    ? `You have these tools: ${tools.map((t) => t.name).join(', ')}. Use them to get real data rather than guessing. If a tool returns no records, say so plainly instead of inventing an answer.`
    : 'You have no tools available, so answer from the conversation alone and say when you cannot verify something.';

  const messages: Msg[] = [
    { role: 'system', content: `${manifest.systemPrompt}\n\n${capability}\n\nToday is ${new Date().toISOString().slice(0, 10)}. Reply in plain text with no markdown symbols.` },
    ...(opts.history || []).slice(-8).map((m) => ({ role: m.role, content: m.content } as Msg)),
    { role: 'user', content: opts.request },
  ];

  const toolsUsed: string[] = [];
  const toolCallLog: any[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let reply = '';
  let status: AgentRunResult['status'] = 'success';
  let error: string | undefined;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const turn = await callModel(activeModel, messages, schemas);
      inputTokens += turn.inputTokens;
      outputTokens += turn.outputTokens;

      const msg = turn.message;
      if (!msg) throw new Error('empty model response');

      const calls = msg.tool_calls || [];
      if (!calls.length) {
        const content = (msg.content || '').trim();

        // Llama models sometimes emit tool-call syntax as ordinary prose
        // instead of a real tool_calls entry (e.g. "<function=foo>null</function>").
        // Returning that verbatim would hand the user raw scaffolding, so ask
        // once more with no tools to force a clean natural-language answer.
        if (LEAKED_TOOL_CALL.test(content)) {
          const clean = await callModel(activeModel, messages, []);
          inputTokens += clean.inputTokens;
          outputTokens += clean.outputTokens;
          reply = (clean.message?.content || '').trim();
        } else {
          reply = content;
        }
        break;
      }

      messages.push({ role: 'assistant', content: msg.content || '', tool_calls: calls });
      for (const call of calls) {
        let args: Record<string, any> = {};
        try {
          args = JSON.parse(call.function?.arguments || '{}');
        } catch {
          /* malformed args: pass an empty object and let the tool complain */
        }
        const name = call.function?.name;
        const result = await execTool(byName.get(name), ctx, args);
        toolsUsed.push(name);
        toolCallLog.push({ name, args });
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name,
          content: result.slice(0, 3000),
        });
      }
    }

    if (!reply) {
      // Ran out of iterations: ask once more with no tools so it must conclude.
      const final = await callModel(activeModel, messages, []);
      inputTokens += final.inputTokens;
      outputTokens += final.outputTokens;
      reply = (final.message?.content || '').trim() || 'I gathered the data but could not summarise it cleanly. Try narrowing the question.';
    }
  } catch (e: any) {
    const message = String(e?.message || e);
    error = message.slice(0, 400);
    if (message.includes('rate_limited')) {
      status = 'error';
      reply = 'I am over the model rate limit for the moment. Give it a minute and ask again.';
    } else if (message.includes('timeout')) {
      status = 'timeout';
      reply = 'That took too long to come back. Try again, or narrow the question.';
    } else {
      status = 'error';
      reply = 'I hit a problem reaching my reasoning step. Try again in a moment.';
    }
  }

  const latencyMs = Date.now() - started;

  await sbPost('agent_runs', {
    company_id: manifest.companyId,
    company_agent_id: manifest.installId,
    conversation_id: opts.conversationId ?? null,
    user_id: caller.userId,
    trigger: opts.trigger || 'chat',
    provider,
    model: activeModel,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: estimateCost(activeModel, inputTokens, outputTokens),
    latency_ms: latencyMs,
    tool_calls: toolCallLog,
    tools_used: [...new Set(toolsUsed)],
    status,
    error_message: error ?? null,
  });

  return { reply, toolsUsed: [...new Set(toolsUsed)], inputTokens, outputTokens, latencyMs, status, error };
}
