-- Recreate the triggers since they may have been dropped when moving the extension
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