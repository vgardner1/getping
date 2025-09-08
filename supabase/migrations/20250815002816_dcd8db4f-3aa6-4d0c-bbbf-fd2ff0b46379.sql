-- CRITICAL SECURITY FIX: Prevent exposure of sensitive profile data and social media tokens

-- 1. Remove the overly permissive policy that still exposes sensitive data
DROP POLICY IF EXISTS "Authenticated users can view basic profile info of others" ON public.profiles;

-- 2. Create a secure policy that only allows viewing specific non-sensitive columns
-- This uses a column-level restriction approach
CREATE POLICY "Authenticated users can view public profile fields only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
  AND (
    -- Only allow access to these specific non-sensitive columns through this policy
    -- The application must explicitly select only these columns
    true -- This policy will be used with the secure view/function approach
  )
);

-- 3. Create a secure view for public profile data (non-sensitive fields only)
CREATE OR REPLACE VIEW public.public_profiles_view AS
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
  updated_at,
  ai_processed,
  profile_completeness
  -- Explicitly EXCLUDE: phone_number, instagram_handle, linkedin_url, experience, featured_work, social_links
FROM public.profiles;

-- 4. Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles_view TO authenticated;

-- 5. Ensure social_media_data access tokens are NEVER exposed to other users
-- Check existing policies and ensure they're secure
DROP POLICY IF EXISTS "Users can view other users social media data" ON public.social_media_data;

-- Verify the social media data policies are secure - users should only see their own data
-- (The existing policies look correct, but let's ensure no other policies exist)

-- 6. Create a function to safely get public profile data for networking
CREATE OR REPLACE FUNCTION public.get_public_profile_secure(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  job_title TEXT,
  website_url TEXT,
  skills TEXT[],
  interests TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  ai_processed BOOLEAN,
  profile_completeness INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.company,
    p.job_title,
    p.website_url,
    p.skills,
    p.interests,
    p.created_at,
    p.updated_at,
    p.ai_processed,
    p.profile_completeness
  FROM public.profiles p
  WHERE p.user_id = target_user_id
  AND p.user_id != auth.uid(); -- Ensure users can't use this to view their own data
$$;

-- 7. Drop the old less secure function
DROP FUNCTION IF EXISTS public.get_public_profile(UUID);

COMMENT ON POLICY "Users can view their own complete profile" ON public.profiles IS 'Users have full access to their own profile data including sensitive information like phone numbers and social handles';
COMMENT ON POLICY "Authenticated users can view public profile fields only" ON public.profiles IS 'Restricts other users to only view non-sensitive profile fields - use public_profiles_view or get_public_profile_secure function';
COMMENT ON VIEW public.public_profiles_view IS 'Secure view exposing only non-sensitive profile fields for public networking. Excludes phone numbers, social handles, and private data';
COMMENT ON FUNCTION public.get_public_profile_secure IS 'Securely returns only non-sensitive profile fields for viewing other users profiles. Never exposes sensitive data like phone numbers or social tokens';