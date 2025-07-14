-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path TO 'public';

-- Optimize RLS policies for resources table to prevent auth re-evaluation
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can update resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can delete resources" ON public.resources;

CREATE POLICY "Authenticated users can insert resources" 
ON public.resources 
FOR INSERT 
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update resources" 
ON public.resources 
FOR UPDATE 
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can delete resources" 
ON public.resources 
FOR DELETE 
USING ((SELECT auth.role()) = 'authenticated');

-- Fix multiple permissive policies issue for journal_entries
DROP POLICY IF EXISTS "Authenticated users can manage journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Journal entries access policy" ON public.journal_entries;

-- Create consolidated policies for journal_entries
CREATE POLICY "Journal entries read access" 
ON public.journal_entries 
FOR SELECT 
USING ((status = 'published') OR ((SELECT auth.role()) = 'authenticated'));

CREATE POLICY "Authenticated users can manage journal entries" 
ON public.journal_entries 
FOR ALL 
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');