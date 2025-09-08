-- Conversations and messaging schema for real chat data

-- 1) Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('personal','business')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Conversation participants (many-to-many)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- 3) Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Conversations: only participants can select/update; allow any authenticated user to insert a new conversation
CREATE POLICY "conversations_select_participants_only"
ON public.conversations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants cp
  WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
));

CREATE POLICY "conversations_insert_any_authenticated"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_update_participants_only"
ON public.conversations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants cp
  WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
));

-- Conversation participants: users can manage their own participant rows
CREATE POLICY "participants_select_own"
ON public.conversation_participants
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "participants_insert_self"
ON public.conversation_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants_update_self"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "participants_delete_self"
ON public.conversation_participants
FOR DELETE
USING (user_id = auth.uid());

-- Messages: participants can read; only sender can insert/update/delete
CREATE POLICY "messages_select_participants"
ON public.messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants cp
  WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
));

CREATE POLICY "messages_insert_sender_is_participant"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "messages_update_sender_only"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "messages_delete_sender_only"
ON public.messages
FOR DELETE
USING (sender_id = auth.uid());

-- Timestamp triggers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at'
  ) THEN
    CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Auto-create profile on new auth user
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;