-- Update the get_public_profile_secure function to be actually secure
-- and not expose sensitive data like phone numbers

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
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  ai_processed boolean,
  profile_completeness integer,
  social_links jsonb,
  phone_number text
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
    p.skills,
    p.interests,
    p.created_at,
    p.updated_at,
    p.ai_processed,
    p.profile_completeness,
    -- Only return full social_links and phone_number if requester is the profile owner
    CASE 
      WHEN auth.uid() = target_user_id THEN p.social_links
      ELSE (
        -- For other users, filter out sensitive payment and contact info
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(COALESCE(p.social_links, '{}'::jsonb))
        WHERE key NOT IN ('phone', 'email', 'venmo', 'cashapp', 'zelle', 'paypal')
      )
    END as social_links,
    -- Only return phone number if requester is the profile owner
    CASE 
      WHEN auth.uid() = target_user_id THEN p.phone_number
      ELSE NULL
    END as phone_number
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;