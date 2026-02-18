-- Add direction column to calls table
ALTER TABLE public.calls ADD COLUMN direction text NOT NULL DEFAULT 'inbound';
