-- Fix security warnings by updating functions with proper search_path and moving extension

-- Update trigger functions with proper search_path and security settings
CREATE OR REPLACE FUNCTION public.trigger_blog_post_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the post is being published (published changed from false to true)
  IF OLD.published IS DISTINCT FROM NEW.published AND NEW.published = true THEN
    -- Call the edge function using pg_net
    PERFORM
      net.http_post(
        url := 'https://qfnqmdmsapovxdjwdhsx.supabase.co/functions/v1/notify-new-blog-post',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
        body := json_build_object(
          'title', NEW.title,
          'slug', NEW.slug,
          'excerpt', NEW.excerpt,
          'cover_image', NEW.cover_image
        )::jsonb
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'extensions';

CREATE OR REPLACE FUNCTION public.trigger_project_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for new projects or when featured status changes to true
  IF TG_OP = 'INSERT' OR (OLD.featured IS DISTINCT FROM NEW.featured AND NEW.featured = true) THEN
    -- Call the edge function using pg_net
    PERFORM
      net.http_post(
        url := 'https://qfnqmdmsapovxdjwdhsx.supabase.co/functions/v1/notify-new-project',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
        body := json_build_object(
          'title', NEW.title,
          'slug', NEW.slug,
          'description', NEW.description,
          'images', NEW.images,
          'tech_stack', NEW.tech_stack
        )::jsonb
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'extensions';

-- Move pg_net extension to extensions schema (if it exists)
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;