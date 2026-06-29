
-- Grants required now that functions run as SECURITY INVOKER
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;

GRANT SELECT ON public.portfolio_projects TO anon, authenticated;
GRANT ALL ON public.portfolio_projects TO service_role;

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

-- Convert previously SECURITY DEFINER public-callable functions to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.set_current_locale(_locale text)
 RETURNS void
 LANGUAGE sql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT set_config('app.current_locale', _locale, false);
$function$;

CREATE OR REPLACE FUNCTION public.set_locale_and_get_blog_posts(_locale text, _limit integer DEFAULT 10, _offset integer DEFAULT 0, _tag text DEFAULT NULL::text, _search text DEFAULT NULL::text)
 RETURNS SETOF public.blog_posts
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM set_config('app.current_locale', COALESCE(_locale, 'fr'), true);
  RETURN QUERY
  SELECT bp.*
  FROM public.blog_posts bp
  WHERE bp.published = true
    AND (_tag IS NULL OR _tag = ANY(bp.tags))
    AND (
      _search IS NULL OR 
      bp.title ILIKE '%' || _search || '%' OR 
      bp.excerpt ILIKE '%' || _search || '%' OR 
      bp.content ILIKE '%' || _search || '%'
    )
  ORDER BY bp.created_at DESC
  LIMIT COALESCE(_limit, 10)
  OFFSET COALESCE(_offset, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_locale_and_get_portfolio_projects(_locale text, _limit integer DEFAULT 12, _offset integer DEFAULT 0, _category text DEFAULT NULL::text, _featured boolean DEFAULT NULL::boolean)
 RETURNS SETOF public.portfolio_projects
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM set_config('app.current_locale', COALESCE(_locale, 'fr'), true);
  RETURN QUERY
  SELECT p.*
  FROM public.portfolio_projects p
  WHERE (_category IS NULL OR p.category = _category)
    AND (_featured IS NULL OR p.featured = _featured)
  ORDER BY p.created_at DESC
  LIMIT COALESCE(_limit, 12)
  OFFSET COALESCE(_offset, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_page_view(page_path text, visitor text, referrer text, agent text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
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
