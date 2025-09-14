import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const ChatThread = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || !conversationId) return;
    loadMessages();
  }, [user, conversationId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
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
      loadMessages(); // Reload messages after sending
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
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
          <p className="iridescent-text">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/chat')}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <h1 className="text-xl font-bold iridescent-text">Chat</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4 relative z-10">
        <div className="space-y-4 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground iridescent-text">
                Say hello to start the conversation! 👋
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <Card 
                    className={`max-w-xs p-3 ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border-border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </Card>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2 p-4 bg-card border border-border rounded-lg">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChatThread;