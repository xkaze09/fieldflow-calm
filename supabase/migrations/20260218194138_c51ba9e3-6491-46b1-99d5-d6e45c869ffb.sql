
-- Drop old constraint first
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Migrate data
UPDATE public.leads SET status = 'active' WHERE status = 'qualified';
UPDATE public.leads SET status = 'booked' WHERE status = 'scheduled';
UPDATE public.leads SET status = 'completed' WHERE status IN ('won', 'lost');

-- Add new constraint
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'active', 'booked', 'completed'));
