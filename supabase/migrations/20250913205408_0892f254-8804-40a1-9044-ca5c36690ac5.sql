-- Fix critical security vulnerability: Restrict profile access to public data only (Step 1)

-- First, drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view other profiles for function access" ON public.profiles;

-- Drop any existing policy with similar name
DROP POLICY IF EXISTS "Users can view public profile data only" ON public.profiles;