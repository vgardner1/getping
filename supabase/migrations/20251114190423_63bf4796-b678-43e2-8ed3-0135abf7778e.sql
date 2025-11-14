-- Create table for contact requests from public profile visitors
CREATE TABLE public.profile_contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  visitor_phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure at least email or phone is provided
  CONSTRAINT at_least_one_contact CHECK (
    visitor_email IS NOT NULL OR visitor_phone IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE public.profile_contact_requests ENABLE ROW LEVEL SECURITY;

-- Profile owners can view contact requests for their profile
CREATE POLICY "Profile owners can view their contact requests"
  ON public.profile_contact_requests
  FOR SELECT
  USING (auth.uid() = profile_user_id);

-- Anyone can submit a contact request
CREATE POLICY "Anyone can submit contact requests"
  ON public.profile_contact_requests
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_profile_contact_requests_profile_user_id 
  ON public.profile_contact_requests(profile_user_id);

CREATE INDEX idx_profile_contact_requests_created_at 
  ON public.profile_contact_requests(created_at DESC);