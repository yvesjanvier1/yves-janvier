
-- Content suggestions table for AI-generated topic ideas
CREATE TABLE public.content_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  description TEXT,
  relevance_score INTEGER DEFAULT 0,
  category TEXT,
  target_platforms TEXT[] DEFAULT '{blog,instagram,linkedin,whatsapp}'::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  source_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage content suggestions
CREATE POLICY "Admins can manage content suggestions"
  ON public.content_suggestions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger
CREATE OR REPLACE FUNCTION public.update_content_suggestions_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_content_suggestions_updated_at
  BEFORE UPDATE ON public.content_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_suggestions_updated_at();
