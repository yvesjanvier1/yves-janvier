DROP POLICY IF EXISTS "Anyone can view portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can view portfolio projects"
ON public.portfolio_projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts"
ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Public can view services"
ON public.services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials"
ON public.testimonials FOR SELECT TO anon, authenticated USING (true);