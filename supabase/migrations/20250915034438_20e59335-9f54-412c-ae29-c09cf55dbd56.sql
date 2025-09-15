-- Update get_public_profile_secure function to include phone_number for contact sharing
-- This allows phone numbers to be displayed and saved in contacts when profiles are shared

DROP FUNCTION IF EXISTS public.get_public_profile_secure(uuid);

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
  phone_number text,
  skills text[], 
  interests text[], 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  ai_processed boolean, 
  profile_completeness integer, 
  social_links jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
    p.phone_number,
    p.skills,
    p.interests,
    p.created_at,
    p.updated_at,
    p.ai_processed,
    p.profile_completeness,
    -- Filter social_links to remove sensitive payment info but keep public social media
    CASE 
      WHEN p.social_links IS NOT NULL THEN
        (SELECT jsonb_object_agg(key, value)
         FROM jsonb_each(p.social_links)
         WHERE key NOT IN ('cashapp', 'zelle', 'paypal'))
      ELSE NULL
    END as social_links
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;