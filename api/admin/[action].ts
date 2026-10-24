// Single entry point for the admin endpoints. Vercel's Hobby plan allows at
// most 12 serverless functions, so the admin handlers live in api/_lib/admin
// (not counted as functions) and this dynamic route dispatches to them.
// URLs are unchanged: /api/admin/delete-user, /api/admin/seed-keba-proposal,
// /api/admin/send-project-emails, /api/admin/invite-member (see the rewrite in vercel.json).
//
// Every action requires a verified Supabase session with one of the listed
// roles. The verified caller is passed to the handler as req.adminCaller.
import deleteUser from '../_lib/admin/delete-user.js';
import seedKebaProposal from '../_lib/admin/seed-keba-proposal.js';
import sendProjectEmails from '../_lib/admin/send-project-emails.js';
import inviteMember from '../_lib/admin/invite-member.js';
import { requireRole, AdminAuthError } from '../_lib/admin/auth.js';

const MANAGERS = ['admin', 'project_manager', 'operations_manager'] as const;

const handlers: Record<string, { roles: readonly string[]; run: (req: any, res: any) => unknown }> = {
  'delete-user': { roles: ['admin'], run: deleteUser },
  'seed-keba-proposal': { roles: ['admin'], run: seedKebaProposal },
  'send-project-emails': { roles: MANAGERS, run: sendProjectEmails },
  'invite-member': { roles: ['admin'], run: inviteMember },
};

export default async function handler(req: any, res: any) {
  const action = String(req.query?.action ?? '');
  const route = handlers[action];
  if (!route) {
    return res.status(404).json({ error: 'Unknown admin action' });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  try {
    req.adminCaller = await requireRole(req, route.roles);
  } catch (err: any) {
    if (err instanceof AdminAuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[admin auth]', err?.message || err);
    return res.status(500).json({ error: 'Could not verify your session.' });
  }

  return route.run(req, res);
}
