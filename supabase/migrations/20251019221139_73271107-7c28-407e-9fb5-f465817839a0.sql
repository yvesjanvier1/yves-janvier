-- Functions to ensure locale is set within the same transaction as the SELECT
-- This removes race conditions causing intermittent empty results

-- Blog posts
CREATE OR REPLACE FUNCTION public.set_locale_and_get_blog_posts(
  _locale text,
  _limit integer DEFAULT 10,
  _offset integer DEFAULT 0,
  _tag text DEFAULT NULL,
  _search text DEFAULT NULL
)
RETURNS SETOF public.blog_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Portfolio projects
CREATE OR REPLACE FUNCTION public.set_locale_and_get_portfolio_projects(
  _locale text,
  _limit integer DEFAULT 12,
  _offset integer DEFAULT 0,
  _category text DEFAULT NULL,
  _featured boolean DEFAULT NULL
)
RETURNS SETOF public.portfolio_projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;