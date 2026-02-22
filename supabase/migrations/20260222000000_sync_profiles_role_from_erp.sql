-- Sync profiles.role with erp_staff_roles.role for users who have active ERP staff entries.
-- This fixes the issue where handle_new_user trigger sets role='member' for all new users,
-- causing admin/staff accounts to always redirect to the client portal.

UPDATE public.profiles p
SET role = e.role
FROM public.erp_staff_roles e
WHERE p.id = e.user_id
  AND e.is_active = true
  AND e.role IN ('admin', 'project_manager', 'operations_manager', 'developer', 'support')
  AND (p.role IS NULL OR p.role NOT IN ('admin', 'project_manager', 'operations_manager', 'developer', 'support'));

-- Also ensure the 'client' role maps correctly (profiles with 'member' role and no erp_staff_roles entry stay as client)
UPDATE public.profiles
SET role = 'client'
WHERE role = 'member'
  AND id NOT IN (
    SELECT user_id FROM public.erp_staff_roles
    WHERE is_active = true
    AND role IN ('admin', 'project_manager', 'operations_manager', 'developer', 'support')
  );
