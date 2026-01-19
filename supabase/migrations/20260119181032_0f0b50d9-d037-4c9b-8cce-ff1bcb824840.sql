-- Fix the blog post notification trigger to handle missing service role key
CREATE OR REPLACE FUNCTION public.trigger_blog_post_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  service_key text;
BEGIN
  -- Only trigger if the post is being published (published changed from false to true)
  IF OLD.published IS DISTINCT FROM NEW.published AND NEW.published = true THEN
    -- Get the service role key safely
    service_key := current_setting('app.service_role_key', true);
    
    -- Only proceed if we have a valid service key
    IF service_key IS NOT NULL AND service_key != '' THEN
      -- Call the edge function using pg_net
      PERFORM
        net.http_post(
          url := 'https://qfnqmdmsapovxdjwdhsx.supabase.co/functions/v1/notify-new-blog-post',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
          ),
          body := jsonb_build_object(
            'title', NEW.title,
            'slug', NEW.slug,
            'excerpt', NEW.excerpt,
            'cover_image', NEW.cover_image
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;