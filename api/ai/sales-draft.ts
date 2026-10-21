import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PUBLIC_PITCH_BRAIN } from '../_lib/pitch-brain.js';

/**
 * Sales / lead-gen agent (Phase 2 of the Growth Engine).
 *
 * Given a captured lead (name, contact, what they need), a free Groq model drafts:
 *  - a one to two sentence read on the lead,
 *  - a personalised first outreach email (subject + body),
 *  - a short follow-up for if they do not reply,
 *  - a suggested next action for the team.
 *
 * DRAFT ONLY. Nothing is sent. The admin reviews, edits, and sends from the
 * Growth tab. Grounded strictly in the public Pitch Brain so nothing is invented.
 *
 * Public endpoint but intended for the authenticated admin UI. Env: GROQ_API_KEY.
 */

export const config = { maxDuration: 30 };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MODEL = process.env.GROQ_SALES_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = process.env.GROQ_PITCH_FALLBACK || 'openai/gpt-oss-20b';

export const SYSTEM = `You draft sales outreach on behalf of NexaCore Innovations to a specific inbound lead. You write as the NexaCore team.

${PUBLIC_PITCH_BRAIN}

RULES:
- Everything must be accurate to the company facts above. Never invent clients, prices, numbers, dates, or promises. Describe past results generically and never name a client.
- Warm, professional, human. Plain text only. No markdown, no long dashes (use commas or "to").
- The email is short (about 110 to 160 words): a friendly opener that references what THIS lead asked about, one or two sentences on how NexaCore helps with exactly that (name the relevant service pillar and, if it fits, our Autodesk partnership or one generic proof point), then a clear, low-pressure call to action to book a quick consultation or reply with details. Sign off as "Warm regards," then "The NexaCore Innovations Team" and the website.
- Do not quote a firm price. If pricing comes up, say it depends on scope and offer a free quote.
- The follow-up is 2 to 3 sentences, friendly, for if they do not reply in a few days.
- next_action is one short line telling the NexaCore team what to do next.

Return ONLY valid JSON (no markdown, no code fences) with exactly these keys:
{"summary": "...", "subject": "...", "email": "...", "followup": "...", "next_action": "..."}`;

async function groqJSON(userContent: string, model: string): Promise<string> {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userContent },
      ],
      temperature: 0.5,
      max_tokens: 1600,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(24000),
  });
  if (!resp.ok) throw new Error(`groq ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

function stripDashes(s: string): string {
  return typeof s === 'string' ? s.replace(/[—–]/g, ', ') : s;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'Sales agent is not configured.' });

  try {
    const { name, contact, need, source } = (req.body || {}) as
      { name?: string; contact?: string; need?: string; source?: string };

    const userContent = `Draft outreach for this inbound lead:
Name: ${name || 'Unknown'}
Contact: ${contact || 'not provided'}
What they need: ${need || 'not specified'}
Source: ${source || 'website'}`;

    let raw: string;
    try {
      raw = await groqJSON(userContent, MODEL);
    } catch {
      raw = await groqJSON(userContent, FALLBACK_MODEL);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // last-resort: pull the first {...} block
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }
    if (!parsed || !parsed.email) return res.status(502).json({ error: 'Could not draft outreach. Try again.' });

    return res.status(200).json({
      summary: stripDashes(parsed.summary || ''),
      subject: stripDashes(parsed.subject || 'NexaCore Innovations, following up on your enquiry'),
      email: stripDashes(parsed.email || ''),
      followup: stripDashes(parsed.followup || ''),
      next_action: stripDashes(parsed.next_action || ''),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'sales-draft endpoint failed' });
  }
}
