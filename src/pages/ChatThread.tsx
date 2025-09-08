import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PINGER_PROFILES } from "@/data/pingers";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  ts: Date;
}

interface ProfileUI { name: string; avatar: string | null }

const AI_PROFILES: Record<string, ProfileUI> = {
  "ai-zara": { name: "Zara Flux", avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png" },
  "ai-orion": { name: "Orion Park", avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png" },
  "ai-nova": { name: "Nova Lee", avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png" },
  "ai-atlas": { name: "Atlas Kim", avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png" },
  "ai-sol": { name: "Sol Rivera", avatar: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png" },
  "ai-echo": { name: "Echo Tan", avatar: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png" },
  "ai-vega": { name: "Vega Singh", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face" },
  "ai-juno": { name: "Juno Morales", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face" },
  "ai-quinn": { name: "Quinn Arora", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face" },
  "ai-kaito": { name: "Kaito Sato", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
};

const ChatThread = () => {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [otherProfile, setOtherProfile] = useState<ProfileUI>({ name: "Conversation", avatar: null });
  const endRef = useRef<HTMLDivElement>(null);

  const uuidRegex = /^[0-9a-fA-F-]{36}$/;
  const isAI = !!(conversationId && !uuidRegex.test(conversationId));
  const effectiveAgentId = isAI
    ? (conversationId && AI_PROFILES[conversationId] ? conversationId : "ai-zara")
    : null;

  const location = useLocation();
  const nav = (location as any)?.state as { name?: string; avatar?: string; role?: string; city?: string; bio?: string } | undefined;

  const pinger = useMemo(() => {
    if (nav?.name) {
      return { id: "", name: nav.name, city: nav.city, role: nav.role, bio: nav.bio, avatar: nav.avatar } as any;
    }
    return PINGER_PROFILES.find((p) => p.id === conversationId);
  }, [conversationId, nav?.name, nav?.city, nav?.role, nav?.bio, nav?.avatar]);

  const conversationContext = useMemo(
    () => messages.slice(-3).map((m) => `${m.sender}: ${m.text}`).join("; "),
    [messages]
  );

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Load header info and messages
  useEffect(() => {
    const load = async () => {
      if (!conversationId) return;

      // AI-like threads (non-UUID slugs). Use PINGER_PROFILES when available.
      if (isAI) {
        const p =
          (pinger ? { name: pinger.name, avatar: pinger.avatar } : undefined) ||
          AI_PROFILES[conversationId] ||
          { name: "Conversation", avatar: null };
        setOtherProfile(p);
        setMessages([
          { id: "welcome", text: "Hey! I’m active — what are you working on today?", sender: "them", ts: new Date() },
        ]);
        return;
      }

      if (!user) return;

      // Find the other participant to show their profile
      const { data: others } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id);

      const otherId = others && others.length > 0 ? others[0].user_id : null;
      if (otherId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", otherId)
          .maybeSingle();
        setOtherProfile({ name: prof?.display_name || "Conversation", avatar: prof?.avatar_url || null });
      }

      // Load messages
      const { data: msgRows } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(
        (msgRows ?? []).map((r) => ({
          id: r.id,
          text: r.content,
          sender: r.sender_id === user.id ? "me" : "them",
          ts: new Date(r.created_at as string),
        }))
      );
    };
    load();
  }, [conversationId, user, isAI]);

  // AI suggestions grounded on the last messages
  useEffect(() => {
    const fetchQs = async () => {
      try {
        const profileSummary = pinger
          ? [pinger.role, pinger.city, pinger.bio].filter(Boolean).join(" · ")
          : undefined;

        const { data, error } = await supabase.functions.invoke("generate-chat-questions", {
          body: {
            contactName: otherProfile.name,
            contactProfile: profileSummary || "Creative professional",
            conversationContext,
            sharedInterests: ["AI", "entrepreneurship", "sustainable design"],
            questionCount: 3,
          },
        });
        if (error) throw error;
        setSuggested(data?.questions ?? data?.fallbackQuestions ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    if (otherProfile.name) fetchQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, otherProfile.name, pinger?.role, pinger?.city, pinger?.bio]);

  const send = async (text: string) => {
    if (!text.trim() || !conversationId) return;
    const content = text.trim();

    // AI agent via Edge Function
    if (isAI) {
      const newId = Date.now().toString();
      // optimistic user message
      setMessages((prev) => [...prev, { id: newId, text: content, sender: "me", ts: new Date() }]);
      setInput("");

      try {
        const history = [...messages, { id: "draft", text: content, sender: "me" as const, ts: new Date() }];
        const mapped = history.map((m) => ({ role: m.sender === "me" ? "user" : "assistant", content: m.text }));

        const { data, error } = await supabase.functions.invoke("agent-reply", {
          body: { agentId: effectiveAgentId, messages: mapped },
        });
        if (error) throw error;

        const reply: string = data?.reply ?? "I'm here — want to share a bit more context?";
        setMessages((prev) => [
          ...prev,
          { id: newId + "-r", text: reply, sender: "them", ts: new Date() },
        ]);
      } catch (e) {
        console.error(e);
        const fallback = suggested.length
          ? (typeof suggested[0] === 'string' ? suggested[0] : suggested[0].text)
          : "I’m ready to help. What’s the goal and constraint set?";
        setMessages((prev) => [
          ...prev,
          { id: newId + "-r", text: fallback, sender: "them", ts: new Date() },
        ]);
      }
      return;
    }

    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select("id, created_at")
      .maybeSingle();
    if (error) {
      console.error(error);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: data?.id ?? Date.now().toString(), text: content, sender: "me", ts: new Date(data?.created_at ?? Date.now()) },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-28">
      {/* Header */}
      <header className="p-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/chat" aria-label="Back" className="p-2 rounded hover:bg-secondary/20">
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Link>
          {otherProfile.avatar ? (
            <img
              src={otherProfile.avatar}
              alt={`${otherProfile.name} avatar`}
              className="w-8 h-8 rounded-full border border-primary/30 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary border border-primary/30" />
          )}
          <div className="flex flex-col">
            <h1 className="font-semibold iridescent-text">{otherProfile.name}</h1>
            {pinger && (
              <span className="text-xs text-muted-foreground">
                {[pinger.role, pinger.city].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] text-sm px-3 py-2 rounded-2xl ${m.sender === "me" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      {/* Suggestions */}
      {suggested.length > 0 && (
        <div className="max-w-2xl mx-auto w-full px-4">
          <Card className="bg-card border-border p-3 mb-2">
            <div className="flex items-center gap-2 text-xs mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="iridescent-text">AI suggestions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {suggested.slice(0, 3).map((q, i) => {
                const questionText = typeof q === 'string' ? q : q.text;
                return (
                  <button
                    key={i}
                    onClick={() => send(questionText)}
                    className="text-left text-xs p-2 rounded bg-primary/10 hover:bg-primary/20 iridescent-text"
                  >
                    {questionText}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Input */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message..." />
          <Button type="submit" className="shimmer">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatThread;
