-- Add scheduling columns to content_queue
ALTER TABLE public.content_queue
  ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS slide_number integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_group_id uuid DEFAULT NULL;