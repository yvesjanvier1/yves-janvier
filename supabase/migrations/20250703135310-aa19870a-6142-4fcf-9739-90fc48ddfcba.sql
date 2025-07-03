
-- Fix security warnings from Supabase linter

-- 1. Fix function search_path issues by setting immutable search_path
-- Update track_page_view function to have immutable search_path
CREATE OR REPLACE FUNCTION public.track_page_view(page_path text, visitor text, referrer text, agent text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  view_id UUID;
BEGIN
  INSERT INTO public.page_views (page, visitor_id, referrer, user_agent)
  VALUES (page_path, visitor, referrer, agent)
  RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$function$;

-- Update update_journal_entries_updated_at function to have immutable search_path
CREATE OR REPLACE FUNCTION public.update_journal_entries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
