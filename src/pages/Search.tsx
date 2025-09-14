import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePublicProfileSearch } from "@/hooks/usePublicProfileSearch";
import { useAuth } from "@/hooks/useAuth";
import { createChatWithUser } from "@/utils/chatUtils";

const Search = () => {
  const [q, setQ] = useState("");
  const { results, loading, error, searchProfiles, clearResults } = usePublicProfileSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pingingId, setPingingId] = useState<string | null>(null);

  const onChange = (val: string) => {
    setQ(val);
    if (val.trim().length >= 2) {
      searchProfiles(val.trim());
    } else {
      clearResults();
    }
  };

  const handlePing = async (targetUserId: string) => {
    if (!user) return;
    try {
      setPingingId(targetUserId);
      const conversationId = await createChatWithUser(targetUserId, user.id);
      navigate(`/chat/thread/${conversationId}`);
    } catch (e) {
      console.error("ping error", e);
    } finally {
      setPingingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-28 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold iridescent-text mb-4 text-center">search</h1>
      <Input value={q} onChange={(e) => onChange(e.target.value)} placeholder="search by name, role, or location" className="mb-4" />

      {loading && <p className="text-sm text-muted-foreground text-center">searching...</p>}
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="space-y-2">
        {results.map(p => (
          <Card key={p.user_id} className="bg-card border-border p-3 flex items-center gap-3">
            <img src={p.avatar_url || "/placeholder.svg"} alt={`${p.display_name || "user"} avatar`} className="w-10 h-10 rounded-full object-cover border border-primary/20" loading="lazy" />
            <div className="min-w-0 flex-1">
              <div className="font-medium iridescent-text truncate">{p.display_name || "unknown"}</div>
              <div className="text-xs text-muted-foreground iridescent-text truncate">{[p.job_title, p.location].filter(Boolean).join(" • ")}</div>
            </div>
            <Button size="sm" disabled={!user || pingingId === p.user_id} onClick={() => handlePing(p.user_id)}>
              {pingingId === p.user_id ? "pinging..." : "ping!"}
            </Button>
          </Card>
        ))}
        {!loading && results.length === 0 && q.trim().length >= 2 && (
          <p className="text-sm text-muted-foreground text-center">no results</p>
        )}
      </div>
    </div>
  );
};

export default Search;
