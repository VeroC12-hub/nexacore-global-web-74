/**
 * Lead capture for the website pitch-bot.
 *
 * The pitch brain emits `[LEAD] name | contact | need` once it has collected a
 * visitor's name, a contact (email or phone), and what they want. This module
 * parses that marker and writes a row to the existing `jarvis_leads` table using
 * the Supabase service key (server-side only, bypasses RLS). Any authenticated
 * admin can then review leads from the dashboard.
 *
 * jarvis_leads columns: name, contact, source, stage (default 'new'), notes,
 * next_action, created_at, updated_at.
 *
 * Env: VITE_SUPABASE_URL / SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export const LEAD_MARKER = '[LEAD]';

export interface LeadInput {
  name?: string;
  contact?: string;
  need?: string;
  source?: string;
}

async function sbInsert(table: string, row: Record<string, unknown>): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase env not configured for lead capture');
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) throw new Error(`supabase ${resp.status}: ${(await resp.text()).slice(0, 150)}`);
}

/** Basic sanity so we don't store obviously empty/garbage leads. */
function looksReal(contact: string): boolean {
  const c = (contact || '').trim();
  const emailish = /\S+@\S+\.\S+/.test(c);
  const phoneish = /(\+?\d[\d\s()-]{6,})/.test(c);
  return emailish || phoneish;
}

/** Store a lead directly (used when the frontend posts a structured lead). */
export async function storeLead(lead: LeadInput): Promise<boolean> {
  const name = (lead.name || '').trim().slice(0, 120) || 'Website visitor';
  const contact = (lead.contact || '').trim().slice(0, 200);
  const need = (lead.need || '').trim().slice(0, 1000);
  if (!looksReal(contact)) return false;
  await sbInsert('jarvis_leads', {
    name,
    contact,
    source: lead.source || 'website-pitchbot',
    stage: 'new',
    notes: need || null,
    next_action: 'Review and reach out',
  });
  return true;
}

/**
 * Parse `name | contact | need` (the text after the [LEAD] marker) and store it.
 * Returns a warm confirmation for the visitor, or null if it couldn't be stored
 * (so the caller can just let the model keep talking).
 */
export async function createLeadFromMarker(payload: string, source = 'website-pitchbot'): Promise<string | null> {
  const parts = payload.split('|').map((s) => s.trim());
  const [name = '', contact = '', ...rest] = parts;
  const need = rest.join(' | ').trim();
  if (!looksReal(contact)) return null;
  try {
    await storeLead({ name, contact, need, source });
  } catch {
    return null;
  }
  const first = (name || '').split(/\s+/)[0] || 'there';
  return `Thanks ${first}, I have passed your details to the NexaCore team and someone will reach out to you shortly. In the meantime, is there anything else I can help you with?`;
}
