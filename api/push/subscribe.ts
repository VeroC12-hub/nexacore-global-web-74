import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveSubscription } from '../_lib/push.js';

/**
 * Stores a browser Web Push subscription so JARVIS can send the installed PWA
 * its own notifications (e.g. reminders). Called by the cockpit after the user
 * grants notification permission. Stored in jarvis_memory (no new table).
 */
export const config = { maxDuration: 15 };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { subscription } = (req.body || {}) as { subscription?: any };
    if (!subscription?.endpoint) return res.status(400).json({ error: 'subscription required' });
    await saveSubscription(subscription);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'subscribe failed' });
  }
}
