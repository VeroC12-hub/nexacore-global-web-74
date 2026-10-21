import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dueReminders, markDelivered, whenLabel } from '../_lib/reminders.js';
import { sendPushToAll } from '../_lib/push.js';

/**
 * Delivers due reminders. Meant to be pinged every minute by a free external
 * cron (e.g. cron-job.org) since Vercel Hobby cron only runs once/day. Protected
 * by CRON_SECRET (Authorization: Bearer <secret>  OR  ?key=<secret>).
 *
 * Each due reminder is sent to Godwin on Telegram + as a Web Push notification,
 * then marked delivered.
 */

export const config = { maxDuration: 30 };

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ALLOWED = (process.env.ALLOWED_USERS || '').split(',').map((s) => s.trim()).filter(Boolean);
const CRON_SECRET = process.env.CRON_SECRET || '';

async function tgSend(chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = (req.query?.key as string) || '';
  const authed = !CRON_SECRET || req.headers['authorization'] === `Bearer ${CRON_SECRET}` || key === CRON_SECRET;
  if (!authed) return res.status(401).json({ ok: false });

  let due;
  try { due = await dueReminders(); } catch (e: any) { return res.status(500).json({ ok: false, error: String(e?.message || e) }); }

  let sent = 0;
  for (const r of due) {
    const msg = `⏰ Reminder: ${r.text}\n(set for ${whenLabel(r.due_at)})`;
    const chatId = r.chat_id || Number(ALLOWED[0]);
    try {
      if (chatId) await tgSend(chatId, msg);
      await sendPushToAll('⏰ Reminder', r.text);
      await markDelivered(r);
      sent++;
    } catch { /* leave undelivered → retried next tick */ }
  }
  return res.status(200).json({ ok: true, checked: due.length, sent });
}
