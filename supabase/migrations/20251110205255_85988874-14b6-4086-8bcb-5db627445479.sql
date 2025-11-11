-- Create invite_links table
CREATE TABLE IF NOT EXISTS public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL,
  invite_code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  invite_method VARCHAR(20),
  CONSTRAINT fk_inviter FOREIGN KEY (inviter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create pending_invites table
CREATE TABLE IF NOT EXISTS public.pending_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL,
  invitee_phone VARCHAR(20),
  invitee_email VARCHAR(255),
  invitee_name VARCHAR(100),
  invite_link_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_inviter FOREIGN KEY (inviter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_invite_link FOREIGN KEY (invite_link_id) REFERENCES public.invite_links(id) ON DELETE SET NULL
);

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  circle_built BOOLEAN DEFAULT FALSE,
  invite_method VARCHAR(20),
  invites_sent INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invite_links_inviter ON public.invite_links(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON public.invite_links(invite_code);
CREATE INDEX IF NOT EXISTS idx_pending_invites_inviter ON public.pending_invites(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user ON public.onboarding_progress(user_id);

-- Enable RLS on new tables
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite_links
CREATE POLICY "Users can create their own invite links"
  ON public.invite_links
  FOR INSERT
  WITH CHECK (auth.uid() = inviter_user_id);

CREATE POLICY "Users can view their own invite links"
  ON public.invite_links
  FOR SELECT
  USING (auth.uid() = inviter_user_id);

CREATE POLICY "Anyone can view invite links by code"
  ON public.invite_links
  FOR SELECT
  USING (true);

-- RLS Policies for pending_invites
CREATE POLICY "Users can create their own pending invites"
  ON public.pending_invites
  FOR INSERT
  WITH CHECK (auth.uid() = inviter_user_id);

CREATE POLICY "Users can view their own pending invites"
  ON public.pending_invites
  FOR SELECT
  USING (auth.uid() = inviter_user_id);

CREATE POLICY "Users can update their own pending invites"
  ON public.pending_invites
  FOR UPDATE
  USING (auth.uid() = inviter_user_id);

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view their own onboarding progress"
  ON public.onboarding_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress"
  ON public.onboarding_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
  ON public.onboarding_progress
  FOR UPDATE
  USING (auth.uid() = user_id);