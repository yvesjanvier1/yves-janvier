
-- Create a table to store now page data
CREATE TABLE public.now_page (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  working_on JSONB NOT NULL DEFAULT '[]'::jsonb,
  currently_learning JSONB NOT NULL DEFAULT '[]'::jsonb,
  using_right_now JSONB NOT NULL DEFAULT '[]'::jsonb,
  listening_to JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.now_page ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view now page data" 
  ON public.now_page 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert now page data" 
  ON public.now_page 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update now page data" 
  ON public.now_page 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete now page data" 
  ON public.now_page 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_now_page_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_now_page_updated_at_trigger
  BEFORE UPDATE ON public.now_page
  FOR EACH ROW
  EXECUTE FUNCTION update_now_page_updated_at();
