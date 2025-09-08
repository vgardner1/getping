import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Users, TrendingUp, Gift } from "lucide-react";

interface ConversationUI {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string | null;
  type: "personal" | "business";
  followUpType: "immediate" | "48h" | "longterm";
  lastActive?: string;
  priority?: "high" | "medium" | "low";
}

const Chat = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationUI[]>([]);

  // Immediate follow-ups (respond ASAP)
  const immediateFollowUps: ConversationUI[] = [
    { id: "imm-1", name: "Zara Flux", lastMessage: "Ready to discuss the partnership details", avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png", type: "business", followUpType: "immediate", priority: "high", lastActive: "2 min ago" },
    { id: "imm-2", name: "Orion Park", lastMessage: "Following up on our coffee chat", avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png", type: "personal", followUpType: "immediate", priority: "high", lastActive: "5 min ago" },
    { id: "imm-3", name: "Nova Lee", lastMessage: "Let's schedule that brainstorm session", avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png", type: "business", followUpType: "immediate", priority: "medium", lastActive: "12 min ago" },
    { id: "imm-4", name: "Atlas Kim", lastMessage: "Thanks for the intro - can we chat?", avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png", type: "personal", followUpType: "immediate", priority: "high", lastActive: "18 min ago" },
    { id: "imm-5", name: "Sol Rivera", lastMessage: "Your sustainability ideas resonate", avatar: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png", type: "business", followUpType: "immediate", priority: "medium", lastActive: "25 min ago" },
    { id: "imm-6", name: "Echo Tan", lastMessage: "Growth metrics discussion?", avatar: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png", type: "personal", followUpType: "immediate", priority: "medium", lastActive: "35 min ago" },
    { id: "imm-7", name: "Vega Singh", lastMessage: "Research collaboration opportunity", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "immediate", priority: "high", lastActive: "42 min ago" },
    { id: "imm-8", name: "Juno Morales", lastMessage: "Ship fast, learn faster philosophy", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "immediate", priority: "low", lastActive: "1 hr ago" },
    { id: "imm-9", name: "Quinn Arora", lastMessage: "Data insights for your project", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "immediate", priority: "medium", lastActive: "1 hr ago" },
    { id: "imm-10", name: "Kaito Sato", lastMessage: "Hardware hacking session invite", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "immediate", priority: "low", lastActive: "2 hr ago" },
    { id: "imm-11", name: "Riley Chen", lastMessage: "Excited about the project direction", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "immediate", priority: "high", lastActive: "2 hr ago" },
    { id: "imm-12", name: "Casey Blue", lastMessage: "Thanks for the networking event intro", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "immediate", priority: "medium", lastActive: "3 hr ago" },
  ];

  // 48-hour follow-ups (nurture the connection)
  const fortyEightHourFollowUps: ConversationUI[] = [
    { id: "48h-1", name: "Morgan Valle", lastMessage: "Great meeting you at the conference", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "48h", priority: "medium", lastActive: "1 day ago" },
    { id: "48h-2", name: "Sage Martinez", lastMessage: "Would love to continue our conversation", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "48h", priority: "high", lastActive: "1 day ago" },
    { id: "48h-3", name: "River Johnson", lastMessage: "Your startup idea is fascinating", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "48h", priority: "medium", lastActive: "1 day ago" },
    { id: "48h-4", name: "Phoenix Lee", lastMessage: "Coffee sometime this week?", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "48h", priority: "high", lastActive: "1 day ago" },
    { id: "48h-5", name: "Dakota Kim", lastMessage: "Let's explore that collaboration", avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "48h", priority: "medium", lastActive: "2 days ago" },
    { id: "48h-6", name: "Skyler Wong", lastMessage: "Thanks for the event recommendations", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "48h", priority: "low", lastActive: "2 days ago" },
    { id: "48h-7", name: "Avery Davis", lastMessage: "Your presentation was inspiring", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "48h", priority: "medium", lastActive: "2 days ago" },
    { id: "48h-8", name: "Cameron Liu", lastMessage: "Want to grab lunch next week?", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "48h", priority: "high", lastActive: "2 days ago" },
    { id: "48h-9", name: "Taylor Brooks", lastMessage: "Portfolio review feedback ready", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "48h", priority: "medium", lastActive: "2 days ago" },
    { id: "48h-10", name: "Jordan Ross", lastMessage: "Shared interest in sustainable tech", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "48h", priority: "low", lastActive: "2 days ago" },
    { id: "48h-11", name: "Alex Foster", lastMessage: "Follow-up on partnership discussion", avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "48h", priority: "high", lastActive: "2 days ago" },
    { id: "48h-12", name: "Blake Torres", lastMessage: "Great connecting at the mixer", avatar: "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "48h", priority: "medium", lastActive: "2 days ago" },
  ];

  // Long-term connections (maintain relationship)
  const longTermConnections: ConversationUI[] = [
    { id: "long-1", name: "Emerson Gray", lastMessage: "Still thinking about your project", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "longterm", priority: "low", lastActive: "1 week ago" },
    { id: "long-2", name: "Finley Green", lastMessage: "Hope the job search is going well", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "longterm", priority: "medium", lastActive: "1 week ago" },
    { id: "long-3", name: "Rowan White", lastMessage: "Quarterly check-in on progress", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "longterm", priority: "low", lastActive: "2 weeks ago" },
    { id: "long-4", name: "Quinn Harper", lastMessage: "Remember our conversation about AI", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "longterm", priority: "medium", lastActive: "2 weeks ago" },
    { id: "long-5", name: "Sage Cooper", lastMessage: "Your startup updates are impressive", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "longterm", priority: "low", lastActive: "3 weeks ago" },
    { id: "long-6", name: "River Stone", lastMessage: "Still interested in that collaboration", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "longterm", priority: "medium", lastActive: "3 weeks ago" },
    { id: "long-7", name: "Nova Sterling", lastMessage: "Your design work keeps improving", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "longterm", priority: "low", lastActive: "1 month ago" },
    { id: "long-8", name: "Phoenix Vale", lastMessage: "How's the new role treating you?", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "longterm", priority: "medium", lastActive: "1 month ago" },
    { id: "long-9", name: "Atlas Moon", lastMessage: "Checking in on your goals", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "longterm", priority: "low", lastActive: "1 month ago" },
    { id: "long-10", name: "Echo Rivers", lastMessage: "Hope you're doing well", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "longterm", priority: "medium", lastActive: "2 months ago" },
    { id: "long-11", name: "Zara Wilde", lastMessage: "Annual networking catch-up", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", type: "business", followUpType: "longterm", priority: "low", lastActive: "2 months ago" },
    { id: "long-12", name: "Orion Fields", lastMessage: "Still building great things", avatar: "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=150&h=150&fit=crop&crop=face", type: "personal", followUpType: "longterm", priority: "medium", lastActive: "3 months ago" },
  ];

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      // 1) Find all conversations the user is in
      const { data: parts, error: partsErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      if (partsErr) {
        console.error(partsErr);
        setLoading(false);
        return;
      }

      const convIds = (parts ?? []).map((p) => p.conversation_id as string);
      const items: ConversationUI[] = [];

      // 2) For each conversation, fetch metadata and counterpart profile + last message
      for (const cid of convIds) {
        const [{ data: conv }, { data: others } ] = await Promise.all([
          supabase.from("conversations").select("id, category").eq("id", cid).maybeSingle(),
          supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", cid)
            .neq("user_id", user.id),
        ]);

        const otherId = others && others.length > 0 ? others[0].user_id : null;

        const [profileRes, lastMsgRes] = await Promise.all([
          otherId
            ? supabase
                .from("profiles")
                .select("display_name, avatar_url")
                .eq("user_id", otherId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", cid)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const name = profileRes?.data?.display_name || "Conversation";
        const avatar = profileRes?.data?.avatar_url || null;
        const lastMessage = lastMsgRes?.data?.content || "Say hi 👋";
        const type: "personal" | "business" = (conv?.category as any) || "personal";

        items.push({ 
          id: cid, 
          name, 
          avatar, 
          lastMessage, 
          type, 
          followUpType: "immediate", 
          priority: "medium" 
        });
      }

      setConversations(items);
      setLoading(false);
    };

    load();
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const combined = [...immediateFollowUps, ...fortyEightHourFollowUps, ...longTermConnections, ...conversations];
    return combined.filter(
      (c) => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  }, [query, conversations]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const renderConversation = (c: ConversationUI) => (
    <Link to={`/chat/thread/${c.id}`} key={c.id}>
      <Card className="bg-card border-border p-3 flex items-center gap-3 hover:border-primary/50 transition-colors">
        {c.avatar ? (
          <img
            src={c.avatar}
            alt={`${c.name} avatar`}
            className="w-12 h-12 rounded-full object-cover border border-primary/20"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-secondary border border-primary/20" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium iridescent-text truncate">{c.name}</div>
            {c.priority && (
              <Badge variant={getPriorityColor(c.priority)} className="text-xs">
                {c.priority}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground iridescent-text truncate mb-1">{c.lastMessage}</div>
          {c.lastActive && (
            <div className="text-xs text-muted-foreground opacity-70">{c.lastActive}</div>
          )}
        </div>
      </Card>
    </Link>
  );

  const renderFollowUpSection = (
    title: string, 
    icon: React.ReactNode, 
    conversations: ConversationUI[], 
    description: string
  ) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-lg font-semibold iridescent-text">{title}</h2>
        <Badge variant="secondary" className="ml-auto">
          {conversations.length}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="space-y-2">
        {conversations.map(renderConversation)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-28 max-w-4xl mx-auto">
      {/* Trial Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold iridescent-text">Free 7-Day Trial</h3>
            <p className="text-sm text-muted-foreground">Then $2.99/mo • Refer 5 friends for first month free</p>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <Button size="sm" variant="outline">
              Invite Friends
            </Button>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold iridescent-text mb-4 text-center">AI Conversation Engine</h1>
      
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search conversations..."
        className="mb-6"
      />

      {query ? (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold iridescent-text mb-3">Search Results</h2>
          {filtered.map(renderConversation)}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No conversations found.</p>
          )}
        </div>
      ) : (
        <>
          {renderFollowUpSection(
            "Immediate Follow-ups",
            <Clock className="w-5 h-5 text-destructive" />,
            immediateFollowUps,
            "High-priority conversations requiring immediate attention"
          )}
          
          {renderFollowUpSection(
            "48-Hour Follow-ups", 
            <TrendingUp className="w-5 h-5 text-primary" />,
            fortyEightHourFollowUps,
            "Nurture these connections within the next 48 hours"
          )}
          
          {renderFollowUpSection(
            "Long-term Connections",
            <Users className="w-5 h-5 text-secondary" />,
            longTermConnections,
            "Maintain these relationships for future opportunities"
          )}
        </>
      )}
    </div>
  );
};

export default Chat;
