-- =====================================================================
-- Create the project when a client approves a quote.
--
-- FINDINGS (2026-10-24):
-- - QuoteReview created the project from the browser after approval. Since
--   20261024020000 only staff may insert into projects, so this fails for
--   clients opening the email link without signing in.
-- - It never worked anyway: it sent priority 'normal' (rejected by
--   projects_priority_check) and the page checked a `success` flag the
--   service never returned.
--
-- Fix: respond_to_quote() creates the project itself on approval, linked to
-- the client's profile when one exists for the quote email, and returns its
-- id as project_id. It does nothing if a project for the quote exists.
-- =====================================================================

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
  v_project_id uuid;
  v_client_id uuid;
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

  IF p_action = 'approved' THEN
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE metadata->>'quote_id' = result.id::text
    LIMIT 1;

    IF v_project_id IS NULL THEN
      SELECT id INTO v_client_id
      FROM public.profiles
      WHERE lower(email) = lower(result.client_email)
      LIMIT 1;

      INSERT INTO public.projects (title, description, client_id, status, priority, budget, service_type, metadata)
      VALUES (
        COALESCE(NULLIF(result.service_type, ''), 'New Project'),
        result.scope,
        v_client_id,
        'planning',
        'medium',
        result.price,
        COALESCE(NULLIF(result.service_type, ''), 'General'),
        jsonb_build_object(
          'created_from_quote', true,
          'quote_id', result.id,
          'client_email', result.client_email,
          'timeline', result.timeline,
          'currency', result.currency
        )
      )
      RETURNING id INTO v_project_id;
    END IF;
  END IF;

  RETURN (to_jsonb(result) - 'created_by' - 'email_thread_id' - 'project_manager_email')
    || jsonb_build_object('project_id', v_project_id);
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_quote(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_to_quote(uuid, text, text) TO anon, authenticated;
