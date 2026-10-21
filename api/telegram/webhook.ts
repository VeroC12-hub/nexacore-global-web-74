import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * JARVIS Telegram webhook — the ALWAYS-ON phone brain.
 *
 * This replaces the laptop-bound polling bot (bot.py). Because it runs on
 * Vercel, JARVIS now answers on Telegram 24/7 whether or not Godwin's laptop is
 * on. The fast brain (Groq, same as the /jarvis cockpit) answers everyday things
 * itself; anything that truly needs his files/PC is queued to `jarvis_tasks`,
 * and the laptop worker delivers the result back to Telegram when it runs.
 *
 * Telegram is configured to POST updates here (setWebhook). We verify the
 * secret-token header so only Telegram can call it, and ALLOWED_USERS so only
 * Godwin can use it.
 *
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, ALLOWED_USERS (comma ids),
 *      GROQ_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */

import { runNotionAgent, NOTION_MARKER } from '../_lib/notion.js';
import { runCalendarAgent, CALENDAR_MARKER } from '../_lib/calendar.js';
import { createReminderFromMarker, REMIND_MARKER } from '../_lib/reminders.js';

export const config = { maxDuration: 60 };

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const ALLOWED = (process.env.ALLOWED_USERS || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';
const GROQ_STT_MODEL = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo';
const ESCALATE_TAG = '[ESCALATE]';

// "learn"/"study" must go to the laptop worker — only it can research and write
// a note to the knowledge base. Heavy prefixes force the worker too.
const LEARN_PREFIXES = ['learn ', '/learn ', 'study ', 'research and remember '];
const HEAVY_PREFIXES = ['[do]', '[deep]', '[agent]'];

const FAST_SYSTEM = `You are JARVIS, Godwin's personal AI, replying inside Telegram.

WHO YOU'RE HELPING (use this for context on every task — tailor answers to his world):
- Godwin Ocloo — engineer and founder, based in Ghana. Email: godwinocloo21@gmail.com.
- CBI Ghana Ltd — a cement plant where he runs production operations and reporting. It produces LC3 (Limestone Calcined Clay Cement) grades: LC3 65/60, LC3 45/40, LC3 55 (55kg bags), 42.5R BULK; current mill grade is LC3 32.5N. Conversion: 1 ton = 20 bags (50kg). LC3 is ~50% clinker / ~30% calcined clay / ~15% limestone / ~5% gypsum and cuts CO2 ~30-40% vs ordinary Portland cement.
- e-ventslate — his events/ticketing platform (React web + React Native/Expo mobile, Supabase + Stripe), live at e-ventslate.com.
- NexaCore — his business admin portal (React + Supabase) at nexacore-innovations.com, with a /jarvis cockpit.
- NexaBoard — his classroom whiteboard product.
- The whole JARVIS stack runs for $0 beyond his Claude Pro subscription — he is cost-conscious by design.

STYLE: warm, clear, professional — like a sharp, reliable human assistant. Get to the point. For a real question give the answer, a brief why, and the practical takeaway; match length to the question. No sycophancy or filler ("Great question!", "as an AI"), no wisecracking. Note the rough year/source for facts. Telegram shows NO markdown — never use **bold**, *, #, or pipe | tables; use plain sentences and simple '-' lists, readable on a phone. Always reply in English.

WHAT YOU CAN DO YOURSELF (never escalate these — just do them): talk, greet, advise, explain, brainstorm, do math, draft messages/emails. Search the web and check live facts — ALWAYS look up anything time-sensitive (current events, who holds an office now, prices, today's date/weather) rather than guessing. Today's year is 2026. Answer anything about Godwin, CBI/LC3, e-ventslate, NexaCore from the context above.

NOTION: Godwin has a Notion workspace you CAN reach (his company info and notes live there). If he wants to look something up in Notion, read his company info, or save/add/note something to Notion, reply with EXACTLY this and nothing else:
${NOTION_MARKER} <one short line restating what he wants from Notion>
That hands off to your Notion skill. Use it for "what's our company address", "add a note to the company page", "save this to notion", etc.

CALENDAR: You CAN see Godwin's Google Calendar (read-only). If he asks about his schedule, meetings, appointments, what's on today/tomorrow/this week, or whether he's free at some time, reply with EXACTLY this and nothing else:
${CALENDAR_MARKER} <one short line restating what he's asking about his schedule>

REMINDERS: If Godwin asks you to remind him about something at or in a certain time ("remind me to call the supplier at 3pm", "in 2 hours", "tomorrow morning"), reply with EXACTLY this and nothing else:
${REMIND_MARKER} <absolute ISO8601 datetime> | <what to remind him about>
Compute the absolute time from the "Current time" line below; use 24-hour ISO like 2026-06-18T15:00:00. Nothing else.

WHEN TO HAND OFF (and ONLY then): a deeper system (Claude Code on his Windows PC) can touch his actual files and machine. Hand off ONLY if the task genuinely needs his computer: read/open/edit a file or PDF on his machine or his production-report workbook; check/deploy/inspect a project's code or run a command; control his PC (open an app, play music). To hand off, reply with EXACTLY this and nothing else:
${ESCALATE_TAG} <one short line restating the task>
Do NOT hand off just because a question mentions his work — only when it truly needs his files or machine. When in doubt and you can answer usefully from here, answer here. Never say "I can't".`;

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

async function fastAnswer(text: string): Promise<string> {
  const nowLine = `\n\nCurrent time: ${new Date().toISOString()} (Africa/Accra, GMT — same as UTC).`;
  const messages: Msg[] = [
    { role: 'system', content: FAST_SYSTEM + nowLine },
    { role: 'user', content: text },
  ];
  try {
    return await groqChat(messages, GROQ_CHAT_MODEL);
  } catch {
    return await groqChat(messages, GROQ_FALLBACK_MODEL);
  }
}

async function tgSend(chatId: number, text: string): Promise<void> {
  const clean = toPlain(text) || '(no reply)';
  for (let i = 0; i < clean.length; i += 4000) {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: clean.slice(i, i + 4000) }),
    });
  }
}

async function tgTyping(chatId: number): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
    });
  } catch { /* best effort */ }
}

async function transcribeVoice(fileId: string): Promise<string> {
  // 1) resolve the file path, 2) download bytes, 3) Groq Whisper.
  const info = await (await fetch(
    `https://api.telegram.org/bot${TG_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`,
  )).json();
  const filePath = info?.result?.file_path;
  if (!filePath) throw new Error('could not resolve voice file');
  const audio = await (await fetch(`https://api.telegram.org/file/bot${TG_TOKEN}/${filePath}`)).arrayBuffer();
  const form = new FormData();
  form.append('file', new Blob([audio], { type: 'audio/ogg' }), 'voice.ogg');
  form.append('model', GROQ_STT_MODEL);
  form.append('response_format', 'text');
  // Force English — Whisper auto-detect often mis-reads Ghanaian-accented English
  // as another language, which then makes the bot reply in that language too.
  form.append('language', 'en');
  form.append('prompt', 'Transcribe in English. Context: Godwin, CBI Ghana, LC3 cement, e-ventslate, NexaCore.');
  const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });
  if (!resp.ok) throw new Error(`groq stt ${resp.status}`);
  return (await resp.text()).trim();
}

async function queueHeavy(request: string, chatId: number): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/jarvis_tasks`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      source: 'telegram', request, status: 'queued', chat_id: chatId, notified: false,
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always 200 to Telegram so it doesn't retry; we do the work first within budget.
  if (req.method !== 'POST') return res.status(200).json({ ok: true });
  if (WEBHOOK_SECRET && req.headers['x-telegram-bot-api-secret-token'] !== WEBHOOK_SECRET) {
    return res.status(401).json({ ok: false });
  }

  const update: any = req.body || {};
  const msg = update.message || update.edited_message;
  const chatId: number | undefined = msg?.chat?.id;
  const fromId = msg?.from?.id;

  if (!chatId) return res.status(200).json({ ok: true });
  if (ALLOWED.length && !ALLOWED.includes(String(fromId))) {
    return res.status(200).json({ ok: true }); // not Godwin — ignore silently
  }

  try {
    // Slash commands.
    if (typeof msg.text === 'string' && msg.text.startsWith('/start')) {
      await tgSend(chatId, "JARVIS here — always on now, even when your laptop's off. Ask me anything, send a voice note, or ask me to do something on your machine and I'll queue it.");
      return res.status(200).json({ ok: true });
    }

    let text: string | undefined = typeof msg.text === 'string' ? msg.text : undefined;

    // Voice / audio → transcribe to text.
    const voice = msg.voice || msg.audio;
    if (!text && voice?.file_id) {
      await tgTyping(chatId);
      try {
        text = await transcribeVoice(voice.file_id);
        if (text) await tgSend(chatId, `🎙️ "${text}"`);
      } catch {
        await tgSend(chatId, "I couldn't transcribe that voice note — mind typing it?");
        return res.status(200).json({ ok: true });
      }
    }

    // Attachments aren't supported in always-on cloud mode yet.
    if (!text && (msg.document || msg.photo)) {
      await tgSend(chatId, "I can't process file attachments from the cloud yet — send it through the web cockpit at nexacore-innovations.com/jarvis, or paste the text here.");
      return res.status(200).json({ ok: true });
    }

    if (!text || !text.trim()) return res.status(200).json({ ok: true });

    const lowered = text.toLowerCase();
    const isLearn = LEARN_PREFIXES.some((p) => lowered.startsWith(p));
    const forcedHeavy = isLearn || HEAVY_PREFIXES.some((p) => lowered.startsWith(p));

    if (forcedHeavy) {
      await queueHeavy(text, chatId);
      await tgSend(chatId, isLearn
        ? "📚 Learning that now — I'll research it, save a note, and reply here when it's ready (needs your laptop)."
        : "🔧 On it — this needs your machine. I'll reply here when it's done.");
      return res.status(200).json({ ok: true });
    }

    await tgTyping(chatId);
    const raw = await fastAnswer(text);

    if (raw.trim().toUpperCase().startsWith(NOTION_MARKER)) {
      const reply = await runNotionAgent(text);
      await tgSend(chatId, reply);
      return res.status(200).json({ ok: true });
    }

    if (raw.trim().toUpperCase().startsWith(CALENDAR_MARKER)) {
      const reply = await runCalendarAgent(text);
      await tgSend(chatId, reply);
      return res.status(200).json({ ok: true });
    }

    if (raw.trim().toUpperCase().startsWith(REMIND_MARKER)) {
      const reply = await createReminderFromMarker(raw.trim().slice(REMIND_MARKER.length).trim(), chatId);
      await tgSend(chatId, reply);
      return res.status(200).json({ ok: true });
    }

    if (raw.trim().toUpperCase().startsWith(ESCALATE_TAG)) {
      const refined = raw.trim().slice(ESCALATE_TAG.length).trim() || text;
      await queueHeavy(refined, chatId);
      await tgSend(chatId, "🔧 On it — this needs your files or machine. I'll reply here when it's done (if your laptop's asleep, it'll run as soon as it's back).");
      return res.status(200).json({ ok: true });
    }

    await tgSend(chatId, raw);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    try { await tgSend(chatId, `⚠️ Something glitched on my end: ${String(err?.message || err).slice(0, 200)}`); } catch { /* ignore */ }
    return res.status(200).json({ ok: true });
  }
}
