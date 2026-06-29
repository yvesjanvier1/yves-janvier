
-- 1. Journal entries: restrict drafts to admins
DROP POLICY IF EXISTS "Journal entries read access" ON public.journal_entries;
CREATE POLICY "Journal entries read access"
  ON public.journal_entries
  FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

-- 2. Blog images storage: admin-only writes; remove broad listing SELECT
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Blog images are publicly accessible" ON storage.objects;

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

-- Note: blog-images bucket remains public; files are served via the public
-- object URL endpoint without requiring a storage.objects SELECT policy.
-- Removing the broad SELECT policy prevents anonymous bucket listing.

-- 3. Newsletter: drop subscriber self-read to avoid exposing confirmation_token.
DROP POLICY IF EXISTS "Users can view their own newsletter subscription" ON public.newsletter_subscriptions;

-- Also clear confirmation_token once a subscription is confirmed.
UPDATE public.newsletter_subscriptions
   SET confirmation_token = NULL
 WHERE is_confirmed = true AND confirmation_token IS NOT NULL;

-- 4. page_views: replace WITH CHECK (true) with basic field validation.
DROP POLICY IF EXISTS "Allow page view tracking" ON public.page_views;
CREATE POLICY "Allow page view tracking"
  ON public.page_views
  FOR INSERT
  WITH CHECK (page IS NOT NULL AND length(page) > 0);

-- 5. Revoke EXECUTE on SECURITY DEFINER helpers that should not be exposed
--    via the Data API. Trigger functions and admin/internal helpers don't
--    need direct callability from anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.update_newsletter_subscriptions_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_now_page_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_resources_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_content_queue_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_content_suggestions_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_journal_entries_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_blog_post_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_project_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit_persistent(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_audit_log(text, text, uuid, jsonb, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
