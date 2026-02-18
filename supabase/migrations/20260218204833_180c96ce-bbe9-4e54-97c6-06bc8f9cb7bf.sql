CREATE OR REPLACE FUNCTION public.auto_create_service_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.lead_id IS NOT NULL THEN
    INSERT INTO service_history (lead_id, job_id, service_date, description, total_price, discount, notes)
    VALUES (
      NEW.lead_id,
      NEW.id,
      COALESCE(NEW.scheduled_at, now()),
      COALESCE(NEW.notes, 'Job completed'),
      COALESCE(NEW.total_price, 0),
      0,
      'Auto-generated from completed job'
    );
  END IF;
  RETURN NEW;
END;
$function$;