-- Create persistent rate limiting system for security

-- Create rate limiting table for persistent tracking
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, window_start)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_window ON public.rate_limits(identifier, window_start);

-- Allow public access to rate limiting table for contact forms
CREATE POLICY "Anyone can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (true);

-- Create function to check rate limits persistently
CREATE OR REPLACE FUNCTION public.check_rate_limit_persistent(
  p_identifier text,
  p_max_requests integer DEFAULT 5,
  p_window_minutes integer DEFAULT 5
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  -- Calculate current window start
  window_start := date_trunc('minute', now()) - (EXTRACT(minute FROM now())::integer % p_window_minutes) * interval '1 minute';
  
  -- Clean up old entries (keep last 2 windows for safety)
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - (p_window_minutes * 2) * interval '1 minute');
  
  -- Get current count for this identifier and window
  SELECT request_count INTO current_count
  FROM public.rate_limits 
  WHERE identifier = p_identifier AND window_start = window_start;
  
  IF current_count IS NULL THEN
    -- First request in this window
    INSERT INTO public.rate_limits (identifier, request_count, window_start)
    VALUES (p_identifier, 1, window_start);
    RETURN true;
  ELSE
    -- Check if under limit
    IF current_count >= p_max_requests THEN
      RETURN false;
    ELSE
      -- Increment counter
      UPDATE public.rate_limits 
      SET request_count = request_count + 1, updated_at = now()
      WHERE identifier = p_identifier AND window_start = window_start;
      RETURN true;
    END IF;
  END IF;
END;
$$;