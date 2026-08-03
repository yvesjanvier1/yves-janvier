DROP POLICY IF EXISTS "Journal entries read access" ON public.journal_entries;

CREATE POLICY "Public can view published journal entries"
ON public.journal_entries
FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Admins can view all journal entries"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));