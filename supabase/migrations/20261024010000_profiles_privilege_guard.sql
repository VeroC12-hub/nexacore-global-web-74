-- =====================================================================
-- Stop users from granting themselves staff or admin access.
--
-- FINDINGS (2026-10-24):
-- 1. The "Users can update own profile" / profiles_update_own policies let
--    any signed-in user update every column of their own profile row,
--    including role and status. Signup is public, so anyone could sign up
--    and set role = 'admin'. The insert-own policies had the same gap for
--    accounts without a NexaCore profile (signups of the other app on this
--    shared project are skipped by handle_new_user).
-- 2. is_internal_staff() treated every approved role except 'client' as
--    staff. New signups get role 'member' (status 'approved'), which the app
--    treats as a client, so every public signup had internal staff access to
--    the ERP tables and everything else gated by is_internal_staff().
--
-- Fix:
-- 1. A trigger on profiles: for end-user requests (JWT role authenticated or
--    anon) that are not from an approved admin, inserts are forced to
--    role 'member' / status 'approved', and updates may not change role or
--    status. The service role, the auth signup trigger and SQL sessions are
--    not end-user requests and are unaffected.
-- 2. is_internal_staff() uses an explicit allowlist of staff roles.
--    At the time of writing no 'member' profiles exist, so no current user
--    loses access.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.guard_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF COALESCE(auth.role(), '') NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF public.is_app_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'member';
    NEW.status := 'approved';
  ELSIF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Only an admin can change a role or account status'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_privileges ON public.profiles;
CREATE TRIGGER guard_profile_privileges
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileges();

CREATE OR REPLACE FUNCTION public.is_internal_staff()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND lower(COALESCE(status, '')) = 'approved'
      AND lower(COALESCE(role, '')) IN (
        'admin', 'project_manager', 'operations_manager',
        'developer', 'support', 'staff'
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.erp_staff_roles
    WHERE user_id = auth.uid() AND is_active
  );
$function$;
