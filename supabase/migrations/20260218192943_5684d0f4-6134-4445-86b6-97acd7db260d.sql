
-- Service history table for tracking past services per lead
CREATE TABLE public.service_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  service_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  total_price NUMERIC DEFAULT 0,
  parts_summary TEXT,
  labor_summary TEXT,
  discount NUMERIC DEFAULT 0,
  discount_reason TEXT,
  membership BOOLEAN DEFAULT false,
  membership_note TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access to service_history"
ON public.service_history FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Trigger to auto-create history when a job is completed
CREATE OR REPLACE FUNCTION public.auto_create_service_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.lead_id IS NOT NULL THEN
    INSERT INTO service_history (lead_id, job_id, service_date, description, total_price, discount, notes)
    VALUES (
      NEW.lead_id,
      NEW.id,
      COALESCE(NEW.scheduled_at, now()),
      'Job completed',
      COALESCE(NEW.total_price, 0),
      0,
      'Auto-generated from completed job'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_job_completed
AFTER UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_service_history();
