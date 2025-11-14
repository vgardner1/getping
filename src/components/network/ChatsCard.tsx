import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
}

export const ChatsCard = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();

    // Subscribe to real-time message updates
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadChats(); // Reload when any message changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      const conversationIds = participantData?.map(p => p.conversation_id) || [];
      if (conversationIds.length === 0) { setLoading(false); return; }

      const { data: messages } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!messages || messages.length === 0) {
        setLoading(false);
        return;
      }

      const conversationMessages = new Map<string, any[]>();
      messages?.forEach(msg => {
        if (!conversationMessages.has(msg.conversation_id)) {
          conversationMessages.set(msg.conversation_id, []);
        }
        conversationMessages.get(msg.conversation_id)!.push(msg);
      });

      const recentConversations = Array.from(conversationMessages.entries())
        .map(([convId, msgs]) => ({
          conversationId: convId,
          lastMessage: msgs[0],
        }))
        .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
        .slice(0, 3);

      // Get other user IDs from message sender_ids (not from participants table due to RLS)
      const otherUserIds = Array.from(
        new Set(
          recentConversations
            .map(conv => {
              // Find any message in this conversation that's NOT from the current user
              const msgs = conversationMessages.get(conv.conversationId) || [];
              const otherUserMsg = msgs.find(m => m.sender_id !== user.id);
              return otherUserMsg?.sender_id;
            })
            .filter(Boolean)
        )
      );

      if (otherUserIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, first_name, last_name, avatar_url')
        .in('user_id', otherUserIds);

      const chatPreviews: ChatPreview[] = recentConversations.map(conv => {
        const msgs = conversationMessages.get(conv.conversationId) || [];
        const otherUserMsg = msgs.find(m => m.sender_id !== user.id);
        const otherUserId = otherUserMsg?.sender_id;
        const profile = profiles?.find(p => p.user_id === otherUserId);
        const content = conv.lastMessage.content || '';
        
        // Build display name with proper fallbacks
        let displayName = 'User';
        if (profile?.display_name) {
          displayName = profile.display_name;
        } else if (profile?.first_name || profile?.last_name) {
          displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
        }
        
        return {
          id: conv.conversationId,
          name: displayName,
          avatar: profile?.avatar_url,
          lastMessage: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          timestamp: new Date(conv.lastMessage.created_at),
        };
      });

      setChats(chatPreviews);
    } catch (e) {
      console.error('Error loading chats', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <MessageSquare className="h-3 w-3 text-primary" />
        <h3 className="text-xs font-semibold text-foreground">Chats</h3>
      </div>

      {loading ? (
        <div className="space-y-1">
          <div className="h-8 bg-primary/10 rounded animate-pulse" />
          <div className="h-8 bg-primary/10 rounded animate-pulse" />
        </div>
      ) : chats.length === 0 ? (
        <p className="text-[10px] text-muted-foreground px-1">No recent chats</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 bg-black/40 transition-colors"
            >
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={chat.avatar} alt={`${chat.name} avatar`} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {chat.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{chat.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{chat.lastMessage}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                  {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};