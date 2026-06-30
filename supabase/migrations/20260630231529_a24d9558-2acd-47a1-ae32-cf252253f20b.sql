
-- 1. Private schema for security helpers (not exposed by PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Re-create role helpers inside the private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.get_current_user_role()
 RETURNS public.app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_current_user_role() TO authenticated, service_role;

-- 3. Rewrite RLS policies that referenced public.has_role
-- about_page
DROP POLICY IF EXISTS "Admins can insert about page" ON public.about_page;
DROP POLICY IF EXISTS "Admins can update about page" ON public.about_page;
DROP POLICY IF EXISTS "Admins can delete about page" ON public.about_page;
CREATE POLICY "Admins can insert about page" ON public.about_page FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update about page" ON public.about_page FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete about page" ON public.about_page FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- experience
DROP POLICY IF EXISTS "Admins can insert experience" ON public.experience;
DROP POLICY IF EXISTS "Admins can update experience" ON public.experience;
DROP POLICY IF EXISTS "Admins can delete experience" ON public.experience;
CREATE POLICY "Admins can insert experience" ON public.experience FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update experience" ON public.experience FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete experience" ON public.experience FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- contact_messages
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- content_suggestions
DROP POLICY IF EXISTS "Admins can manage content suggestions" ON public.content_suggestions;
CREATE POLICY "Admins can manage content suggestions" ON public.content_suggestions FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- skills
DROP POLICY IF EXISTS "Admins can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Admins can update skills" ON public.skills;
DROP POLICY IF EXISTS "Admins can delete skills" ON public.skills;
CREATE POLICY "Admins can insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update skills" ON public.skills FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete skills" ON public.skills FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- now_page
DROP POLICY IF EXISTS "Admins can insert now page data" ON public.now_page;
DROP POLICY IF EXISTS "Admins can update now page data" ON public.now_page;
DROP POLICY IF EXISTS "Admins can delete now page data" ON public.now_page;
CREATE POLICY "Admins can insert now page data" ON public.now_page FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update now page data" ON public.now_page FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete now page data" ON public.now_page FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- resources
DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;
CREATE POLICY "Admins can insert resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update resources" ON public.resources FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- newsletter_subscriptions
DROP POLICY IF EXISTS "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all newsletter subscriptions" ON public.newsletter_subscriptions FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- content_queue
DROP POLICY IF EXISTS "Admins can manage content queue" ON public.content_queue;
CREATE POLICY "Admins can manage content queue" ON public.content_queue FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- journal_entries
DROP POLICY IF EXISTS "Admins can manage journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Journal entries read access" ON public.journal_entries;
CREATE POLICY "Admins can manage journal entries" ON public.journal_entries FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Journal entries read access" ON public.journal_entries FOR SELECT USING ((status = 'published') OR private.has_role(auth.uid(), 'admin'));

-- storage.objects (blog-images bucket)
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images' AND private.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'blog-images' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images' AND private.has_role(auth.uid(), 'admin'));

-- blog_posts
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- portfolio_projects
DROP POLICY IF EXISTS "Admins can manage portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Admins can manage portfolio projects" ON public.portfolio_projects FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- page_views
DROP POLICY IF EXISTS "Admins can view analytics" ON public.page_views;
CREATE POLICY "Admins can view analytics" ON public.page_views FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- services
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- 4. Drop the now-unused public role helpers (everything references private.*)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- 5. Revoke EXECUTE on remaining internal helpers from signed-in users
REVOKE EXECUTE ON FUNCTION public.create_audit_log(text, text, uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit_persistent(text, integer, integer) FROM PUBLIC, anon, authenticated;
