-- =====================================================================
-- Real storage for staff portfolio submissions.
--
-- FINDING (2026-10-23): PortfolioSubmissionModal never uploaded files.
-- It inserted portfolio_files rows pointing at /uploads/pending/...,
-- a path that does not exist, so submitted work could never be shown.
--
-- Portfolio work is displayed publicly once approved, so the bucket is
-- public-read. Each signed-in user may only write inside a folder named
-- after their own user id: <user_id>/<portfolio_project_id>/<file>.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('portfolio-files', 'portfolio-files', true, 52428800)  -- 50 MB
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own portfolio files" ON storage.objects;
CREATE POLICY "Users upload own portfolio files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users manage own portfolio files" ON storage.objects;
CREATE POLICY "Users manage own portfolio files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'portfolio-files'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
