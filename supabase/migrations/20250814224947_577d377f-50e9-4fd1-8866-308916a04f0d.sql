-- Add new columns to profiles table for enhanced profile data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS featured_work JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0;

-- Create table for storing social media data during processing
CREATE TABLE IF NOT EXISTS public.social_media_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'instagram' or 'linkedin'
  raw_data JSONB NOT NULL,
  processed_data JSONB,
  access_token TEXT, -- encrypted token for future API calls
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS on social_media_data
ALTER TABLE public.social_media_data ENABLE ROW LEVEL SECURITY;

-- Create policies for social_media_data
CREATE POLICY "Users can view their own social media data" 
ON public.social_media_data 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own social media data" 
ON public.social_media_data 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own social media data" 
ON public.social_media_data 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create table for storing AI processing jobs
CREATE TABLE IF NOT EXISTS public.profile_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  platforms TEXT[] NOT NULL, -- platforms to process
  progress INTEGER DEFAULT 0, -- percentage complete
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profile_processing_jobs
ALTER TABLE public.profile_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for profile_processing_jobs
CREATE POLICY "Users can view their own processing jobs" 
ON public.profile_processing_jobs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Edge functions can manage processing jobs" 
ON public.profile_processing_jobs 
FOR ALL 
USING (true);