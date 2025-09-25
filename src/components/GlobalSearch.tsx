import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getShareableUrl } from "@/lib/environment";
import { OptimizedImage } from "@/components/OptimizedImage";

interface SearchResult {
  user_id: string;
  display_name: string;
  avatar_url: string;
  job_title: string;
  location: string;
  company: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const q = query.trim();
    if (q.length >= 2) {
      searchProfiles(q);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchProfiles = async (qstr: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_public_profiles', {
        search_term: qstr
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    window.open(getShareableUrl(`/ping/${userId}`), '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="bg-card border-border w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-primary" />
            <Input
              placeholder="search people by name, role, location, or company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground iridescent-text">searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((profile) => (
                <button
                  key={profile.user_id}
                  onClick={() => handleProfileClick(profile.user_id)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-secondary/20 rounded-lg transition-colors text-left"
                >
                  <OptimizedImage
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.display_name || "Profile"}
                    className="w-12 h-12 rounded-full border border-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium iridescent-text truncate">
                      {profile.display_name || "unknown user"}
                    </h3>
                    <p className="text-sm text-muted-foreground iridescent-text truncate">
                      {profile.job_title && profile.company 
                        ? `${profile.job_title} at ${profile.company}`
                        : profile.job_title || profile.company || ""}
                    </p>
                    {profile.location && (
                      <p className="text-xs text-muted-foreground iridescent-text truncate">
                        {profile.location}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground iridescent-text">no profiles found</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground iridescent-text">type at least 3 characters to search</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GlobalSearch;