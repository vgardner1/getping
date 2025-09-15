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
import { getShareableUrl } from '@/lib/environment';
import { createChatWithUser } from '@/utils/chatUtils';

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
        .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Deduplicate reciprocal rows, keep earliest created_at per other user
      const dedupMap = new Map<string, Connection>();
      (connectionRows || []).forEach((r) => {
        const otherId = r.user_id === user.id ? r.target_user_id : r.user_id;
        const existing = dedupMap.get(otherId);
        if (!existing || new Date(r.created_at) < new Date(existing.created_at)) {
          dedupMap.set(otherId, r as Connection);
        }
      });
      const deduped = Array.from(dedupMap.values());
      setConnections(deduped);

      // Fetch counterpart profiles
      const otherIds = deduped.map(r => r.user_id === user.id ? r.target_user_id : r.user_id).filter(id => id !== user.id);
      const unique = Array.from(new Set(otherIds));
      if (unique.length) {
        const { data: profs, error: profError } = await supabase.rpc('get_public_profiles_list', {
          user_ids: unique
        });
        if (!profError && profs) {
          const map: Record<string, { name: string; avatar: string | null }> = {};
          profs.forEach(p => map[p.user_id] = { name: p.display_name || 'User', avatar: p.avatar_url });
          setProfiles(map);
        }
      }

      setLoading(false);
    };

    load();
  }, [user]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length >= 2) {
      searchProfiles(q);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchProfiles = async (qstr: string) => {
    if (!user) return;
    setSearchLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_public_profiles', {
        search_term: qstr
      });
      if (error) throw error;
      setSearchResults((data || []).map((p: any) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        job_title: p.job_title,
        location: p.location,
        company: p.company,
      })));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    window.open(getShareableUrl(`/ping/${userId}`), '_blank');
  };

  const handlePing = async (otherId: string) => {
    if (!user) {
      try { localStorage.setItem('postLoginIntent', JSON.stringify({ type: 'ping', targetUserId: otherId })); } catch {}
      navigate('/auth');
      return;
    }

    try {
      // Optimistic UI update - find/add person to tribe immediately
      const targetProfile = searchResults.find(p => p.user_id === otherId);
      if (targetProfile && !profiles[otherId]) {
        setProfiles(prev => ({
          ...prev,
          [otherId]: { name: targetProfile.display_name || 'User', avatar: targetProfile.avatar_url }
        }));
        setConnections(prev => [...prev, {
          id: 'temp-' + Date.now(),
          user_id: user.id,
          target_user_id: otherId,
          created_at: new Date().toISOString()
        }]);
      }

      const conversationId = await createChatWithUser(otherId, user.id);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      });
    }
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
          <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /> Tribe</div>
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
                    className="p-3 flex items-center gap-3 hover:bg-secondary/20 rounded-lg transition-colors"
                  >
                    <Avatar 
                      className="w-10 h-10 cursor-pointer"
                      onClick={() => handleProfileClick(profile.user_id)}
                    >
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name || "Profile"} />
                      <AvatarFallback>{(profile.display_name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleProfileClick(profile.user_id)}
                    >
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
                    <Button 
                      size="sm"
                      onClick={() => handlePing(profile.user_id)}
                      className="hover-scale"
                    >
                      ping!
                    </Button>
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

        {/* Tribe Section */}
        <Card className="bg-card border-border p-4">
          <h3 className="text-lg font-semibold iridescent-text mb-4">Your Tribe</h3>
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
                        <p className="text-xs text-muted-foreground iridescent-text">Joined tribe on {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button onClick={() => handlePing(other)} className="hover-scale">
                      <MessageSquare className="w-4 h-4 mr-2" /> ping!
                    </Button>
                  </div>
                );
              })}
              {connections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground iridescent-text">
                  No tribe members yet. ping! people from search results to add them to your tribe!
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