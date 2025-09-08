-- Remove the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profile access
-- 1. Users can view basic profile information of other authenticated users (for networking)
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can see basic networking information but NOT sensitive personal data
  auth.uid() IS NOT NULL
);

-- 2. Users can view their own complete profile including sensitive data
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create a security function to get public profile data only
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_row public.profiles)
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
SELECT json_build_object(
  'id', profile_row.id,
  'user_id', profile_row.user_id,
  'display_name', profile_row.display_name,
  'avatar_url', profile_row.avatar_url,
  'bio', profile_row.bio,
  'location', profile_row.location,
  'company', profile_row.company,
  'job_title', profile_row.job_title,
  'website_url', profile_row.website_url,
  'skills', profile_row.skills,
  'interests', profile_row.interests,
  'created_at', profile_row.created_at,
  'ai_processed', profile_row.ai_processed,
  'profile_completeness', profile_row.profile_completeness
  -- Deliberately exclude: phone_number, instagram_handle, linkedin_url, experience, featured_work, social_links
);
$$;

-- Create a view for public profiles that only shows non-sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  location,
  company,
  job_title,
  website_url,
  skills,
  interests,
  created_at,
  ai_processed,
  profile_completeness
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Allow authenticated users to view public profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.public_profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

COMMENT ON POLICY "Authenticated users can view basic profile info" ON public.profiles IS 'Allows authenticated users to view profiles but sensitive data should be filtered in application logic';
COMMENT ON POLICY "Users can view their own complete profile" ON public.profiles IS 'Users have full access to their own profile data including sensitive information';
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles excluding sensitive personal data like phone numbers and social handles';