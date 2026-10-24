-- =====================================================================
-- Make the portfolio submission workflow work.
--
-- FINDINGS (2026-10-24):
-- - Staff submit portfolio projects for review (PortfolioSubmissionModal,
--   ModernStaffDashboard) and admins approve, reject or ask for a revision
--   (AdminPortfolioTab). The code uses submission_status, submitted_by and
--   admin_notes, which do not exist on portfolio_projects, so every step
--   failed.
-- - portfolio_projects and portfolio_files only had a public SELECT policy
--   for published / public rows. Nobody, admins included, could insert,
--   update, or see unpublished submissions.
--
-- Fix: add the three columns (existing rows count as approved when
-- published, otherwise pending review) and give internal staff full
-- access. The public read policies are unchanged.
-- =====================================================================

ALTER TABLE public.portfolio_projects
  ADD COLUMN IF NOT EXISTS submission_status text NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_notes text;

UPDATE public.portfolio_projects
SET submission_status = 'approved'
WHERE is_published = true AND submission_status = 'pending_review';

UPDATE public.portfolio_projects
SET submitted_by = created_by
WHERE submitted_by IS NULL
  AND created_by IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = portfolio_projects.created_by);

ALTER TABLE public.portfolio_projects
  DROP CONSTRAINT IF EXISTS portfolio_projects_submission_status_check;
ALTER TABLE public.portfolio_projects
  ADD CONSTRAINT portfolio_projects_submission_status_check
  CHECK (submission_status IN ('pending_review', 'approved', 'rejected', 'revision_needed'));

CREATE INDEX IF NOT EXISTS portfolio_projects_submitted_by_idx
  ON public.portfolio_projects (submitted_by);

DROP POLICY IF EXISTS portfolio_projects_internal_staff_all ON public.portfolio_projects;
CREATE POLICY portfolio_projects_internal_staff_all ON public.portfolio_projects
  FOR ALL TO authenticated
  USING (public.is_internal_staff())
  WITH CHECK (public.is_internal_staff());

DROP POLICY IF EXISTS portfolio_files_internal_staff_all ON public.portfolio_files;
CREATE POLICY portfolio_files_internal_staff_all ON public.portfolio_files
  FOR ALL TO authenticated
  USING (public.is_internal_staff())
  WITH CHECK (public.is_internal_staff());
