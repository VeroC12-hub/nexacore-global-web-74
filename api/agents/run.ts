import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runAgent } from '../_lib/agents/runtime.js';
import { AuthError } from '../_lib/agents/auth.js';

/**
 * Run an AI employee.
 *
 * The single entry point to the agent runtime, used by both the /platform
 * cockpit and the /jarvis page, so there is one brain rather than two.
 *
 * Auth: requires the caller's Supabase access token as a Bearer header. The
 * token is verified server-side and company membership is resolved from the
 * database. A `companyId` in the body is validated against that membership,
 * never trusted, because the tools below run with the service role key and
 * therefore bypass row level security entirely.
 *
 * Env: GROQ_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
 *      SUPABASE_SERVICE_ROLE_KEY.
 */

export const config = { maxDuration: 60 };

/**
 * Same-origin only. The other endpoints in this project use `*`, which is
 * tolerable for unauthenticated ones but not here: this endpoint reads
 * company data, so it should not be callable from arbitrary sites.
 */
function cors(req: VercelRequest, res: VercelResponse) {
  const allowed = [
    'https://www.nexacore-innovations.com',
    'https://nexacore-innovations.com',
    'http://localhost:8080',
    'http://localhost:5173',
  ];
  const origin = String(req.headers.origin || '');
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = String(req.headers.authorization || '');
  const accessToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!accessToken) return res.status(401).json({ error: 'Sign in to use the agents.' });

  const { agentKey, message, companyId, history, conversationId, trigger } = (req.body ?? {}) as {
    agentKey?: string;
    message?: string;
    companyId?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
    conversationId?: string;
    trigger?: 'chat' | 'api';
  };

  if (!agentKey || typeof agentKey !== 'string') {
    return res.status(400).json({ error: 'agentKey is required.' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required.' });
  }
  if (message.length > 8000) {
    return res.status(413).json({ error: 'That message is too long. Try a shorter question.' });
  }

  try {
    const result = await runAgent({
      actor: { kind: 'user', accessToken },
      agentKey,
      request: message.trim(),
      companyId: companyId ?? null,
      history: Array.isArray(history) ? history.slice(-10) : [],
      conversationId: conversationId ?? null,
      trigger: trigger === 'api' ? 'api' : 'chat',
    });

    return res.status(200).json({
      reply: result.reply,
      toolsUsed: result.toolsUsed,
      status: result.status,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      latencyMs: result.latencyMs,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    // Never leak internals to the browser; the detail is in agent_runs.
    console.error('[agents/run]', err?.message || err);
    return res.status(500).json({ error: 'The agent could not complete that request.' });
  }
}
