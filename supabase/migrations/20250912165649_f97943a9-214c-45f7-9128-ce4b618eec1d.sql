-- Add social_links and phone_number to the public profile function
CREATE OR REPLACE FUNCTION public.get_public_profile_secure(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  company text,
  job_title text,
  website_url text,
  skills text[],
  interests text[],
  created_at timestamptz,
  updated_at timestamptz,
  ai_processed boolean,
  profile_completeness integer,
  social_links jsonb,
  phone_number text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
    p.profile_completeness,
    p.social_links,
    p.phone_number
  FROM public.profiles p
  WHERE p.user_id = target_user_id
    AND (auth.uid() IS NULL OR p.user_id <> auth.uid());
$function$;