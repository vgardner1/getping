import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

export const ChatPreviewPopup = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get conversations the user is part of
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!participantData || participantData.length === 0) {
        setLoading(false);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Get recent messages for these conversations
      const { data: messages } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(100);

      // Group messages by conversation
      const conversationMessages = new Map<string, any[]>();
      messages?.forEach(msg => {
        if (!conversationMessages.has(msg.conversation_id)) {
          conversationMessages.set(msg.conversation_id, []);
        }
        conversationMessages.get(msg.conversation_id)!.push(msg);
      });

      // Get the most recent message per conversation
      const recentConversations = Array.from(conversationMessages.entries())
        .map(([convId, msgs]) => ({
          conversationId: convId,
          lastMessage: msgs[0],
          messageCount: msgs.length,
        }))
        .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
        .slice(0, isExpanded ? 10 : 3);

      // Get ALL participants for these conversations
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', recentConversations.map(c => c.conversationId));

      // Get unique user IDs (excluding current user)
      const otherUserIds = Array.from(
        new Set(
          allParticipants
            ?.filter(p => p.user_id !== user.id)
            .map(p => p.user_id) || []
        )
      );

      // Fetch profiles for all other participants
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);

      const chatPreviews: ChatPreview[] = recentConversations.map(conv => {
        // Find the other participant in this conversation
        const otherParticipant = allParticipants?.find(
          p => p.conversation_id === conv.conversationId && p.user_id !== user.id
        );
        const profile = profiles?.find(p => p.user_id === otherParticipant?.user_id);

        return {
          id: conv.conversationId,
          name: profile?.display_name || 'User',
          avatar: profile?.avatar_url,
          lastMessage: conv.lastMessage.content.substring(0, 60) + (conv.lastMessage.content.length > 60 ? '...' : ''),
          timestamp: new Date(conv.lastMessage.created_at),
          unreadCount: 0,
        };
      });

      setChats(chatPreviews);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat?connection=${chatId}`);
  };

  if (loading) {
    return (
      <Card className="bg-black/80 backdrop-blur border-primary/30 p-4 w-80 shadow-xl">
        <div className="space-y-2">
          <div className="h-4 bg-primary/20 rounded animate-pulse" />
          <div className="h-4 bg-primary/20 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/80 backdrop-blur border-primary/30 p-2 md:p-5 w-full md:w-96 shadow-xl animate-fade-in">
      <div className="space-y-2 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            <h3 className="text-sm md:text-lg font-semibold text-foreground">Recent Chats</h3>
          </div>
          
          {chats.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (!isExpanded) loadChats();
              }}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-primary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-primary" />
              )}
            </Button>
          )}
        </div>

        <div className="space-y-1 md:space-y-3 max-h-[220px] md:max-h-[500px] overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent chats</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group"
              >
                <Avatar className="h-7 w-7 md:h-12 md:w-12 border border-primary/30 flex-shrink-0">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs md:text-sm">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs md:text-sm font-medium text-foreground truncate">
                      {chat.name}
                    </p>
                    <span className="text-[9px] md:text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-[9px] md:text-xs text-muted-foreground truncate mt-0.5 md:mt-1">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {chats.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/chat')}
            className="w-full border-primary/30 hover:bg-primary/10 text-xs md:text-sm py-1 md:py-2"
          >
            View All Chats
          </Button>
        )}
      </div>
    </Card>
  );
};
