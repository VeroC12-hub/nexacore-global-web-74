-- =============================================================================
-- FIX: Auth RLS and role detection for mobile login
-- Run this in Supabase SQL Editor → it is safe to run multiple times (idempotent)
-- =============================================================================

-- 1. Ensure users can read their OWN row in public.profiles
--    (without this, fetchProfile silently returns null → role falls back to 'client')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      USING (id = auth.uid());
  END IF;
END $$;

-- 2. Ensure users can update their OWN row in public.profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (id = auth.uid());
  END IF;
END $$;

-- 3. Allow users to read their OWN row in erp_staff_roles
--    (fetchProfile queries this to get ERP role; if blocked → returns null → 'client')
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'erp_staff_roles' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.erp_staff_roles ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'erp_staff_roles'
      AND policyname = 'Users can view own staff role'
  ) THEN
    CREATE POLICY "Users can view own staff role"
      ON public.erp_staff_roles FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 4. Sync profiles.role from erp_staff_roles for all active staff/admin users
--    so fetchProfile only NEEDS profiles (simpler, one query instead of two)
UPDATE public.profiles p
SET role = e.role
FROM public.erp_staff_roles e
WHERE p.id = e.user_id
  AND e.is_active = true
  AND e.role IN ('admin', 'project_manager', 'operations_manager', 'developer', 'support')
  AND (p.role IS NULL OR p.role NOT IN ('admin', 'project_manager', 'operations_manager', 'developer', 'support'));

-- 5. Map any remaining 'member' role users without a staff role to 'client'
UPDATE public.profiles
SET role = 'client'
WHERE (role = 'member' OR role IS NULL)
  AND id NOT IN (
    SELECT user_id FROM public.erp_staff_roles
    WHERE is_active = true
      AND role IN ('admin', 'project_manager', 'operations_manager', 'developer', 'support')
  );

-- Verification: show current role distribution
SELECT role, COUNT(*) as count FROM public.profiles GROUP BY role ORDER BY count DESC;
