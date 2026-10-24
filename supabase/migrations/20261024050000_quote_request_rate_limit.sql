-- =====================================================================
-- Rate limit public quote requests and stop the confirmation email being
-- usable as an open mailer.
--
-- FINDINGS (2026-10-24):
-- - Anyone can insert into quote_requests (policies with check `true`), as
--   often as they like, with any status. Each submission sends emails.
-- - send-email's quote_request_confirmation sent to whatever `to` address
--   the caller gave, so anyone could send NexaCore-branded mail to anyone.
--
-- Fix:
-- - A BEFORE INSERT trigger for visitors and clients: at most 3 requests per
--   email address per hour and 30 in total per hour, field length limits,
--   and status / email bookkeeping fields forced to their defaults.
-- - confirmation_sent_at: send-email now looks the request up by id, sends
--   the confirmation only to that request's address, only once, and only
--   within 15 minutes of submission.
-- =====================================================================

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;

CREATE OR REPLACE FUNCTION public.limit_quote_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF COALESCE(auth.role(), '') NOT IN ('authenticated', 'anon') OR public.is_internal_staff() THEN
    RETURN NEW;
  END IF;

  NEW.email := lower(trim(NEW.email));
  IF NEW.email IS NULL OR NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address' USING ERRCODE = '22023';
  END IF;

  IF length(COALESCE(NEW.full_name, '')) > 200
     OR length(NEW.email) > 254
     OR length(COALESCE(NEW.phone, '')) > 50
     OR length(COALESCE(NEW.company, '')) > 200
     OR length(COALESCE(NEW.description, '')) > 10000 THEN
    RAISE EXCEPTION 'One of the fields is too long' USING ERRCODE = '22001';
  END IF;

  IF (SELECT count(*) FROM public.quote_requests
      WHERE email = NEW.email AND created_at > now() - interval '1 hour') >= 3 THEN
    RAISE EXCEPTION 'You have sent several requests already. Please wait an hour or email projects@nexacore-innovations.com.'
      USING ERRCODE = 'P0001';
  END IF;

  IF (SELECT count(*) FROM public.quote_requests
      WHERE created_at > now() - interval '1 hour') >= 30 THEN
    RAISE EXCEPTION 'We are receiving a lot of requests right now. Please try again later or email projects@nexacore-innovations.com.'
      USING ERRCODE = 'P0001';
  END IF;

  NEW.status := 'pending';
  NEW.created_at := now();
  NEW.email_sent_at := NULL;
  NEW.email_thread_id := NULL;
  NEW.pm_token_id := NULL;
  NEW.confirmation_sent_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS limit_quote_requests ON public.quote_requests;
CREATE TRIGGER limit_quote_requests
  BEFORE INSERT ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.limit_quote_requests();

CREATE INDEX IF NOT EXISTS quote_requests_email_created_idx
  ON public.quote_requests (email, created_at);
CREATE INDEX IF NOT EXISTS quote_requests_created_idx
  ON public.quote_requests (created_at);
