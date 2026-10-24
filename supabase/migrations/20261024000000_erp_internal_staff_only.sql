-- =====================================================================
-- Lock the ERP tables to internal staff.
--
-- FINDING (2026-10-24): every ERP table except erp_staff_roles had ALL
-- policies whose only condition was auth.role() = 'authenticated'. Any
-- signed-in user, including every client account, could read, change
-- or delete internal projects, tasks, time entries (with hourly rates),
-- team assignments and permission tables.
--
-- New rule, using the existing helpers from 20260728000001 and
-- 20260802030000:
--   working tables: internal staff (is_internal_staff()) full access,
--                   so staff behaviour in the admin and staff portals is
--                   unchanged and clients get nothing
--   permission catalogue (erp_permissions, erp_role_permissions):
--                   staff read, admins write
-- erp_staff_roles already has correct policies and is left alone.
-- The service role (JARVIS worker, API routes) bypasses RLS as before.
-- =====================================================================

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'erp_companies', 'erp_project_teams', 'erp_projects', 'erp_tasks',
    'erp_time_entries', 'erp_user_permissions', 'erp_user_roles',
    'erp_permissions', 'erp_role_permissions'
  ] LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY[
    'erp_companies', 'erp_project_teams', 'erp_projects', 'erp_tasks',
    'erp_time_entries', 'erp_user_permissions', 'erp_user_roles'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "Internal staff full access" ON public.%I FOR ALL TO authenticated '
      'USING (public.is_internal_staff()) WITH CHECK (public.is_internal_staff())', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['erp_permissions', 'erp_role_permissions'] LOOP
    EXECUTE format(
      'CREATE POLICY "Internal staff read" ON public.%I FOR SELECT TO authenticated '
      'USING (public.is_internal_staff())', t);
    EXECUTE format(
      'CREATE POLICY "Admins write" ON public.%I FOR ALL TO authenticated '
      'USING (public.is_app_admin()) WITH CHECK (public.is_app_admin())', t);
  END LOOP;
END $$;
