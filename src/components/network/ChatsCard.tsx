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

      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', recentConversations.map(c => c.conversationId));

      const otherUserIds = Array.from(new Set(allParticipants?.filter(p => p.user_id !== user.id).map(p => p.user_id) || []));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);

      const chatPreviews: ChatPreview[] = recentConversations.map(conv => {
        const otherParticipant = allParticipants?.find(p => p.conversation_id === conv.conversationId && p.user_id !== user.id);
        const profile = profiles?.find(p => p.user_id === otherParticipant?.user_id);
        const content = conv.lastMessage.content || '';
        return {
          id: conv.conversationId,
          name: profile?.display_name || 'User',
          avatar: profile?.avatar_url,
          lastMessage: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
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
    <Card className="bg-black/80 backdrop-blur border-primary/30 p-2 md:p-3 w-full shadow-xl">
      <div className="flex items-center gap-1.5 mb-2">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs md:text-sm font-semibold text-foreground">Recent Chats</h3>
      </div>

      {loading ? (
        <div className="space-y-1">
          <div className="h-3 bg-primary/20 rounded animate-pulse" />
          <div className="h-3 bg-primary/20 rounded animate-pulse" />
        </div>
      ) : chats.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent chats</p>
      ) : (
        <>
          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat?connection=${chat.id}`)}
                className="w-full text-left flex items-start gap-2 p-1.5 rounded-lg hover:bg-primary/10"
              >
                <Avatar className="h-6 w-6 border border-primary/30 flex-shrink-0">
                  <AvatarImage src={chat.avatar} alt={`${chat.name} avatar`} />
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-medium text-foreground truncate">{chat.name}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="mt-2 w-full rounded-md border border-primary/30 py-1 text-xs text-foreground hover:bg-primary/10"
          >
            View All
          </button>
        </>
      )}
    </Card>
  );
};