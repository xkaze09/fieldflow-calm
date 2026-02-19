
-- Create business_lines table to map phone numbers to business names
CREATE TABLE public.business_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  status text DEFAULT 'working',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_lines ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated users can read business_lines"
  ON public.business_lines FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage business_lines"
  ON public.business_lines FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anon can read (for webhook to look up business name)
CREATE POLICY "Anon can read business_lines"
  ON public.business_lines FOR SELECT
  USING (true);
