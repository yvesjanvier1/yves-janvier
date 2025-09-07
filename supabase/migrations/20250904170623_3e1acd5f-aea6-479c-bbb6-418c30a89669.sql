-- Fix locale-based RLS policies and add locale setting function
-- Create function to set current locale for RLS filtering
CREATE OR REPLACE FUNCTION public.set_current_locale(_locale text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT set_config('app.current_locale', _locale, false);
$$;

-- Update blog posts RLS policy to filter by locale
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (
  published = true AND 
  (locale = current_setting('app.current_locale', true) OR locale IS NULL)
);

-- Update portfolio projects RLS policy to filter by locale  
DROP POLICY IF EXISTS "Anyone can view portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Anyone can view portfolio projects"
ON public.portfolio_projects
FOR SELECT
USING (
  locale = current_setting('app.current_locale', true) OR locale IS NULL
);

-- Update services RLS policy to filter by locale
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services"
ON public.services
FOR SELECT
USING (
  locale = current_setting('app.current_locale', true) OR locale IS NULL
);

-- Update testimonials RLS policy to filter by locale
DROP POLICY IF EXISTS "Anyone can view testimonials" ON public.testimonials;
CREATE POLICY "Anyone can view testimonials"
ON public.testimonials  
FOR SELECT
USING (
  locale = current_setting('app.current_locale', true) OR locale IS NULL
);