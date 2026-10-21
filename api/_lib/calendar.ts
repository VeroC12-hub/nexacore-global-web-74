/**
 * Read-only Google Calendar skill for the JARVIS cloud brain.
 *
 * Uses the calendar's private "Secret address in iCal format" (.ics) URL — no
 * OAuth, no password, $0, laptop-independent. Read-only by design (the full
 * read/write path via Google OAuth is a later upgrade).
 *
 * The main brain emits `[CALENDAR] <intent>` and the caller hands off to
 * `runCalendarAgent()`, which fetches the feed, filters to the relevant window,
 * and answers the question. `getTodayAgenda()` is reused by the morning briefing.
 *
 * Env: CALENDAR_ICAL_URL (the secret iCal URL), GROQ_API_KEY.
 * Ghana is GMT (UTC+0, no DST), so times are shown in Africa/Accra ≈ UTC.
 */

const ICAL_URL = process.env.CALENDAR_ICAL_URL || '';
const TZ = 'Africa/Accra';

export const CALENDAR_MARKER = '[CALENDAR]';

interface Ev { start: Date; end?: Date; allDay: boolean; summary: string; location?: string; rrule?: string; }

function unfold(ics: string): string[] {
  // ICS folds long lines by starting continuations with a space or tab.
  return ics.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}

function parseDt(value: string, isDate: boolean): Date {
  if (isDate || /^\d{8}$/.test(value)) {
    const y = +value.slice(0, 4), m = +value.slice(4, 6), d = +value.slice(6, 8);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return new Date(value);
  const [, y, mo, d, h, mi, s, z] = m;
  // Treat both Z and floating/TZID times as UTC — fine for Ghana (GMT).
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
}

function parseICS(ics: string): Ev[] {
  const lines = unfold(ics);
  const events: Ev[] = [];
  let cur: Partial<Ev> | null = null;
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) { cur = {}; continue; }
    if (line.startsWith('END:VEVENT')) {
      if (cur && cur.start && cur.summary) events.push(cur as Ev);
      cur = null; continue;
    }
    if (!cur) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const left = line.slice(0, idx);
    const val = line.slice(idx + 1);
    const name = left.split(';')[0].toUpperCase();
    if (name === 'DTSTART') { cur.allDay = /VALUE=DATE/.test(left) || /^\d{8}$/.test(val); cur.start = parseDt(val, cur.allDay); }
    else if (name === 'DTEND') { cur.end = parseDt(val, /VALUE=DATE/.test(left)); }
    else if (name === 'SUMMARY') cur.summary = val.replace(/\\,/g, ',').replace(/\\n/g, ' ').trim();
    else if (name === 'LOCATION') cur.location = val.replace(/\\,/g, ',').trim();
    else if (name === 'RRULE') cur.rrule = val;
  }
  return events;
}

function ymd(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

// Does a (possibly recurring) event occur on the target day? Simple expansion:
// non-recurring exact match; DAILY/WEEKLY/MONTHLY basic checks (good enough for v1).
function occursOn(ev: Ev, target: Date): boolean {
  const t = ymd(target);
  if (ymd(ev.start) === t) return true;
  if (!ev.rrule) return false;
  if (target < new Date(ymd(ev.start) + 'T00:00:00Z')) return false;
  const until = ev.rrule.match(/UNTIL=(\d{8})/);
  if (until) { const u = `${until[1].slice(0,4)}-${until[1].slice(4,6)}-${until[1].slice(6,8)}`; if (t > u) return false; }
  const freq = (ev.rrule.match(/FREQ=([A-Z]+)/) || [])[1];
  const sDow = ev.start.getUTCDay(), tDow = target.getUTCDay();
  const sDom = ev.start.getUTCDate(), tDom = target.getUTCDate();
  if (freq === 'DAILY') return true;
  if (freq === 'WEEKLY') {
    const byday = ev.rrule.match(/BYDAY=([A-Z,]+)/);
    if (byday) { const map: any = { SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6 }; return byday[1].split(',').some((d) => map[d] === tDow); }
    return sDow === tDow;
  }
  if (freq === 'MONTHLY') return sDom === tDom;
  return false;
}

function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
}

function eventsOnDay(events: Ev[], target: Date): string[] {
  return events
    .filter((e) => occursOn(e, target))
    .sort((a, b) => (a.allDay === b.allDay ? a.start.getTime() - b.start.getTime() : a.allDay ? -1 : 1))
    .map((e) => {
      const when = e.allDay ? 'All day' : `${fmtTime(e.start)}${e.end ? '–' + fmtTime(e.end) : ''}`;
      return `- ${when}: ${e.summary}${e.location ? ` (${e.location})` : ''}`;
    });
}

async function fetchEvents(): Promise<Ev[]> {
  if (!ICAL_URL) throw new Error('no calendar url');
  const resp = await fetch(ICAL_URL, { signal: AbortSignal.timeout(15000) });
  if (!resp.ok) throw new Error(`ical ${resp.status}`);
  return parseICS(await resp.text());
}

/** Today's agenda as plain lines (used by the morning briefing). Empty array if none. */
export async function getTodayAgenda(): Promise<string[]> {
  try {
    const events = await fetchEvents();
    return eventsOnDay(events, new Date());
  } catch {
    return [];
  }
}

/** Answer a calendar question using the feed. */
export async function runCalendarAgent(request: string): Promise<string> {
  if (!ICAL_URL) return "Your calendar isn't connected yet, so I can't see your schedule.";
  let events: Ev[];
  try { events = await fetchEvents(); }
  catch { return "I couldn't reach your calendar feed just now — try again in a moment."; }

  // Build a compact agenda for today + the next 10 days for context.
  const today = new Date();
  const lines: string[] = [];
  for (let i = 0; i < 11; i++) {
    const day = new Date(today.getTime() + i * 86400000);
    const evs = eventsOnDay(events, day);
    if (evs.length) {
      const label = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short' }).format(day);
      lines.push(`${label}:`, ...evs);
    }
  }
  const agenda = lines.length ? lines.join('\n') : '(no events found in the next 10 days)';
  const todayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(today);

  // A deterministic answer we can always fall back to (no LLM needed). Today's
  // events if any, else the upcoming agenda.
  const todayList = eventsOnDay(events, today);
  const deterministic = todayList.length
    ? `Today (${todayLabel}):\n${todayList.join('\n')}`
    : `Nothing on your calendar today (${todayLabel}). Coming up:\n${agenda}`;

  try {
    // Light model first (the 70B model has a small daily token cap on the free tier).
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_CAL_MODEL || 'openai/gpt-oss-20b',
        temperature: 0.3, max_tokens: 1500,
        messages: [
          { role: 'system', content: `You are JARVIS answering Godwin about his calendar. Today is ${todayLabel} (Africa/Accra). Use ONLY the agenda below — do not invent events. If nothing matches the question, say his calendar looks clear for that time. Plain text, concise, no markdown.\n\nAgenda:\n${agenda}` },
          { role: 'user', content: request },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!resp.ok) return deterministic;
    const data = await resp.json();
    return (data.choices?.[0]?.message?.content || deterministic).trim();
  } catch {
    return deterministic;
  }
}
