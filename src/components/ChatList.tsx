import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, ArrowLeft, Send, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createChatWithUser } from '@/utils/chatUtils';

interface Connection {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
}

interface Profile {
  name: string;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatListProps {
  searchQuery?: string;
}

export function ChatList({ searchQuery = '' }: ChatListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch connections
    const { data: connectionRows, error } = await supabase
      .from('connections')
      .select('*')
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Deduplicate
    const dedupMap = new Map<string, Connection>();
    (connectionRows || []).forEach((r) => {
      const otherId = r.user_id === user.id ? r.target_user_id : r.user_id;
      const existing = dedupMap.get(otherId);
      if (!existing || new Date(r.created_at) < new Date(existing.created_at)) {
        dedupMap.set(otherId, r as Connection);
      }
    });
    const deduped = Array.from(dedupMap.values()).filter(r => {
      const other = r.user_id === user.id ? r.target_user_id : r.user_id;
      return other !== user.id;
    });
    setConnections(deduped);

    // Fetch profiles
    const otherIds = deduped.map(r => r.user_id === user.id ? r.target_user_id : r.user_id);
    const unique = Array.from(new Set(otherIds));
    if (unique.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, display_name, first_name, last_name, avatar_url')
        .in('user_id', unique);
      
      if (profs) {
        const map: Record<string, Profile> = {};
        for (const p of profs) {
          let displayName = p.display_name as string | null;
          if (!displayName || displayName.trim() === '') {
            const fn = (p as any).first_name;
            const ln = (p as any).last_name;
            if (fn || ln) displayName = [fn, ln].filter(Boolean).join(' ');
          }
          map[p.user_id as string] = { name: displayName || 'User', avatar: (p as any).avatar_url || null };
        }
        setProfiles(map);
      }
    }

    await fetchUnreadCounts(unique);
    setLoading(false);
  };

  const fetchUnreadCounts = async (userIds: string[]) => {
    if (!user || userIds.length === 0) return;
    
    try {
      const lastReadKey = `lastRead_${user.id}`;
      const lastReadStr = localStorage.getItem(lastReadKey);
      const lastRead = lastReadStr ? new Date(lastReadStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      const counts: Record<string, number> = {};
      
      for (const userId of userIds) {
        const { data: convData } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (convData && convData.length > 0) {
          const { data: otherConvData } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId)
            .in('conversation_id', convData.map(c => c.conversation_id));

          if (otherConvData && otherConvData.length > 0) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('conversation_id', otherConvData.map(c => c.conversation_id))
              .eq('sender_id', userId)
              .gte('created_at', lastRead.toISOString());

            counts[userId] = count || 0;
          }
        }
      }
      
      setUnreadCounts(counts);
    } catch (error) {
      console.warn('Could not fetch unread counts:', error);
    }
  };

  const handleChatClick = async (userId: string) => {
    if (!user) return;
    
    try {
      const convId = await createChatWithUser(userId, user.id);
      setConversationId(convId);
      setActiveChatUserId(userId);
      await loadMessages(convId);
      
      // Mark as read
      const lastReadKey = `lastRead_${user.id}`;
      localStorage.setItem(lastReadKey, new Date().toISOString());
      setUnreadCounts(prev => ({ ...prev, [userId]: 0 }));
    } catch (error) {
      console.error('Error opening chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to open chat',
        variant: 'destructive',
      });
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      setChatLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || chatLoading) return;

    try {
      setChatLoading(true);
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setChatLoading(false);
    }
  };

  // If in chat view
  if (activeChatUserId && profiles[activeChatUserId]) {
    const profile = profiles[activeChatUserId];
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Chat Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setActiveChatUserId(null);
                setMessages([]);
                setConversationId(null);
                setNewMessage('');
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar 
              className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/ping/${activeChatUserId}`);
              }}
            >
              <AvatarImage src={profile.avatar || ''} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{profile.name}</h2>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Avatar className="w-16 h-16 mx-auto mb-4">
                <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">Say hello to start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-sm p-3 rounded-2xl ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message ${profile.name}...`}
              className="flex-1"
              disabled={chatLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || chatLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get other user IDs from connections
  const otherUserIds = connections.map(c => c.user_id === user?.id ? c.target_user_id : c.user_id);

  // Filter connections based on search
  const filteredUserIds = otherUserIds.filter(otherId => {
    const profile = profiles[otherId];
    if (!profile) return false;
    
    const query = searchQuery.toLowerCase();
    return profile.name.toLowerCase().includes(query);
  });
  // List view
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

  
  if (filteredUserIds.length === 0 && searchQuery) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try a different search term
          </p>
        </div>
      </div>
    );
  }

  if (filteredUserIds.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
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
      {filteredUserIds.map((otherId) => {
          const profile = profiles[otherId];
          if (!profile) return null;
          
          return (
            <Card
              key={otherId}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleChatClick(otherId)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground truncate">
                      {profile.name}
                    </h4>
                    {unreadCounts[otherId] > 0 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap to chat
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
    </div>
  );
}
