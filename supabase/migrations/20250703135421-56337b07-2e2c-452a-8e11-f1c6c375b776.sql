
-- Phase 3: Optimize RLS Policies for Performance
-- Fix auth.role() re-evaluation issues by wrapping in SELECT statements

-- Fix about_page policies
DROP POLICY IF EXISTS "Authenticated users can delete about page" ON public.about_page;
DROP POLICY IF EXISTS "Authenticated users can insert about page" ON public.about_page;
DROP POLICY IF EXISTS "Authenticated users can update about page" ON public.about_page;

CREATE POLICY "Authenticated users can delete about page"
  ON public.about_page
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert about page"
  ON public.about_page
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update about page"
  ON public.about_page
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON public.blog_posts;

CREATE POLICY "Authenticated users can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix contact_messages policies
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON public.contact_messages;

CREATE POLICY "Authenticated users can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can view contact messages"
  ON public.contact_messages
  FOR SELECT
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix experience policies
DROP POLICY IF EXISTS "Authenticated users can delete experience" ON public.experience;
DROP POLICY IF EXISTS "Authenticated users can insert experience" ON public.experience;
DROP POLICY IF EXISTS "Authenticated users can update experience" ON public.experience;

CREATE POLICY "Authenticated users can delete experience"
  ON public.experience
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert experience"
  ON public.experience
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update experience"
  ON public.experience
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix portfolio_projects policies
DROP POLICY IF EXISTS "Authenticated users can delete portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio projects" ON public.portfolio_projects;

CREATE POLICY "Authenticated users can delete portfolio projects"
  ON public.portfolio_projects
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert portfolio projects"
  ON public.portfolio_projects
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update portfolio projects"
  ON public.portfolio_projects
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix services policies
DROP POLICY IF EXISTS "Authenticated users can delete services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can insert services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can update services" ON public.services;

CREATE POLICY "Authenticated users can delete services"
  ON public.services
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert services"
  ON public.services
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update services"
  ON public.services
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix skills policies
DROP POLICY IF EXISTS "Authenticated users can delete skills" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can update skills" ON public.skills;

CREATE POLICY "Authenticated users can delete skills"
  ON public.skills
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert skills"
  ON public.skills
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update skills"
  ON public.skills
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix testimonials policies
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON public.testimonials;

CREATE POLICY "Authenticated users can delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can insert testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING ((SELECT auth.role()) = 'authenticated');

-- Fix journal_entries policies (also resolves multiple permissive policies issue)
DROP POLICY IF EXISTS "Anyone can view published journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can manage journal entries" ON public.journal_entries;

-- Create a single comprehensive policy for journal entries
CREATE POLICY "Journal entries access policy"
  ON public.journal_entries
  FOR SELECT
  USING (
    status = 'published' OR 
    (SELECT auth.role()) = 'authenticated'
  );

CREATE POLICY "Authenticated users can manage journal entries"
  ON public.journal_entries
  FOR ALL
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- Fix page_views policies
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.page_views;

CREATE POLICY "Authenticated users can view analytics"
  ON public.page_views
  FOR SELECT
  USING ((SELECT auth.role()) = 'authenticated');
