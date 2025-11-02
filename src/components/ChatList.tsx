import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
}

export function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      // Get all conversation participants for the current user
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!participants || participants.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participants.map(p => p.conversation_id);

      // Get messages for these conversations
      const convos: Conversation[] = [];
      
      for (const convId of conversationIds) {
        // Get the other participant
        const { data: otherParticipants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', convId)
          .neq('user_id', user.id)
          .limit(1);

        if (!otherParticipants || otherParticipants.length === 0) continue;
        
        const otherUserId = otherParticipants[0].user_id;

        // Get profile info
        const { data: profileData } = await supabase.rpc(
          'get_public_profile_secure',
          { target_user_id: otherUserId }
        );

        let displayName = 'User';
        let avatarUrl = null;

        if (profileData && profileData[0]) {
          displayName = profileData[0].display_name || 'User';
          avatarUrl = profileData[0].avatar_url;
        }

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1);

        convos.push({
          id: convId,
          other_user_id: otherUserId,
          other_user_name: displayName,
          other_user_avatar: avatarUrl,
          last_message: lastMsg?.[0]?.content || null,
          last_message_time: lastMsg?.[0]?.created_at || null,
        });
      }

      // Sort by last message time
      convos.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-4">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start connecting with people in your network to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      {conversations.map((conv) => (
        <Card
          key={conv.id}
          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate(`/chat/${conv.id}?to=${conv.other_user_id}`)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={conv.other_user_avatar || ''} alt={conv.other_user_name} />
              <AvatarFallback>{conv.other_user_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {conv.other_user_name}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {conv.last_message || 'No messages yet'}
              </p>
            </div>
            {conv.last_message_time && (
              <span className="text-xs text-muted-foreground">
                {new Date(conv.last_message_time).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
