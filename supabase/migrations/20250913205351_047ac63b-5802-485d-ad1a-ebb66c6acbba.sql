-- Update get_public_profile_secure to remove sensitive data exposure

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
    p.skills,
    p.interests,
    p.created_at,
    p.updated_at,
    p.ai_processed,
    p.profile_completeness,
    -- Filter social_links to remove sensitive payment/contact info
    CASE 
      WHEN p.social_links IS NOT NULL THEN
        (SELECT jsonb_object_agg(key, value)
         FROM jsonb_each(p.social_links)
         WHERE key NOT IN ('phone', 'email', 'venmo', 'cashapp', 'zelle', 'paypal'))
      ELSE NULL
    END as social_links
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

-- Also need to ensure phone number access is properly controlled
-- Create a function for getting contact info (only for the owner or with explicit permission)
CREATE OR REPLACE FUNCTION public.get_profile_contact_info(target_user_id uuid)
RETURNS TABLE(
  phone_number text,
  email text,
  contact_social_links jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.phone_number,
    -- Get email from auth.users securely
    (SELECT email FROM auth.users WHERE id = target_user_id) as email,
    -- Only return contact-related social links
    CASE 
      WHEN p.social_links IS NOT NULL THEN
        (SELECT jsonb_object_agg(key, value)
         FROM jsonb_each(p.social_links)
         WHERE key IN ('phone', 'email', 'venmo', 'cashapp', 'zelle', 'paypal'))
      ELSE NULL
    END as contact_social_links
  FROM public.profiles p
  WHERE p.user_id = target_user_id
  AND (
    -- Only the user themselves can access their contact info
    auth.uid() = target_user_id
    OR
    -- Or edge functions with service role
    current_setting('role', true) = 'service_role'
  );
$$;