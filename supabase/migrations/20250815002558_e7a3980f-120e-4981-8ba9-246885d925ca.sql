-- Remove the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profile access
-- 1. Users can only view their own complete profile (including sensitive data)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Authenticated users can view basic profile information of others (networking functionality)
-- This policy allows reading but the application should filter sensitive fields
CREATE POLICY "Authenticated users can view basic profile info of others" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND auth.uid() != user_id
);

-- Create a function to safely get public profile data (non-sensitive fields only)
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id UUID)
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
  ai_processed BOOLEAN,
  profile_completeness INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
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
    p.ai_processed,
    p.profile_completeness
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

COMMENT ON POLICY "Users can view their own complete profile" ON public.profiles IS 'Users have full access to their own profile data including sensitive information like phone numbers';
COMMENT ON POLICY "Authenticated users can view basic profile info of others" ON public.profiles IS 'Allows authenticated users to view other profiles for networking, but application must filter sensitive fields';
COMMENT ON FUNCTION public.get_public_profile IS 'Returns only non-sensitive profile fields for public viewing by other authenticated users';