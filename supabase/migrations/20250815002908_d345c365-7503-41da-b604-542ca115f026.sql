-- Fix the Security Definer View warning by removing the view and using only the function approach

-- Remove the problematic view
DROP VIEW IF EXISTS public.public_profiles_view;

-- Instead, let's create a more restrictive RLS policy approach
-- Remove the current policy and create column-aware policies

DROP POLICY IF EXISTS "Authenticated users can view public profile fields only" ON public.profiles;

-- Create a policy that works with application-level column filtering
-- Since RLS works at row level, we'll rely on the secure function for column-level security
CREATE POLICY "Authenticated users can view other profiles for function access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- This policy allows the secure function to access data
  -- but direct table access should use the secure function only
  auth.uid() IS NOT NULL 
);

-- Update the function to be the primary secure access method
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

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile_secure(UUID) TO authenticated;

-- Create a function to get multiple public profiles (for networking lists)
CREATE OR REPLACE FUNCTION public.get_public_profiles_list(user_ids UUID[])
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
  WHERE p.user_id = ANY(user_ids)
  AND p.user_id != auth.uid(); -- Exclude the current user's own profile
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profiles_list(UUID[]) TO authenticated;

COMMENT ON POLICY "Users can view their own complete profile" ON public.profiles IS 'Users have full access to their own profile data including sensitive information';
COMMENT ON POLICY "Authenticated users can view other profiles for function access" ON public.profiles IS 'Allows secure functions to access profile data - applications should use get_public_profile_secure() function only';
COMMENT ON FUNCTION public.get_public_profile_secure IS 'Securely returns only non-sensitive profile fields for viewing other users. NEVER exposes phone numbers, social handles, or access tokens';
COMMENT ON FUNCTION public.get_public_profiles_list IS 'Securely returns multiple public profiles for networking lists. Excludes all sensitive data';