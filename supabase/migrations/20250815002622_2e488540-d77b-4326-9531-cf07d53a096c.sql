-- Fix security warning: Set search_path for the function to prevent search path manipulation attacks
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
    p.ai_processed,
    p.profile_completeness
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

COMMENT ON FUNCTION public.get_public_profile IS 'Securely returns only non-sensitive profile fields for public viewing by other authenticated users';