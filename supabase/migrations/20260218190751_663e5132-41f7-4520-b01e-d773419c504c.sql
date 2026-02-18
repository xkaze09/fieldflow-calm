
-- Function to recalculate job costs and profit
CREATE OR REPLACE FUNCTION public.recalculate_job_costs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_job_id uuid;
  v_parts_cost numeric;
  v_labor_cost numeric;
  v_labor_hours numeric;
  v_total_price numeric;
  v_hourly_cost numeric;
BEGIN
  -- Determine which job to recalculate
  IF TG_TABLE_NAME = 'job_parts' THEN
    v_job_id := COALESCE(NEW.job_id, OLD.job_id);
  ELSE
    v_job_id := NEW.id;
  END IF;

  -- Sum parts cost from job_parts
  SELECT COALESCE(SUM(total_cost), 0) INTO v_parts_cost
  FROM job_parts WHERE job_id = v_job_id;

  -- Get job info
  SELECT labor_hours, total_price, technician_id
  INTO v_labor_hours, v_total_price
  FROM jobs WHERE id = v_job_id;

  -- Get technician hourly cost
  SELECT COALESCE(t.hourly_cost, 0) INTO v_hourly_cost
  FROM jobs j
  LEFT JOIN technicians t ON t.id = j.technician_id
  WHERE j.id = v_job_id;

  v_labor_cost := COALESCE(v_labor_hours, 0) * COALESCE(v_hourly_cost, 0);

  -- Update the job
  UPDATE jobs SET
    parts_cost = v_parts_cost,
    labor_cost = v_labor_cost,
    profit = COALESCE(v_total_price, 0) - v_parts_cost - v_labor_cost,
    updated_at = now()
  WHERE id = v_job_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on job_parts changes
CREATE TRIGGER recalc_job_on_parts_change
AFTER INSERT OR UPDATE OR DELETE ON public.job_parts
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_job_costs();

-- Trigger on jobs changes (labor_hours, total_price, technician_id)
CREATE TRIGGER recalc_job_on_job_update
AFTER UPDATE OF labor_hours, total_price, technician_id ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_job_costs();
