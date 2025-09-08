-- Add additional profile fields for social media and contact info
ALTER TABLE public.profiles 
ADD COLUMN instagram_handle TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN phone_number TEXT;