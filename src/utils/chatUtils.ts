import { supabase } from "@/integrations/supabase/client";

export const createChatWithUser = async (targetUserId: string, currentUserId: string) => {
  try {
    const { data: conversationId, error } = await supabase.rpc('create_chat_and_connect', {
      p_current_user: currentUserId,
      p_target_user: targetUserId
    });

    if (error) {
      console.error('Error creating chat:', error);
      throw error;
    }

    return conversationId;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};