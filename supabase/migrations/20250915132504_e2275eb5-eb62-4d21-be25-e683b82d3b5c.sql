-- Create a SECURITY DEFINER function to create/find a conversation and ensure connections
CREATE OR REPLACE FUNCTION public.create_chat_and_connect(p_current_user uuid, p_target_user uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Prevent self conversations
  IF p_current_user = p_target_user THEN
    RAISE EXCEPTION 'Cannot create conversation with self';
  END IF;

  -- Ensure forward connection exists
  INSERT INTO public.connections (user_id, target_user_id)
  SELECT p_current_user, p_target_user
  WHERE NOT EXISTS (
    SELECT 1 FROM public.connections c 
    WHERE c.user_id = p_current_user AND c.target_user_id = p_target_user
  );

  -- Ensure reciprocal connection exists
  INSERT INTO public.connections (user_id, target_user_id)
  SELECT p_target_user, p_current_user
  WHERE NOT EXISTS (
    SELECT 1 FROM public.connections c 
    WHERE c.user_id = p_target_user AND c.target_user_id = p_current_user
  );

  -- Try to find an existing conversation between the two users
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = p_current_user
  JOIN public.conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = p_target_user
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    -- Create new conversation
    INSERT INTO public.conversations (category)
    VALUES ('personal')
    RETURNING id INTO v_conversation_id;

    -- Add participants (both users)
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, p_current_user), (v_conversation_id, p_target_user);
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Grant execute to authenticated users
REVOKE ALL ON FUNCTION public.create_chat_and_connect(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_chat_and_connect(uuid, uuid) TO authenticated;
