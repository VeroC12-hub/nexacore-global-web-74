/**
 * Reminders for JARVIS — natural-language reminders that notify Godwin at a set
 * time (via Telegram now, + Web Push once subscribed).
 *
 * No new table needed: reminders are stored as rows in the existing
 * `jarvis_memory` table with topic='reminder' and a JSON `fact` payload
 * { text, due_at (ISO), delivered, chat_id, created_at }.
 *
 * The main brain emits `[REMIND] <ISO due time> | <text>` and the caller stores
 * it. A minute-level cron (`/api/cron/reminders`) delivers due ones.
 *
 * Env: VITE_SUPABASE_URL / SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export const REMIND_MARKER = '[REMIND]';

export interface Reminder { id: string; text: string; due_at: string; delivered: boolean; chat_id?: number; created_at: string; }

async function sb(path: string, method = 'GET', body?: unknown): Promise<any> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`supabase ${resp.status}: ${(await resp.text()).slice(0, 150)}`);
  return method === 'GET' || method === 'POST' ? resp.json().catch(() => []) : null;
}

/** Friendly local-time label for a due timestamp (Accra/GMT). */
function whenLabel(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra', weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(d);
}

/**
 * Parse the brain's `[REMIND] <ISO> | <text>` payload and store the reminder.
 * Returns a confirmation line for the user (or an error note).
 */
export async function createReminderFromMarker(payload: string, chatId?: number): Promise<string> {
  const sep = payload.indexOf('|');
  if (sep === -1) return "I didn't catch when to remind you — try 'remind me to X at 3pm'.";
  const dueRaw = payload.slice(0, sep).trim();
  const text = payload.slice(sep + 1).trim();
  const due = new Date(dueRaw);
  if (isNaN(due.getTime())) return "I couldn't work out the time for that reminder — tell me a clearer time?";
  if (!text) return "What should I remind you about?";
  if (due.getTime() < Date.now() - 60000) return `That time (${whenLabel(due.toISOString())}) is in the past — give me a future time.`;

  await sb('jarvis_memory', 'POST', {
    topic: 'reminder',
    fact: JSON.stringify({ text, due_at: due.toISOString(), delivered: false, chat_id: chatId, created_at: new Date().toISOString() }),
  });
  return `Got it — I'll remind you to ${text} on ${whenLabel(due.toISOString())}.`;
}

/** All reminders (parsed). */
async function allReminders(): Promise<Reminder[]> {
  const rows = await sb('jarvis_memory?topic=eq.reminder&select=id,fact,created_at&order=created_at.asc');
  const out: Reminder[] = [];
  for (const r of rows || []) {
    try { const f = JSON.parse(r.fact); out.push({ id: r.id, ...f }); } catch { /* skip malformed */ }
  }
  return out;
}

/** Reminders that are due now and not yet delivered. */
export async function dueReminders(): Promise<Reminder[]> {
  const now = Date.now();
  return (await allReminders()).filter((r) => !r.delivered && new Date(r.due_at).getTime() <= now);
}

/** Upcoming (not yet delivered, future) reminders — for "what reminders do I have". */
export async function upcomingReminders(): Promise<Reminder[]> {
  return (await allReminders())
    .filter((r) => !r.delivered)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
}

export async function markDelivered(r: Reminder): Promise<void> {
  await sb(`jarvis_memory?id=eq.${r.id}`, 'PATCH', {
    fact: JSON.stringify({ text: r.text, due_at: r.due_at, delivered: true, chat_id: r.chat_id, created_at: r.created_at }),
  });
}

export { whenLabel };
