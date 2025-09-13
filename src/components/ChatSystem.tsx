import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
}

interface Profile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
}

interface ChatSystemProps {
  targetUserId: string;
  targetProfile: Profile;
}

export const ChatSystem = ({ targetUserId, targetProfile }: ChatSystemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for global 'open-chat' events
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-chat', handler as EventListener);
    return () => window.removeEventListener('open-chat', handler as EventListener);
  }, []);

  // Find or create conversation when chat opens
  useEffect(() => {
    if (isOpen && user && !conversationId) {
      findOrCreateConversation();
    }
  }, [isOpen, user, targetUserId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const findOrCreateConversation = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, try to find existing conversation
      const { data: existingConversations, error: findError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(*)
        `)
        .eq('user_id', user.id);

      if (findError) throw findError;

      // Check if there's a conversation with the target user
      let foundConversationId = null;
      
      if (existingConversations) {
        for (const participant of existingConversations) {
          const { data: otherParticipants, error: participantError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', participant.conversation_id)
            .neq('user_id', user.id);

          if (participantError) continue;

          if (otherParticipants?.some(p => p.user_id === targetUserId)) {
            foundConversationId = participant.conversation_id;
            break;
          }
        }
      }

      if (foundConversationId) {
        setConversationId(foundConversationId);
        await loadMessages(foundConversationId);
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            category: 'direct_message'
          })
          .select()
          .single();

        if (createError) throw createError;

        // Add participants
        const { error: participantError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: newConversation.id, user_id: user.id },
            { conversation_id: newConversation.id, user_id: targetUserId }
          ]);

        if (participantError) throw participantError;

        setConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error with conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          size="icon"
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </Button>
      </div>
    );
  }

  const displayName = targetProfile.display_name || 'User';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 bg-card border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
              {targetProfile.avatar_url ? (
                <img
                  src={targetProfile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm iridescent-text">{displayName}</h3>
              <p className="text-xs text-muted-foreground iridescent-text">
                {loading ? 'Connecting...' : 'Online'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="w-6 h-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="iridescent-text">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center">
                <div className="text-xs text-muted-foreground">Starting conversation...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              disabled={loading || !conversationId}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="w-8 h-8"
              disabled={loading || !conversationId || !newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};