import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runNotionAgent, NOTION_MARKER } from '../_lib/notion.js';
import { runCalendarAgent, CALENDAR_MARKER } from '../_lib/calendar.js';
import { createReminderFromMarker, REMIND_MARKER } from '../_lib/reminders.js';

/**
 * JARVIS fast-brain endpoint for the /jarvis web cockpit.
 *
 * Mirrors the Telegram bot: a free Groq model (gpt-oss-120b with Groq's built-in
 * web search) answers everyday questions instantly. If a request truly needs
 * Godwin's files/apps/machine, the model replies "[ESCALATE] ..." and this
 * endpoint returns { escalate: true } so the web app can fall back to the
 * jarvis_tasks queue (Claude Code on his machine).
 *
 * Env: GROQ_API_KEY (free, from console.groq.com — no billing required).
 */

// The web search takes ~6s; the default 10s function limit + cold
// start was killing it and forcing the no-web fallback (stale answers).
export const config = { maxDuration: 60 };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';
const ESCALATE_TAG = '[ESCALATE]';

const FAST_SYSTEM = `You are JARVIS, Godwin's personal AI in his NexaCore app.

WHO YOU'RE HELPING (use this for context on every task — tailor answers to his world):
- Godwin Ocloo — engineer and founder, based in Ghana. Email: godwinocloo21@gmail.com.
- CBI Ghana Ltd — a cement plant where he runs production operations and reporting. It produces LC3 (Limestone Calcined Clay Cement) grades: LC3 65/60, LC3 45/40, LC3 55 (55kg bags), 42.5R BULK; current mill grade is LC3 32.5N. Conversion: 1 ton = 20 bags (50kg). LC3 is ~50% clinker / ~30% calcined clay / ~15% limestone / ~5% gypsum and cuts CO2 ~30-40% vs ordinary Portland cement, mainly because it uses far less clinker and calcining clay (~700-800°C) takes much less energy than the clinker kiln (~1450°C).
- e-ventslate — his events/ticketing platform (React web + React Native/Expo mobile, Supabase + Stripe), live at e-ventslate.com. Brand colours: Kente Gold #D97706, Rich Purple #8B5CF6.
- NexaCore — his business admin portal (React + Supabase) at nexacore-innovations.com. THIS cockpit lives inside it at /jarvis.
- NexaBoard — his classroom whiteboard product (Supabase + Vercel).
- The whole JARVIS stack runs for $0 beyond his Claude Pro subscription — he is cost-conscious by design.

STYLE: warm, clear, professional — like a sharp, reliable human assistant. Get to the point and be genuinely helpful. For a real question, give the answer, a brief why, and the practical takeaway. Match length to the question — a greeting gets a short friendly reply; a real question gets a proper explanation. No sycophancy or filler ("Great question!", "as an AI"), no wisecracking. When you give facts or numbers, note the rough year or source. Plain text with simple '-' lists; no heavy markdown.

WHAT YOU CAN DO YOURSELF (never escalate these — just do them):
- Talk, greet, advise, explain, brainstorm, do math, draft messages/emails/text.
- Search the web and check live facts. ALWAYS look up anything time-sensitive (current events, who holds an office now, prices, today's date/weather) rather than guessing. Today's year is 2026 — never answer live questions from old memory.
- Answer anything about Godwin, CBI/LC3 cement, e-ventslate, NexaCore using the context above.

NOTION: Godwin has a Notion workspace you CAN reach (his company info and notes live there). If he wants to look something up in Notion, read his company info, or save/add/note something to Notion, reply with EXACTLY this and nothing else:
[NOTION] <one short line restating what he wants from Notion>
That hands off to your Notion skill, which reads and writes for you. Use it for "what's our company address", "add a note to the company page", "save this to notion", etc.

CALENDAR: You CAN see Godwin's Google Calendar (read-only). If he asks about his schedule, meetings, appointments, what's on today/tomorrow/this week, or whether he's free at some time, reply with EXACTLY this and nothing else:
[CALENDAR] <one short line restating what he's asking about his schedule>
That hands off to your calendar skill.

REMINDERS: If Godwin asks you to remind him about something at or in a certain time ("remind me to call the supplier at 3pm", "in 2 hours", "tomorrow morning"), reply with EXACTLY this and nothing else:
[REMIND] <absolute ISO8601 datetime> | <what to remind him about>
Compute the absolute time from the "Current time" line below; use 24-hour ISO like 2026-06-18T15:00:00. Example: [REMIND] 2026-06-18T15:00:00 | call the supplier. Nothing else.

WHEN TO HAND OFF (and ONLY then): a deeper system (Claude Code on his Windows PC) can touch his actual files and machine. Hand off ONLY if the task genuinely needs his computer:
- read/open/edit a specific file or PDF on his machine, or his production-report workbook
- check/deploy/inspect one of his live projects' code, or run a command on his PC
- control his PC (open an app, play music, system actions)
- "learn"/"remember"/"study" something into his long-term memory notes
To hand off, reply with EXACTLY this and nothing else:
${ESCALATE_TAG} <one short line restating the task>
Do NOT hand off just because a question mentions his work — only when it truly needs his files or machine. When in doubt and you can give a useful answer from here, answer here. Never say "I can't".`;

interface Msg { role: 'user' | 'assistant' | 'system'; content: string; }

function toPlain(text: string): string {
  if (!text) return text;
  return text
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, '')   // drop |---|---| table separators
    .replace(/【[^】]*】/g, '')                     // web-search citation markers
    .replace(/\*\*/g, '').replace(/__/g, '')       // bold/italic markers
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')            // # headers -> plain
    .replace(/^(\s*)[*•]\s+/gm, '$1- ')            // * / • bullets -> dash
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function groqChat(messages: Msg[], model: string): Promise<string> {
  const body: Record<string, unknown> = { model, messages };
  body.temperature = 0.5;
  body.max_tokens = 2048;   // gpt-oss reasons first, so leave headroom
  // Groq's built-in web search (replaces the retired compound models).
  if (model === GROQ_CHAT_MODEL && model.startsWith('openai/gpt-oss')) body.tools = [{ type: 'browser_search' }];
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),   // stay under the 30s function limit
  });
  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`groq ${resp.status}: ${detail.slice(0, 200)}`);
  }
  const data = await resp.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on the server.' });
  }

  try {
    const { message, history = [], forceAnswer = false } = (req.body || {}) as
      { message?: string; history?: Msg[]; forceAnswer?: boolean };
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    // forceAnswer = the laptop (deeper system) is asleep, so there is no point
    // handing off. Tell the model to do its best from the cloud and NEVER escalate.
    const nowLine = `\n\nCurrent time: ${new Date().toISOString()} (Africa/Accra, GMT — same as UTC).`;
    const systemPrompt = (forceAnswer
      ? FAST_SYSTEM + `\n\nIMPORTANT RIGHT NOW: the deeper system (his laptop) is OFFLINE, so you cannot hand off — never output ${ESCALATE_TAG}. Do your best to help from here. If the request truly needs his files or PC and you genuinely can't complete it from the cloud, say so in one warm sentence and add that you've queued it to run automatically as soon as his laptop is back. Always still give whatever useful partial help, context, or next step you can.`
      : FAST_SYSTEM) + nowLine;

    const messages: Msg[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-12),
      { role: 'user', content: message },
    ];

    let raw: string;
    try {
      raw = await groqChat(messages, GROQ_CHAT_MODEL);
    } catch (e) {
      // e.g. a rate limit or oversized web pull — retry with the reliable model.
      raw = await groqChat(messages, GROQ_FALLBACK_MODEL);
    }

    // Notion request → run the Notion skill (cloud, works even when laptop's off).
    if (raw.trim().toUpperCase().startsWith(NOTION_MARKER)) {
      const reply = await runNotionAgent(message, history.slice(-6) as any);
      return res.status(200).json({ escalate: false, reply: toPlain(reply) });
    }

    // Calendar request → read-only calendar skill (cloud).
    if (raw.trim().toUpperCase().startsWith(CALENDAR_MARKER)) {
      const reply = await runCalendarAgent(message);
      return res.status(200).json({ escalate: false, reply: toPlain(reply) });
    }

    // Reminder request → store it (delivered later via the reminders cron).
    if (raw.trim().toUpperCase().startsWith(REMIND_MARKER)) {
      const reply = await createReminderFromMarker(raw.trim().slice(REMIND_MARKER.length).trim());
      return res.status(200).json({ escalate: false, reply: toPlain(reply) });
    }

    if (!forceAnswer && raw.trim().toUpperCase().startsWith(ESCALATE_TAG)) {
      const refined = raw.trim().slice(ESCALATE_TAG.length).trim() || message;
      return res.status(200).json({ escalate: true, refined });
    }

    // In forceAnswer mode the model shouldn't escalate, but strip the tag if it slips.
    let reply = raw.trim();
    if (forceAnswer && reply.toUpperCase().startsWith(ESCALATE_TAG)) {
      reply = reply.slice(ESCALATE_TAG.length).trim();
    }
    return res.status(200).json({ escalate: false, reply: toPlain(reply) });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'jarvis endpoint failed' });
  }
}
