// Verifies the caller of an admin endpoint.
//
// The admin handlers run with the service role key, which bypasses row level
// security, so the caller's identity must come from a verified Supabase access
// token (Bearer header), never from ids in the request body.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface AdminCaller {
  id: string;
  email: string | null;
  role: string;
}

export class AdminAuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireRole(req: any, roles: readonly string[]): Promise<AdminCaller> {
  const auth = String(req.headers?.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) throw new AdminAuthError(401, 'Sign in to perform this action.');

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) throw new AdminAuthError(401, 'Your session has expired. Sign in again.');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile || profile.status !== 'approved' || !roles.includes(profile.role)) {
    throw new AdminAuthError(403, 'Insufficient permissions.');
  }

  return { id: data.user.id, email: data.user.email ?? null, role: profile.role };
}
