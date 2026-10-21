import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTodayAgenda } from '../_lib/calendar.js';

/**
 * JARVIS proactive morning briefing — runs on a Vercel Cron (always-on, $0).
 *
 * Once a day it builds a short, useful briefing (greeting, today's date, Accra
 * weather looked up live, and Godwin's pending JARVIS tasks) and pushes it to
 * him on Telegram. Because it's a cloud cron, it fires whether or not his laptop
 * is on.
 *
 * Schedule is set in vercel.json (crons). Vercel calls this with an
 * `Authorization: Bearer ${CRON_SECRET}` header, which we verify so only the
 * cron (not the public) can trigger a briefing.
 *
 * Env: CRON_SECRET, TELEGRAM_BOT_TOKEN, ALLOWED_USERS, GROQ_API_KEY,
 *      VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */

export const config = { maxDuration: 60 };

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ALLOWED = (process.env.ALLOWED_USERS || '').split(',').map((s) => s.trim()).filter(Boolean);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';

interface Msg { role: 'user' | 'assistant' | 'system'; content: string; }

function toPlain(text: string): string {
  if (!text) return text;
  return text
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, '')
    .replace(/【[^】]*】/g, '')                     // web-search citation markers
    .replace(/\*\*/g, '').replace(/__/g, '')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^(\s*)[*•]\s+/gm, '$1- ')
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
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(50000),
  });
  if (!resp.ok) throw new Error(`groq ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function tgSend(chatId: number, text: string): Promise<void> {
  const clean = toPlain(text) || '(empty briefing)';
  for (let i = 0; i < clean.length; i += 4000) {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: clean.slice(i, i + 4000) }),
    });
  }
}

async function sbGet(query: string): Promise<any[]> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/jarvis_tasks?${query}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!resp.ok) return [];
  return (await resp.json()) as any[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only the Vercel cron (which sends the secret) may trigger a briefing.
  if (CRON_SECRET && req.headers['authorization'] !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ ok: false });
  }
  const chatId = Number(ALLOWED[0]);
  if (!chatId) return res.status(500).json({ ok: false, error: 'no recipient (ALLOWED_USERS)' });

  // Gather his open JARVIS tasks and what got done in the last 24h.
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [pending, recentDone, agenda] = await Promise.all([
    sbGet('status=in.(queued,running)&select=request,status&order=created_at.asc&limit=15'),
    sbGet(`status=eq.done&finished_at=gte.${since}&select=request&order=finished_at.desc&limit=10`),
    getTodayAgenda(),
  ]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Accra',
  });
  const pendingList = pending.length
    ? pending.map((t) => `- ${String(t.request).slice(0, 120)}${t.status === 'running' ? ' (in progress)' : ''}`).join('\n')
    : '(nothing pending)';

  const agendaList = agenda.length ? agenda.join('\n') : '(no events on the calendar today)';

  const prompt = `Write Godwin a short morning briefing for ${today}. Keep it warm but brief and genuinely useful — plain text, no markdown, readable on a phone.
Include, in this order:
1. A one-line greeting that names the day.
2. Today's weather in Accra, Ghana — look it up so it's current (temperature range and whether rain is likely).
3. Today's calendar, exactly as listed below (or note the day looks clear if none).
4. His open JARVIS tasks, exactly as listed below (or note he's all clear if none).
5. One short, practical closing line.
Do not invent tasks or events you don't have. Do not pad it.

Today's calendar:
${agendaList}

His open JARVIS tasks:
${pendingList}

Tasks JARVIS completed for him in the last 24h: ${recentDone.length}.`;

  let briefing: string;
  try {
    try {
      briefing = await groqChat([{ role: 'user', content: prompt }], GROQ_CHAT_MODEL);
    } catch {
      briefing = await groqChat([{ role: 'user', content: prompt }], GROQ_FALLBACK_MODEL);
    }
  } catch {
    // Total AI failure → still send a useful plain briefing.
    briefing = `Good morning, Godwin. Today is ${today}.\n\nToday's calendar:\n${agendaList}\n\nYour open JARVIS tasks:\n${pendingList}`;
  }

  await tgSend(chatId, briefing);

  // Play Console review watch — a guaranteed cloud nudge that fires even when the
  // laptop (and its real status-checker) is off. Turn off by clearing the
  // PLAY_REVIEW_WATCH env var once the app is approved/published.
  if (process.env.PLAY_REVIEW_WATCH) {
    await tgSend(
      chatId,
      '📱 Reminder: e-ventslate is still awaiting Google Play review. ' +
        'If the laptop was on, JARVIS already checked the real status this morning. ' +
        'Open the console to confirm: ' +
        'https://play.google.com/console/u/0/developers/6606725871800004427/app/4974916411888382445/app-dashboard',
    );
  }

  return res.status(200).json({ ok: true, sent: true });
}
