-- =====================================================================
-- Real storage for the admin File Repository.
--
-- FINDING (2026-10-21): FileUploadModal only simulated an upload. It
-- animated a progress bar and inserted a project_files row, but the
-- file bytes were never stored, so nothing could ever be downloaded.
--
-- Objects live in the private "project-files" bucket at
-- <project_id>/<file name>, matching project_files.file_path.
-- Access mirrors the project_files table policies:
--   staff (admin / staff / project_manager): full access
--   clients: read files on their own projects marked client or public
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-files', 'project-files', false, 52428800)  -- 50 MB
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Staff manage project files" ON storage.objects;
CREATE POLICY "Staff manage project files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager'))
  )
  WITH CHECK (
    bucket_id = 'project-files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'project_manager'))
  );

DROP POLICY IF EXISTS "Clients read their project files" ON storage.objects;
CREATE POLICY "Clients read their project files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1
      FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      WHERE pf.file_path = storage.objects.name
        AND p.client_id = auth.uid()
        AND pf.access_level IN ('client', 'public')
    )
  );
