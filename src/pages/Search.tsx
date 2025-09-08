import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PINGER_PROFILES } from "@/data/pingers";

interface Pinger { id: string; name: string; title: string; avatar: string; location: string; }

const DATA: Pinger[] = PINGER_PROFILES.map(p => ({
  id: p.id,
  name: p.name,
  title: p.role,
  avatar: p.avatar,
  location: p.city,
}));

const scoreMatch = (q: string, p: Pinger) => {
  const s = q.toLowerCase();
  const fields = [p.name, p.title, p.location].map(f => f.toLowerCase());
  let score = 0;
  fields.forEach(f => {
    if (f.startsWith(s)) score += 3;
    if (f.includes(s)) score += 2;
  });
  return score;
};

const Search = () => {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return DATA;
    const s = q.trim().toLowerCase();
    return [...DATA]
      .filter(p => scoreMatch(s, p) > 0)
      .sort((a, b) => scoreMatch(s, b) - scoreMatch(s, a));
  }, [q]);

  return (
    <div className="min-h-screen bg-background p-4 pb-28 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold iridescent-text mb-4 text-center">Search</h1>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, role, or location" className="mb-4" />
      <div className="space-y-2">
        {results.map(p => (
          <Link key={p.id} to={`/chat/thread/${p.id}`}>
            <Card className="bg-card border-border p-3 flex items-center gap-3 hover:border-primary/50 transition-colors">
              <img src={p.avatar} alt={`${p.name} avatar`} className="w-10 h-10 rounded-full object-cover border border-primary/20" loading="lazy" />
              <div className="min-w-0">
                <div className="font-medium iridescent-text truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground iridescent-text truncate">{p.title} • {p.location}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Search;
