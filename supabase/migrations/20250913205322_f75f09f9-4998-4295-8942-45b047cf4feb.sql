-- Fix the security definer view issue by removing it and using proper RLS

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.safe_social_media_data;

-- Instead, we'll rely on the existing RLS policies on social_media_data table
-- which already properly restrict access to user's own data only

-- Add additional protection: create a function to safely access social data without tokens
CREATE OR REPLACE FUNCTION public.get_safe_social_data(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  platform text,
  raw_data jsonb,
  processed_data jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return data if the requester is the owner or has proper permissions
  SELECT 
    s.id,
    s.user_id,
    s.platform,
    s.raw_data,
    s.processed_data,
    s.created_at,
    s.updated_at
  FROM public.social_media_data s
  WHERE s.user_id = target_user_id
  AND (
    -- User can access their own data
    auth.uid() = target_user_id
    OR
    -- Or this is being called from a service context (edge functions)
    current_setting('role', true) = 'service_role'
  );
$$;