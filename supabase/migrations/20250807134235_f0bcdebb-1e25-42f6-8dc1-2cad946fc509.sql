-- Create triggers to automatically send notifications when content is published

-- Function to call the notify-new-blog-post edge function
CREATE OR REPLACE FUNCTION public.trigger_blog_post_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the post is being published (published changed from false to true)
  IF OLD.published IS DISTINCT FROM NEW.published AND NEW.published = true THEN
    -- Call the edge function using pg_net (this will need to be set up)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to call the notify-new-project edge function  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the triggers
DROP TRIGGER IF EXISTS on_blog_post_published ON public.blog_posts;
CREATE TRIGGER on_blog_post_published
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_blog_post_notification();

DROP TRIGGER IF EXISTS on_project_published ON public.portfolio_projects;
CREATE TRIGGER on_project_published
  AFTER INSERT OR UPDATE ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_project_notification();

-- Enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up the service role key as a runtime setting (this needs to be configured)
-- This would typically be set through Supabase dashboard or environment
-- ALTER DATABASE postgres SET app.service_role_key = 'your_service_role_key';