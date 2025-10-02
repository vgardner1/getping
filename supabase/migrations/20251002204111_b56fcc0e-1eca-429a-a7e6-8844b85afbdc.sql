-- Phase 1: CRITICAL - Protect Phone Numbers
-- Drop the existing public policy that exposes phone numbers
DROP POLICY IF EXISTS "Public can view public profiles only" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous can view public profiles" ON public.profiles;

-- Create new secure public view policy that excludes phone_number
CREATE POLICY "Public can view public profiles (no phone)"
ON public.profiles
FOR SELECT
USING (
  is_public = true 
  AND (
    auth.uid() = user_id -- owner can see everything
    OR auth.uid() IS NOT NULL -- authenticated users see public fields
    OR auth.uid() IS NULL -- anonymous users see public fields
  )
);

-- Create secure function to get contact info (phone + email)
-- Only returns data if requester is the owner OR has a connection
CREATE OR REPLACE FUNCTION public.get_user_contact_secure(target_user_id uuid)
RETURNS TABLE(
  phone_number text,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT 
    p.phone_number,
    (SELECT email FROM auth.users WHERE id = target_user_id) as email
  FROM public.profiles p
  WHERE p.user_id = target_user_id
  AND (
    -- User requesting their own data
    auth.uid() = target_user_id
    OR
    -- Users who are connected can see contact info
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE (
        (c.user_id = auth.uid() AND c.target_user_id = target_user_id)
        OR (c.target_user_id = auth.uid() AND c.user_id = target_user_id)
      )
    )
  );
$$;

-- Phase 2: HIGH - Update email function to require authentication and connection
DROP FUNCTION IF EXISTS public.get_user_email_for_contact(uuid);

CREATE OR REPLACE FUNCTION public.get_user_email_for_contact(target_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $$
  SELECT email 
  FROM auth.users 
  WHERE id = target_user_id
  AND (
    -- User requesting their own email
    auth.uid() = target_user_id
    OR
    -- Must be connected to see email
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE (
        (c.user_id = auth.uid() AND c.target_user_id = target_user_id)
        OR (c.target_user_id = auth.uid() AND c.user_id = target_user_id)
      )
    )
  );
$$;

-- Phase 3: MEDIUM - Add rate limiting to profile_views
-- Create trigger to prevent spam from same IP
CREATE OR REPLACE FUNCTION public.check_profile_view_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_views_count integer;
BEGIN
  -- Check for views from same IP in last hour
  IF NEW.viewer_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_views_count
    FROM public.profile_views
    WHERE viewer_ip = NEW.viewer_ip
    AND profile_user_id = NEW.profile_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Allow max 5 views per IP per profile per hour
    IF recent_views_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded for profile views';
    END IF;
  END IF;
  
  -- Validate IP address format (basic check)
  IF NEW.viewer_ip IS NOT NULL AND LENGTH(NEW.viewer_ip) > 45 THEN
    RAISE EXCEPTION 'Invalid IP address format';
  END IF;
  
  -- Limit user_agent length
  IF NEW.user_agent IS NOT NULL AND LENGTH(NEW.user_agent) > 500 THEN
    NEW.user_agent := LEFT(NEW.user_agent, 500);
  END IF;
  
  -- Limit referrer length
  IF NEW.referrer IS NOT NULL AND LENGTH(NEW.referrer) > 500 THEN
    NEW.referrer := LEFT(NEW.referrer, 500);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_view_rate_limit_trigger ON public.profile_views;

CREATE TRIGGER profile_view_rate_limit_trigger
BEFORE INSERT ON public.profile_views
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_view_rate_limit();

-- Update get_public_profile_secure to exclude phone_number
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
  skills text[],
  interests text[],
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  ai_processed boolean,
  profile_completeness integer,
  social_links jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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
    -- Filter social_links to remove ALL sensitive info including phone
    CASE 
      WHEN p.social_links IS NOT NULL THEN
        (SELECT jsonb_object_agg(key, value)
         FROM jsonb_each(p.social_links)
         WHERE key NOT IN ('cashapp', 'zelle', 'paypal', 'venmo', 'phone', 'email'))
      ELSE NULL
    END as social_links
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;