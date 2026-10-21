/**
 * Web Push for JARVIS — lets the installed PWA show its own notifications on the
 * phone (works on Android installed PWAs; iOS 16.4+ installed PWAs too).
 *
 * Subscriptions are stored as rows in `jarvis_memory` (topic='push_subscription',
 * fact = JSON push subscription) so no new table is needed. Dead subscriptions
 * (404/410) are pruned automatically.
 *
 * Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, Supabase service key.
 */

import webpush from 'web-push';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

let configured = false;
function ensureVapid(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:godwinocloo21@gmail.com', pub, priv);
  configured = true;
  return true;
}

async function sb(path: string, method = 'GET', body?: unknown): Promise<any> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=minimal' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok && method === 'GET') return [];
  return method === 'GET' ? resp.json().catch(() => []) : null;
}

/** Save a browser push subscription (dedup by endpoint). */
export async function saveSubscription(sub: any): Promise<void> {
  const endpoint = sub?.endpoint;
  if (!endpoint) throw new Error('invalid subscription');
  // Remove any existing row with the same endpoint, then insert fresh.
  const rows = await sb(`jarvis_memory?topic=eq.push_subscription&select=id,fact`);
  for (const r of rows || []) {
    try { if (JSON.parse(r.fact)?.endpoint === endpoint) await sb(`jarvis_memory?id=eq.${r.id}`, 'DELETE'); } catch { /* ignore */ }
  }
  await sb('jarvis_memory', 'POST', { topic: 'push_subscription', fact: JSON.stringify(sub) });
}

/** Send a notification to every saved subscription. Prunes dead ones. */
export async function sendPushToAll(title: string, body: string, url = '/jarvis'): Promise<number> {
  if (!ensureVapid()) return 0;
  const rows = await sb('jarvis_memory?topic=eq.push_subscription&select=id,fact');
  let sent = 0;
  const payload = JSON.stringify({ title, body, url });
  for (const r of rows || []) {
    let sub: any;
    try { sub = JSON.parse(r.fact); } catch { continue; }
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (e: any) {
      const code = e?.statusCode;
      if (code === 404 || code === 410) await sb(`jarvis_memory?id=eq.${r.id}`, 'DELETE'); // expired
    }
  }
  return sent;
}
