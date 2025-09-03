-- Fix Newsletter RLS Security Issue
-- Replace overly permissive policies with secure, granular access control

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow newsletter management for authenticated users" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.newsletter_subscriptions;

-- Create secure policies that only allow users to access their own data
CREATE POLICY "Users can view their own newsletter subscription" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own newsletter subscription" 
ON public.newsletter_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own newsletter subscription" 
ON public.newsletter_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all subscriptions for management purposes
CREATE POLICY "Admins can view all newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create rate limiting table for persistent tracking
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
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