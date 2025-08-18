-- Add email tracking fields to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS email_thread_id TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add email tracking to quote_requests
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS email_thread_id TEXT;