import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact' | 'ai-suggestion';
  timestamp: Date;
  isAIGenerated?: boolean;
}

interface ChatBubbleProps {
  contactName?: string;
  contactAvatar?: string;
}

export const ChatBubble = ({ 
  contactName = "Contact",
  contactAvatar = "/placeholder.svg"
}: ChatBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! Thanks for pinging me. I'd love to connect!",
      sender: 'contact',
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  // Generate AI questions
  const generateAIQuestions = async () => {
    setIsLoadingQuestions(true);

    // Determine shared interests between the viewer and the contact
    const userInterests = ['AI', 'entrepreneurship', 'sustainable design', 'community building'];
    const contactInterests = ['AI', 'sustainable design', 'digital art', 'entrepreneurship'];
    const sharedInterests = userInterests.filter(ui => contactInterests.some(ci => ci.toLowerCase() === ui.toLowerCase()));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-chat-questions', {
        body: { 
          contactName,
          contactProfile: "Entrepreneur & Creative Director specializing in AI-powered sustainable design, founder of BIND Solutions, working on Republic 2.0 digital art installation",
          conversationContext: messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('; '),
          sharedInterests,
          questionCount: 3
        }
      });

      if (error) {
        throw error;
      }

      if (data?.questions) {
        setSuggestedQuestions(data.questions);
      } else if (data?.fallbackQuestions) {
        setSuggestedQuestions(data.fallbackQuestions);
        toast({
          title: "Using fallback questions",
          description: "Add your OpenAI API key in Supabase for personalized AI questions",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Could not generate questions",
        description: "Please try again or add your OpenAI API key",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (isOpen && suggestedQuestions.length === 0 && !isLoadingQuestions) {
      generateAIQuestions();
    }
  }, [isOpen]);

  const sendMessage = (text: string, isAIGenerated = false) => {
    if (!text.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      isAIGenerated
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");

    // Simulate contact response after a delay
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me think about that...",
        "I'm glad you're interested in that aspect of my work.",
        "That's something I'm really passionate about discussing.",
        "Great point! I'd love to dive deeper into that topic."
      ];
      
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'contact',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMsg]);
    }, 1500 + Math.random() * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleSuggestedQuestion = (question: any) => {
    const questionText = typeof question === 'string' ? question : question.text;
    sendMessage(questionText, true);
    // Remove the used question
    setSuggestedQuestions(prev => prev.filter(q => q !== question));
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 bg-card border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
              <img
                src={contactAvatar}
                alt={contactName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm iridescent-text">{contactName}</h3>
              <p className="text-xs text-muted-foreground iridescent-text">Online</p>
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  } ${message.isAIGenerated ? 'border border-primary/30' : ''}`}
                >
                  {message.isAIGenerated && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs">AI suggested</span>
                    </div>
                  )}
                  <p className="iridescent-text">{message.text}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* AI Suggestions */}
        {suggestedQuestions.length > 0 && (
          <div className="p-3 border-t border-border bg-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium iridescent-text">AI Suggested Questions:</span>
            </div>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left text-xs p-2 rounded bg-primary/10 hover:bg-primary/20 transition-colors iridescent-text"
                >
                  {typeof question === 'string' ? question : question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2 mb-2">
            <Button
              onClick={generateAIQuestions}
              disabled={isLoadingQuestions}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {isLoadingQuestions ? "Generating..." : "AI Questions"}
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-sm"
            />
            <Button type="submit" size="icon" className="w-8 h-8">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};