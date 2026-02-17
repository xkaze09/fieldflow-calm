
-- Add Google Calendar event ID to jobs for two-way sync
ALTER TABLE public.jobs ADD COLUMN google_calendar_event_id text;

-- Add index for quick lookup by calendar event ID
CREATE INDEX idx_jobs_google_calendar_event_id ON public.jobs (google_calendar_event_id);

-- Add a table to store Google Calendar OAuth tokens per user
CREATE TABLE public.google_calendar_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  calendar_id text DEFAULT 'primary',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens"
ON public.google_calendar_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
ON public.google_calendar_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
ON public.google_calendar_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
ON public.google_calendar_tokens FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_google_calendar_tokens_updated_at
BEFORE UPDATE ON public.google_calendar_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
