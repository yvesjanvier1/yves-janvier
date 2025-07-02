
-- Phase 2: Clean Up Row Level Security Policies
-- Remove conflicting and redundant RLS policies

-- Clean up blog_posts table policies
DROP POLICY IF EXISTS "Public read access" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.blog_posts;

-- Keep only essential policies for blog_posts
-- Anyone can view published posts is already good
-- Authenticated users policies are too broad, let's make them more specific

-- Clean up contact_messages table policies  
DROP POLICY IF EXISTS "Public read access" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.contact_messages;

-- Contact messages should only be viewable by authenticated users (admins)
-- The "Anyone can insert contact messages" policy is good for the contact form

-- Clean up portfolio_projects table policies
DROP POLICY IF EXISTS "Public read access" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.portfolio_projects;

-- Clean up services table policies
DROP POLICY IF EXISTS "Public read access" ON public.services;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.services;

-- Clean up testimonials table policies
DROP POLICY IF EXISTS "Public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.testimonials;

-- Clean up skills table policies
DROP POLICY IF EXISTS "Authenticated users full access" ON public.skills;
DROP POLICY IF EXISTS "Public read access" ON public.skills;

-- Clean up about_page table policies
DROP POLICY IF EXISTS "Public read access" ON public.about_page;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.about_page;

-- Clean up experience table policies
DROP POLICY IF EXISTS "Public read access" ON public.experience;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.experience;

-- Clean up page_views table policies
DROP POLICY IF EXISTS "Public read access" ON public.page_views;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.page_views;

-- Add RLS policies for journal_entries (currently has no policies)
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create proper policies for journal_entries
CREATE POLICY "Anyone can view published journal entries"
  ON public.journal_entries
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage journal entries"
  ON public.journal_entries
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Restrict page_views to only allow inserts for tracking and selects for authenticated users
CREATE POLICY "Allow page view tracking"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view analytics"
  ON public.page_views
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');
