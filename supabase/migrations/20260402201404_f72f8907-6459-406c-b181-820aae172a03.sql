
-- =============================================
-- 1. about_page: replace authenticated → admin
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert about page" ON about_page;
DROP POLICY IF EXISTS "Authenticated users can update about page" ON about_page;
DROP POLICY IF EXISTS "Authenticated users can delete about page" ON about_page;

CREATE POLICY "Admins can insert about page" ON about_page
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update about page" ON about_page
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete about page" ON about_page
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 2. experience: replace authenticated → admin
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert experience" ON experience;
DROP POLICY IF EXISTS "Authenticated users can update experience" ON experience;
DROP POLICY IF EXISTS "Authenticated users can delete experience" ON experience;

CREATE POLICY "Admins can insert experience" ON experience
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update experience" ON experience
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete experience" ON experience
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 3. skills: replace authenticated → admin
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can update skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can delete skills" ON skills;

CREATE POLICY "Admins can insert skills" ON skills
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update skills" ON skills
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete skills" ON skills
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 4. now_page: replace authenticated → admin
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert now page data" ON now_page;
DROP POLICY IF EXISTS "Authenticated users can update now page data" ON now_page;
DROP POLICY IF EXISTS "Authenticated users can delete now page data" ON now_page;

CREATE POLICY "Admins can insert now page data" ON now_page
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update now page data" ON now_page
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete now page data" ON now_page
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 5. resources: replace authenticated → admin
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON resources;
DROP POLICY IF EXISTS "Authenticated users can update resources" ON resources;
DROP POLICY IF EXISTS "Authenticated users can delete resources" ON resources;

CREATE POLICY "Admins can insert resources" ON resources
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update resources" ON resources
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete resources" ON resources
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 6. journal_entries: replace authenticated → admin for writes
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can manage journal entries" ON journal_entries;

CREATE POLICY "Admins can manage journal entries" ON journal_entries
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 7. Tighten always-true INSERT policies
-- =============================================

-- contact_messages: require non-empty fields
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT TO public
  WITH CHECK (
    length(trim(name)) > 0 AND
    length(trim(email)) > 0 AND
    length(trim(message)) > 0
  );

-- newsletter_subscriptions: require non-empty email
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
  FOR INSERT TO public
  WITH CHECK (length(trim(email)) > 0);
