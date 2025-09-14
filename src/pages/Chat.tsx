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

  // Removed demo follow-up lists to ensure only live conversations are shown


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
    return conversations.filter(
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

  // Removed follow-up sections UI – only live conversations are displayed


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

      <div className="space-y-2">
        <h2 className="text-lg font-semibold iridescent-text mb-3">Your Conversations</h2>
        {(query ? filtered : conversations).map(renderConversation)}
        {(query ? filtered : conversations).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No conversations yet.</p>
        )}
      </div>

    </div>
  );
};

export default Chat;
