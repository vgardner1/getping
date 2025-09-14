import { supabase } from "@/integrations/supabase/client";

export const createChatWithUser = async (targetUserId: string, currentUserId: string) => {
  try {
    // First create connection between users
    const { error: connectionError } = await supabase
      .from('connections')
      .insert({
        user_id: currentUserId,
        target_user_id: targetUserId
      });

    if (connectionError && !connectionError.message.includes('duplicate')) {
      console.error('Error creating connection:', connectionError);
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        category: 'personal'
      })
      .select()
      .single();

    if (conversationError) {
      throw conversationError;
    }

    // Add both users as participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: conversation.id,
          user_id: currentUserId
        },
        {
          conversation_id: conversation.id,
          user_id: targetUserId
        }
      ]);

    if (participantsError) {
      throw participantsError;
    }

    return conversation.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};