// Invites a team member by email and sets their role.
//
// Runs server-side so the admin's own browser session is never touched (a
// client-side signUp can replace it) and no temporary password is needed:
// Supabase emails an invite link and the member chooses their own password.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TEAM_ROLES = ['admin', 'project_manager', 'operations_manager', 'developer', 'support', 'staff', 'member'];
const SITE_URL = 'https://www.nexacore-innovations.com';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const email = String(req.body?.email || '').trim().toLowerCase();
  const fullName = String(req.body?.full_name || '').trim().slice(0, 120);
  const role = String(req.body?.role || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
    return res.status(400).json({ error: 'A valid email and full name are required.' });
  }
  if (!TEAM_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  let userId = existing?.id as string | undefined;
  let invited = false;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, app: 'nexacore' },
      redirectTo: `${SITE_URL}/auth/reset-password`,
    });
    if (error || !data?.user) {
      console.error('[invite-member]', error?.message);
      return res.status(400).json({ error: error?.message || 'Could not send the invitation.' });
    }
    userId = data.user.id;
    invited = true;
  }

  // The signup trigger creates the profile as 'member'; set the chosen role.
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, email, full_name: fullName, role, status: 'approved' }, { onConflict: 'id' });

  if (profileError) {
    console.error('[invite-member] profile', profileError.message);
    return res.status(500).json({ error: 'The invitation was sent but the role could not be saved.' });
  }

  return res.status(200).json({ success: true, invited });
}
