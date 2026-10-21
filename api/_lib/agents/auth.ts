/**
 * Auth boundary for the agent runtime.
 *
 * WHY THIS EXISTS: every tool queries with the service role key, which
 * bypasses row level security entirely. So the RLS policies in
 * 20260728000000 protect the browser but protect nothing here. Company
 * scoping has to be enforced in front of the runtime instead, or passing
 * an arbitrary company_id reads another company's data.
 *
 * The rule: a company id supplied by a caller is never trusted. It is
 * checked against the companies the authenticated user actually belongs
 * to, resolved server-side from the database.
 */

const supabaseUrl = () => process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = () => process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * Who is asking.
 *
 * `user`   a real end user; their token is verified and their company
 *          membership is resolved from the database.
 * `system` an internal trigger (cron, workflow, webhook) with no user
 *          session. Deliberately verbose: a `reason` is required so that
 *          every bypass of the user check is self-documenting and
 *          greppable. Never construct one of these from request input.
 */
export type Actor =
  | { kind: 'user'; accessToken: string }
  | { kind: 'system'; companyId: string; reason: string };

export interface Caller {
  userId: string | null;
  companyIds: string[];
  isSystem: boolean;
}

export class AuthError extends Error {
  constructor(message: string, readonly status = 403) {
    super(message);
    this.name = 'AuthError';
  }
}

async function sb(path: string): Promise<any> {
  const resp = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    headers: { apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) throw new Error(`supabase ${resp.status}`);
  return resp.json();
}

/** Verify a user's access token via GoTrue and return their id. */
async function userIdFromToken(accessToken: string): Promise<string | null> {
  if (!accessToken) return null;
  const resp = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: { apikey: anonKey(), Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) return null;
  const user = await resp.json().catch(() => null);
  return user?.id ?? null;
}

/**
 * Companies a user belongs to.
 *
 * Mirrors the SQL helper `user_company_ids()`: erp_user_roles is
 * authoritative, with a profiles fallback for internal staff while that
 * table is being backfilled. Kept in sync deliberately — if one changes,
 * change both.
 */
async function companiesForUser(userId: string): Promise<string[]> {
  const roles = await sb(
    `erp_user_roles?select=company_id&user_id=eq.${userId}&is_active=eq.true&company_id=not.is.null`,
  );
  const ids = new Set<string>((roles || []).map((r: any) => r.company_id));

  if (!ids.size) {
    const profiles = await sb(`profiles?select=role,status&id=eq.${userId}&limit=1`);
    const p = profiles?.[0];
    const internal =
      p && String(p.status || '').toLowerCase() === 'approved' && String(p.role || '').toLowerCase() !== 'client';
    if (internal) {
      const companies = await sb(`erp_companies?select=id&is_active=eq.true&order=created_at&limit=1`);
      if (companies?.[0]) ids.add(companies[0].id);
    }
  }
  return [...ids];
}

/** Resolve an actor into a caller, or throw. */
export async function resolveCaller(actor: Actor): Promise<Caller> {
  if (actor.kind === 'system') {
    if (!actor.companyId) throw new AuthError('system actor requires a companyId', 400);
    if (!actor.reason) throw new AuthError('system actor requires a reason', 400);
    return { userId: null, companyIds: [actor.companyId], isSystem: true };
  }

  const userId = await userIdFromToken(actor.accessToken);
  if (!userId) throw new AuthError('Not signed in.', 401);

  const companyIds = await companiesForUser(userId);
  if (!companyIds.length) throw new AuthError('Your account is not attached to a company.', 403);

  return { userId, companyIds, isSystem: false };
}

/**
 * Decide which company this request runs against.
 *
 * A requested id must be one the caller belongs to. With none requested,
 * a caller in exactly one company gets that one; ambiguity is an error
 * rather than a silent guess.
 */
export function resolveCompany(caller: Caller, requested?: string | null): string {
  if (requested) {
    if (!caller.companyIds.includes(requested)) {
      // Same message either way: do not confirm the company exists.
      throw new AuthError('No access to that company.', 403);
    }
    return requested;
  }
  if (caller.companyIds.length === 1) return caller.companyIds[0];
  throw new AuthError('Specify which company this request is for.', 400);
}
