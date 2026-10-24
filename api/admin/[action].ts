// Single entry point for the admin endpoints. Vercel's Hobby plan allows at
// most 12 serverless functions, so the admin handlers live in api/_lib/admin
// (not counted as functions) and this dynamic route dispatches to them.
// URLs are unchanged: /api/admin/delete-user, /api/admin/seed-keba-proposal,
// /api/admin/send-project-emails (see the rewrite in vercel.json).
import deleteUser from '../_lib/admin/delete-user.js';
import seedKebaProposal from '../_lib/admin/seed-keba-proposal.js';
import sendProjectEmails from '../_lib/admin/send-project-emails.js';

const handlers: Record<string, (req: any, res: any) => unknown> = {
  'delete-user': deleteUser,
  'seed-keba-proposal': seedKebaProposal,
  'send-project-emails': sendProjectEmails,
};

export default async function handler(req: any, res: any) {
  const action = String(req.query?.action ?? '');
  const route = handlers[action];
  if (!route) {
    return res.status(404).json({ error: 'Unknown admin action' });
  }
  return route(req, res);
}
