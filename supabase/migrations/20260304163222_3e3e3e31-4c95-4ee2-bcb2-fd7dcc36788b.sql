-- Create content_queue table for generated visual content
CREATE TABLE public.content_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    suggestion_id UUID REFERENCES public.content_suggestions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'quote_card',
    platform TEXT NOT NULL DEFAULT 'instagram',
    image_url TEXT,
    text_content TEXT,
    caption TEXT,
    hashtags TEXT[] DEFAULT '{}'::text[],
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;

-- Admins can manage content queue
CREATE POLICY "Admins can manage content queue"
ON public.content_queue
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_content_queue_updated_at()
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

CREATE TRIGGER update_content_queue_updated_at
BEFORE UPDATE ON public.content_queue
FOR EACH ROW EXECUTE FUNCTION public.update_content_queue_updated_at();