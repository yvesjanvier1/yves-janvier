-- Fix security warning: Function Search Path Mutable
-- Update the rate limiting function to have a secure search path

CREATE OR REPLACE FUNCTION public.check_rate_limit_persistent(
  p_identifier text,
  p_max_requests integer DEFAULT 5,
  p_window_minutes integer DEFAULT 5
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  -- Calculate current window start
  window_start := date_trunc('minute', now()) - (EXTRACT(minute FROM now())::integer % p_window_minutes) * interval '1 minute';
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - (p_window_minutes * 2) * interval '1 minute');
  
  -- Get or create current count for this identifier and window
  INSERT INTO public.rate_limits (identifier, request_count, window_start)
  VALUES (p_identifier, 1, window_start)
  ON CONFLICT (identifier, window_start) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  -- Return true if under limit, false if over limit
  RETURN current_count <= p_max_requests;
END;
$$;