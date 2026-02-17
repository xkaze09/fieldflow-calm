
-- 1. Leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','scheduled','won','lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Calls
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  twilio_sid TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'answered' CHECK (status IN ('answered','missed','voicemail')),
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Technicians
CREATE TABLE public.technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT,
  hourly_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Jobs
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  call_id UUID REFERENCES public.calls(id),
  technician_id UUID REFERENCES public.technicians(id),
  scheduled_at TIMESTAMPTZ,
  location TEXT,
  labor_hours NUMERIC(5,2) DEFAULT 0,
  labor_cost NUMERIC(10,2) DEFAULT 0,
  parts_cost NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  profit NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in-progress','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Parts Catalog
CREATE TABLE public.parts_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Job Parts
CREATE TABLE public.job_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES public.parts_catalog(id),
  qty INTEGER NOT NULL DEFAULT 1,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 7. Tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  related_job_id UUID REFERENCES public.jobs(id),
  related_lead_id UUID REFERENCES public.leads(id),
  type TEXT NOT NULL DEFAULT 'follow-up',
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue')),
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can CRUD all rows (small team, no per-user isolation needed)
-- Leads
CREATE POLICY "Authenticated users full access to leads" ON public.leads FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- Calls
CREATE POLICY "Authenticated users full access to calls" ON public.calls FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- Technicians
CREATE POLICY "Authenticated users full access to technicians" ON public.technicians FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- Jobs
CREATE POLICY "Authenticated users full access to jobs" ON public.jobs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- Parts Catalog
CREATE POLICY "Authenticated users full access to parts_catalog" ON public.parts_catalog FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- Job Parts
CREATE POLICY "Authenticated users full access to job_parts" ON public.job_parts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
-- Tasks
CREATE POLICY "Authenticated users full access to tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Allow anon access to calls table for Twilio webhook (unauthenticated)
CREATE POLICY "Anon can insert calls" ON public.calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can select leads by phone" ON public.leads FOR SELECT USING (true);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
