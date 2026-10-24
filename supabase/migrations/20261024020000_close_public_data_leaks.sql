-- =====================================================================
-- Close row level security gaps found in the 2026-10-24 audit.
--
-- FINDINGS:
-- 1. quote_requests: two SELECT policies with condition `true` let anyone on
--    the internet (no sign-in) read every quote request: names, emails,
--    phones, companies, budgets and project descriptions.
-- 2. quotes: anon could read and update every quote (condition `true`), and
--    signed-in clients could update every column of their own quotes,
--    including the price.
-- 3. projects: two policies allowed any signed-in user (every client) to
--    read, change and delete all projects.
-- 4. jarvis_memory / jarvis_tasks / jarvis_schedules / jarvis_leads: any
--    signed-in user had full access.
-- 5. ai_conversations / ai_messages: anon could read and update every chat.
--    The "admin" policies on all ai_* tables trusted
--    auth.users.raw_user_meta_data->>'role', which every user can set on
--    their own account with supabase.auth.updateUser().
-- 6. project_members: any signed-in user had full access.
--
-- FIXES:
-- - Public quote review goes through two SECURITY DEFINER functions keyed by
--   the quote id (a UUID sent in the client's email link):
--   get_quote_for_review() and respond_to_quote(). Only status, approval
--   time and the client's message can be changed through them.
-- - The Get Started form and the chat widget now generate row ids in the
--   browser, so they no longer need to read rows back.
-- - Staff keep full access through is_internal_staff(); clients see only
--   their own rows; admin-only data uses is_app_admin().
-- - Clients may still edit description, priority and end date of their own
--   projects (old client portal); a trigger blocks every other column.
--
-- Not changed (appear to belong to another app on this shared project and
-- are not used by NexaCore code): homepage_media, media_files, users,
-- user_profiles, events, venues, vip_packages.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1 and 2. Quote requests and quotes
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Anon can read own submissions" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can view quote requests by email" ON public.quote_requests;

DROP POLICY IF EXISTS "Anon can view quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anon can update quote status" ON public.quotes;
DROP POLICY IF EXISTS "Clients can update quote status" ON public.quotes;
DROP POLICY IF EXISTS "Clients can update their own quotes" ON public.quotes;

CREATE OR REPLACE FUNCTION public.get_quote_for_review(p_quote_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'quote', to_jsonb(q) - 'created_by' - 'email_thread_id' - 'project_manager_email',
    'request', (
      SELECT jsonb_build_object(
        'full_name', r.full_name,
        'email', r.email,
        'phone', r.phone,
        'company', r.company,
        'country', r.country,
        'service_type', r.service_type,
        'description', r.description
      )
      FROM public.quote_requests r
      WHERE r.id = q.quote_request_id
    )
  )
  FROM public.quotes q
  WHERE q.id = p_quote_id;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_quote(
  p_quote_id uuid,
  p_action text,
  p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result public.quotes;
BEGIN
  IF p_action NOT IN ('approved', 'declined', 'revision_requested') THEN
    RAISE EXCEPTION 'Invalid response' USING ERRCODE = '22023';
  END IF;

  UPDATE public.quotes
  SET status = p_action,
      approved_at = CASE WHEN p_action = 'approved' THEN now() ELSE approved_at END,
      client_message = COALESCE(left(p_message, 5000), client_message),
      updated_at = now()
  WHERE id = p_quote_id
    AND COALESCE(status, '') NOT IN ('approved', 'declined')
  RETURNING * INTO result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This quote cannot be changed any more' USING ERRCODE = 'P0002';
  END IF;

  RETURN to_jsonb(result) - 'created_by' - 'email_thread_id' - 'project_manager_email';
END;
$$;

REVOKE ALL ON FUNCTION public.get_quote_for_review(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_to_quote(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_for_review(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_quote(uuid, text, text) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Projects
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated_users_can_manage_projects" ON public.projects;
DROP POLICY IF EXISTS "authenticated_users_can_read_projects" ON public.projects;

DROP POLICY IF EXISTS projects_internal_staff_all ON public.projects;
CREATE POLICY projects_internal_staff_all ON public.projects
  FOR ALL TO authenticated
  USING (public.is_internal_staff())
  WITH CHECK (public.is_internal_staff());

DROP POLICY IF EXISTS projects_client_update_own ON public.projects;
CREATE POLICY projects_client_update_own ON public.projects
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_client_project_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF COALESCE(auth.role(), '') NOT IN ('authenticated', 'anon') OR public.is_internal_staff() THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - ARRAY['description', 'priority', 'end_date', 'updated_at'])
     IS DISTINCT FROM
     (to_jsonb(OLD) - ARRAY['description', 'priority', 'end_date', 'updated_at']) THEN
    RAISE EXCEPTION 'Clients can only change the description, priority and end date'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Named to fire before other BEFORE UPDATE triggers, so it compares what
-- the client sent rather than values set by later triggers.
DROP TRIGGER IF EXISTS aa_guard_client_project_update ON public.projects;
CREATE TRIGGER aa_guard_client_project_update
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.guard_client_project_update();

-- ---------------------------------------------------------------------
-- 4. JARVIS
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS jarvis_memory_authenticated_all ON public.jarvis_memory;
DROP POLICY IF EXISTS jarvis_tasks_authenticated_all ON public.jarvis_tasks;
DROP POLICY IF EXISTS jarvis_schedules_authenticated_all ON public.jarvis_schedules;
DROP POLICY IF EXISTS jarvis_leads_authenticated_all ON public.jarvis_leads;

CREATE POLICY jarvis_memory_admin_all ON public.jarvis_memory
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());
CREATE POLICY jarvis_tasks_admin_all ON public.jarvis_tasks
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());
CREATE POLICY jarvis_schedules_admin_all ON public.jarvis_schedules
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());
CREATE POLICY jarvis_leads_staff_all ON public.jarvis_leads
  FOR ALL TO authenticated USING (public.is_internal_staff()) WITH CHECK (public.is_internal_staff());

-- ---------------------------------------------------------------------
-- 5. AI assistant tables
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.ai_conversations;
CREATE POLICY ai_conversations_select_own ON public.ai_conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_app_admin());
CREATE POLICY ai_conversations_update_own ON public.ai_conversations
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.ai_messages;
CREATE POLICY ai_messages_select_own ON public.ai_messages
  FOR SELECT TO authenticated USING (
    public.is_app_admin() OR EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY ai_messages_update_own ON public.ai_messages
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Knowledge base manageable by admins" ON public.ai_knowledge_base;
CREATE POLICY ai_knowledge_base_admin_all ON public.ai_knowledge_base
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.ai_learning_feedback;
CREATE POLICY ai_learning_feedback_admin_all ON public.ai_learning_feedback
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage training data" ON public.ai_training_data;
CREATE POLICY ai_training_data_admin_all ON public.ai_training_data
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can view analytics" ON public.ai_assistant_analytics;
DROP POLICY IF EXISTS "Admins can create analytics" ON public.ai_assistant_analytics;
CREATE POLICY ai_assistant_analytics_admin_all ON public.ai_assistant_analytics
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage common questions" ON public.ai_common_questions;
CREATE POLICY ai_common_questions_admin_all ON public.ai_common_questions
  FOR ALL TO authenticated USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

-- ---------------------------------------------------------------------
-- 6. Project members
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated users to insert project_members" ON public.project_members;
DROP POLICY IF EXISTS "Allow authenticated users to read project_members" ON public.project_members;
DROP POLICY IF EXISTS "Allow authenticated users to update project_members" ON public.project_members;
CREATE POLICY project_members_internal_staff_all ON public.project_members
  FOR ALL TO authenticated
  USING (public.is_internal_staff())
  WITH CHECK (public.is_internal_staff());
