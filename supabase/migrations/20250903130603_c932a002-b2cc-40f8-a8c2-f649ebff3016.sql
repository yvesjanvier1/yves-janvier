-- Fix security issue: Restrict SELECT access to contact_messages to admins only
-- This ensures customer contact information can only be read by administrators

-- Drop the existing ALL policy for admins and recreate with specific commands for clarity
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;

-- Create explicit policies for different operations
CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep the existing INSERT policy for public contact form submissions
-- (This allows the contact form to work for visitors)