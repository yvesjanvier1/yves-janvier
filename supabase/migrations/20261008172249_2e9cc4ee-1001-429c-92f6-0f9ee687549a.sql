CREATE OR REPLACE FUNCTION public.trigger_project_notification()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions'
AS $function$
DECLARE service_key text;
BEGIN
  IF TG_OP = 'INSERT' OR (OLD.featured IS DISTINCT FROM NEW.featured AND NEW.featured = true) THEN
    service_key := current_setting('app.service_role_key', true);
    IF service_key IS NOT NULL AND service_key <> '' THEN
      BEGIN
        PERFORM net.http_post(
          url := 'https://qfnqmdmsapovxdjwdhsx.supabase.co/functions/v1/notify-new-project',
          headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || service_key),
          body := jsonb_build_object('title',NEW.title,'slug',NEW.slug,'description',NEW.description,'images',NEW.images,'tech_stack',NEW.tech_stack)
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'project notification failed: %', SQLERRM;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;