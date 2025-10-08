import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarField } from "@/components/StarField";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ProfilePreview {
  display_name: string;
  avatar_url: string | null;
}

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherProfile, setOtherProfile] = useState<ProfilePreview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = otherProfile?.display_name
      ? `Chat with ${otherProfile.display_name} — ping!`
      : `Chat — ping!`;
  }, [otherProfile]);

  useEffect(() => {
    (async () => {
      if (!conversationId) return;
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        
        // Prefer the target user passed via query param
        const toParam = searchParams.get('to');
        let other: string | null = null;
        if (toParam) {
          other = toParam;
        } else {
          // Fallback: find any message from the other participant
          const { data: otherMsg, error: otherMsgErr } = await supabase
            .from('messages')
            .select('sender_id')
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id)
            .limit(1);
          if (!otherMsgErr && otherMsg && otherMsg.length > 0) {
            other = otherMsg[0].sender_id as string;
          }
        }

        // As a last resort, read participants (will only return self due to RLS)
        if (!other) {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId);
          const ids = (participants || []).map(p => p.user_id);
          other = ids.find(id => id !== user.id) || null;
        }

        setOtherUserId(other);

        if (other) {
          const { data: profileData, error: profErr } = await supabase.rpc(
            'get_public_profile_secure',
            { target_user_id: other }
          );
          if (!profErr && profileData && profileData[0]) {
            const profile = profileData[0];
            // Build display name with fallbacks
            let displayName = profile.display_name;
            if (!displayName || displayName.trim() === '') {
              // Try first_name + last_name from profiles table
              const { data: userData } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('user_id', other)
                .single();
              
              if (userData?.first_name || userData?.last_name) {
                displayName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
              }
            }
            setOtherProfile({
              display_name: displayName || 'User',
              avatar_url: profile.avatar_url || null,
            });
          }
        }

        // Load messages
        await loadMessages(conversationId);
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({ title: 'Error', description: 'Failed to load chat', variant: 'destructive' });
      } finally {
        setLoading(false);
        // Mark messages as read when entering chat
        if (user) {
          const lastReadKey = `lastRead_${user.id}`;
          localStorage.setItem(lastReadKey, new Date().toISOString());
        }
      }
    })();
  }, [conversationId, user]);

  async function loadMessages(convId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (!error) setMessages((data as unknown as Message[]) || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || sending) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
        });
      if (error) throw error;
      setNewMessage("");
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="iridescent-text">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />

      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherProfile?.avatar_url || ''} alt={otherProfile?.display_name || 'User'} />
            <AvatarFallback>{otherProfile?.display_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold iridescent-text">{otherProfile?.display_name || 'Conversation'}</h1>
            <p className="text-sm text-muted-foreground">Active now</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative z-10">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={otherProfile?.avatar_url || ''} alt={otherProfile?.display_name || 'User'} />
                <AvatarFallback className="text-2xl">{otherProfile?.display_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold iridescent-text mb-2">{otherProfile?.display_name || 'User'}</h3>
              <p className="text-muted-foreground iridescent-text">Say hello to start the conversation.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isOwn = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-sm p-3 rounded-2xl ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
                    <p className="text-sm">{m.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3 items-end">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message ${otherProfile?.display_name || 'user'}...`}
              className="flex-1 rounded-full min-h-[2.5rem] resize-none"
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="lg" className="rounded-full w-12 h-12 text-lg">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;