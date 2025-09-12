import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StarField } from '@/components/StarField';
import { ArrowLeft, MessageSquare, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Connection {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
}

interface SearchResult {
  user_id: string;
  display_name: string;
  avatar_url: string;
  job_title: string;
  location: string;
  company: string;
}

const Network = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch connections where current user participates
      const { data: connectionRows, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${user.id},target_user_id.eq.${user.id})`);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      
      setConnections(connectionRows || []);

      // Fetch counterpart profiles
      const otherIds = (connectionRows || []).map(r => r.user_id === user.id ? r.target_user_id : r.user_id);
      const unique = Array.from(new Set(otherIds));
      if (unique.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', unique);
        const map: Record<string, { name: string; avatar: string | null }> = {};
        (profs || []).forEach(p => map[p.user_id] = { name: p.display_name || 'User', avatar: p.avatar_url });
        setProfiles(map);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchProfiles();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchProfiles = async () => {
    if (!user) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, job_title, location, company')
        .neq('user_id', user.id) // Exclude current user
        .or(`display_name.ilike.%${searchQuery}%,job_title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    window.open(`/ping/${userId}`, '_blank');
  };

  const startConversation = async (otherId: string) => {
    if (!user) return;

    // Create conversation
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({ category: 'personal' })
      .select('id')
      .single();
    if (convErr || !conv) { console.error(convErr); return; }

    // Add current user as participant (allowed by policy)
    const { error: partErr1 } = await supabase
      .from('conversation_participants')
      .insert({ conversation_id: conv.id, user_id: user.id });
    if (partErr1) { console.error(partErr1); return; }

    // Add other user as participant (allowed by new policy)
    const { error: partErr2 } = await supabase
      .from('conversation_participants')
      .insert({ conversation_id: conv.id, user_id: otherId });
    if (partErr2) { console.error(partErr2); return; }

    navigate(`/chat/${conv.id}`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />

      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/profile')} className="flex items-center gap-2 hover-scale">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">Back to Profile</span>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /> Network</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-6 relative z-10">
        {/* Search Section */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-primary" />
            <Input
              placeholder="Search people by name, role, location, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
            />
          </div>
        </Card>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <Card className="bg-card border-border p-4">
            <h3 className="text-lg font-semibold iridescent-text mb-4">Search Results</h3>
            {searchLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground iridescent-text">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((profile) => (
                  <div
                    key={profile.user_id}
                    onClick={() => handleProfileClick(profile.user_id)}
                    className="p-3 flex items-center gap-3 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name || "Profile"} />
                      <AvatarFallback>{(profile.display_name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium iridescent-text truncate">
                        {profile.display_name || "Unknown User"}
                      </h4>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground iridescent-text">No profiles found</p>
              </div>
            )}
          </Card>
        )}

        {/* Connections Section */}
        <Card className="bg-card border-border p-4">
          <h3 className="text-lg font-semibold iridescent-text mb-4">Your Connections</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="iridescent-text">Loading connections...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {connections.map((c) => {
                const other = c.user_id === user?.id ? c.target_user_id : c.user_id;
                const prof = profiles[other] || { name: 'User', avatar: null };
                return (
                  <div key={c.id} className="p-3 flex items-center justify-between bg-secondary/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        {prof.avatar ? <AvatarImage src={prof.avatar} /> : <AvatarFallback>{prof.name[0] || 'U'}</AvatarFallback>}
                      </Avatar>
                      <div>
                        <p className="font-medium iridescent-text">{prof.name}</p>
                        <p className="text-xs text-muted-foreground iridescent-text">Connected on {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button onClick={() => startConversation(other)} className="hover-scale">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message
                    </Button>
                  </div>
                );
              })}
              {connections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground iridescent-text">
                  No connections yet. Search for people above to connect!
                </div>
              )}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Network;