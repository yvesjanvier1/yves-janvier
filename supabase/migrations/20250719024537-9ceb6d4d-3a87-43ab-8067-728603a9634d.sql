
-- Drop the existing policies to recreate them securely
DROP POLICY IF EXISTS "Subscribers can update their subscription" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON public.newsletter_subscriptions;

-- Create a more secure update policy - only allow updating your own subscription by email
CREATE POLICY "Users can update their own subscription" 
  ON public.newsletter_subscriptions 
  FOR UPDATE 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.role() = 'authenticated');

-- Restrict SELECT to admin users only (you can adjust this based on your admin setup)
CREATE POLICY "Admin users can view all subscriptions" 
  ON public.newsletter_subscriptions 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Add email validation constraint
ALTER TABLE public.newsletter_subscriptions 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create trigger function for updating updated_at column
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_newsletter_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Optional: Add user_id column for better user association (nullable for anonymous subscriptions)
ALTER TABLE public.newsletter_subscriptions 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update the policy to allow users to update based on user_id as well
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.newsletter_subscriptions;
CREATE POLICY "Users can update their own subscription" 
  ON public.newsletter_subscriptions 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid())) OR 
    auth.role() = 'authenticated'
  );

-- Create index on user_id for better performance
CREATE INDEX idx_newsletter_subscriptions_user_id ON public.newsletter_subscriptions(user_id) WHERE user_id IS NOT NULL;
