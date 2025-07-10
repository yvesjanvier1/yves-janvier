-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, doc, video, book, etc.
  file_size BIGINT, -- file size in bytes
  category TEXT, -- documents, videos, books, etc.
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for resources
CREATE POLICY "Anyone can view resources" 
ON public.resources 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert resources" 
ON public.resources 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update resources" 
ON public.resources 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete resources" 
ON public.resources 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_resources_updated_at();

-- Create index for better performance
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_file_type ON public.resources(file_type);
CREATE INDEX idx_resources_featured ON public.resources(featured);
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);