import { supabase } from "@/integrations/supabase/client";

export const createChatWithUser = async (targetUserId: string, currentUserId: string) => {
  try {
    // First try the database function (fallback)
    const { data: conversationId, error: rpcError } = await supabase.rpc('create_chat_and_connect', {
      p_current_user: currentUserId,
      p_target_user: targetUserId
    });

    if (!rpcError && conversationId) {
      console.log('Successfully created chat via RPC:', conversationId);
      return conversationId;
    }

    // If RPC fails, try the edge function for more robust handling
    console.log('RPC failed, trying edge function:', rpcError);
    
    const { data, error: edgeError } = await supabase.functions.invoke('create-chat', {
      body: { targetUserId }
    });

    if (edgeError) {
      console.error('Edge function error:', edgeError);
      throw new Error(`Failed to create chat: ${edgeError.message}`);
    }

    if (!data?.success || !data?.conversationId) {
      console.error('Invalid response from edge function:', data);
      throw new Error('Failed to create chat: Invalid response');
    }

    console.log('Successfully created chat via edge function:', data.conversationId);
    return data.conversationId;

  } catch (error) {
    console.error('Error in createChatWithUser:', error);
    throw error;
  }
};