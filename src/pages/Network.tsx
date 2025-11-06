import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StarField } from '@/components/StarField';
import { ArrowLeft, MessageSquare, Users, Search, Send, X } from 'lucide-react';
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
  const [chatView, setChatView] = useState<{ userId: string; name: string; avatar: string | null } | null>(null);
  const [messages, setMessages] = useState<{ id: string; content: string; sender_id: string; created_at: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

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
      const dedupedFiltered = deduped.filter(r => {
        const other = r.user_id === user.id ? r.target_user_id : r.user_id;
        return other !== user.id;
      });
      setConnections(dedupedFiltered);

      // Fetch counterpart profiles directly from profiles table (don't filter by experience)
      const otherIds = dedupedFiltered.map(r => r.user_id === user.id ? r.target_user_id : r.user_id).filter(id => id !== user.id);
      const unique = Array.from(new Set(otherIds));
      if (unique.length) {
        const { data: profs, error: profError } = await supabase
          .from('profiles')
          .select('user_id, display_name, first_name, last_name, avatar_url, is_public')
          .in('user_id', unique);
        
        if (!profError && profs) {
          const map: Record<string, { name: string; avatar: string | null }> = {};
          for (const p of profs) {
            let displayName = p.display_name as string | null | undefined;
            // Fallback to first_name + last_name if display_name is empty
            if (!displayName || displayName.trim() === '') {
              const fn = (p as any).first_name as string | undefined;
              const ln = (p as any).last_name as string | undefined;
              if (fn || ln) displayName = [fn, ln].filter(Boolean).join(' ');
            }
            map[p.user_id as string] = { name: displayName || 'User', avatar: (p as any).avatar_url || null };
          }

          // Fallback: fetch non-public profiles securely via RPC one by one
          const missing = unique.filter(id => !map[id]);
          if (missing.length) {
            const results = await Promise.all(
              missing.map(async (id) => {
                try {
                  const { data: sec } = await supabase.rpc('get_public_profile_secure', { target_user_id: id });
                  const row = Array.isArray(sec) && sec.length ? sec[0] : null;
                  if (row) {
                    const name = (row.display_name && row.display_name.trim()) ? row.display_name : 'User';
                    return [id, { name, avatar: row.avatar_url || null }] as const;
                  }
                } catch {}
                return null;
              })
            );
            for (const item of results) {
              if (item) {
                const [id, val] = item;
                map[id] = val;
              }
            }
          }
          setProfiles(map);
        }
      }

      // Fetch unread message counts for each connection
      await fetchUnreadCounts(unique);

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

  const fetchUnreadCounts = async (userIds: string[]) => {
    if (!user || userIds.length === 0) return;
    
    try {
      const lastReadKey = `lastRead_${user.id}`;
      const lastReadStr = localStorage.getItem(lastReadKey);
      const lastRead = lastReadStr ? new Date(lastReadStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      const counts: Record<string, number> = {};
      
      for (const userId of userIds) {
        // Find conversations with this user
        const { data: convData } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (convData && convData.length > 0) {
          // Check if the other user is also in any of these conversations
          const { data: otherConvData } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId)
            .in('conversation_id', convData.map(c => c.conversation_id));

          if (otherConvData && otherConvData.length > 0) {
            // Count unread messages from this user
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('conversation_id', otherConvData.map(c => c.conversation_id))
              .eq('sender_id', userId)
              .gte('created_at', lastRead.toISOString());

            counts[userId] = count || 0;
          }
        }
      }
      
      setUnreadCounts(counts);
    } catch (error) {
      console.warn('Could not fetch unread counts:', error);
    }
  };

  const handleTribeProfileClick = (userId: string) => {
    navigate(`/ping/${userId}`);
  };

  const removeFromTribe = async (targetUserId: string) => {
    if (!user) return;
    if (targetUserId === user.id) {
      toast({ title: "Can't remove yourself", description: "You can't remove yourself from your tribe." });
      return;
    }
    
    try {
      // Remove the connection from the database
      const { error } = await supabase
        .from('connections')
        .delete()
        .or(`and(user_id.eq.${user.id},target_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},target_user_id.eq.${user.id})`);

      if (error) throw error;

      // Update local state (remove only that other user)
      setConnections(prev => prev.filter(c => {
        const otherId = c.user_id === user.id ? c.target_user_id : c.user_id;
        return otherId !== targetUserId;
      }));
      
      setProfiles(prev => {
        const updated = { ...prev };
        delete updated[targetUserId];
        return updated;
      });

      toast({
        title: "Removed from tribe",
        description: "User has been removed from your tribe",
      });
    } catch (error) {
      console.error('Error removing from tribe:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from tribe",
        variant: "destructive"
      });
    }
  };
  const handlePing = async (otherId: string) => {
    if (!user) {
      try { localStorage.setItem('postLoginIntent', JSON.stringify({ type: 'ping', targetUserId: otherId })); } catch {}
      navigate('/auth');
      return;
    }

    try {
      // Optimistic UI update - find/add person to tribe immediately
      const targetProfile = searchResults.find(p => p.user_id === otherId) || 
                           Object.values(profiles).find((_, key) => Object.keys(profiles)[Object.values(profiles).indexOf(_)] === otherId);
      
      if (targetProfile && !profiles[otherId]) {
        const profileData = 'display_name' in targetProfile ? targetProfile : null;
        if (profileData) {
          setProfiles(prev => ({
            ...prev,
            [otherId]: { name: profileData.display_name || 'User', avatar: profileData.avatar_url }
          }));
          setConnections(prev => [...prev, {
            id: 'temp-' + Date.now(),
            user_id: user.id,
            target_user_id: otherId,
            created_at: new Date().toISOString()
          }]);
        }
      }

      const convId = await createChatWithUser(otherId, user.id);
      setConversationId(convId);
      
      // Set active chat user and load messages
      const profile = searchResults.find(p => p.user_id === otherId) || {
        display_name: profiles[otherId]?.name || 'User',
        avatar_url: profiles[otherId]?.avatar || null
      };
      
      setChatView({
        userId: otherId,
        name: profile.display_name || 'User',
        avatar: profile.avatar_url
      });
      
      await loadMessages(convId);
      
      // Mark messages as read from this user
      if (user) {
        const lastReadKey = `lastRead_${user.id}`;
        localStorage.setItem(lastReadKey, new Date().toISOString());
        setUnreadCounts(prev => ({ ...prev, [otherId]: 0 }));
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      setChatLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || chatLoading) return;

    try {
      setChatLoading(true);
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setChatLoading(false);
    }
  };

  // If in chat view, show full-screen chat
  if (chatView) {
    return (
      <div className="min-h-screen bg-background relative">
        <StarField />

        {/* Chat Header */}
        <header className="border-b border-border p-4 relative z-10">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setChatView(null);
                setMessages([]);
                setConversationId(null);
                setNewMessage("");
              }}
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={chatView.avatar || ''} alt={chatView.name} />
              <AvatarFallback>{chatView.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold iridescent-text">{chatView.name}</h1>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative z-10">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground iridescent-text">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={chatView.avatar || ''} alt={chatView.name} />
                  <AvatarFallback className="text-2xl">{chatView.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold iridescent-text mb-2">{chatView.name}</h3>
                <p className="text-muted-foreground iridescent-text">
                  You're now connected! Say hello to start the conversation.
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
                    <div
                      className={`max-w-sm p-3 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3 items-end">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={`Message ${chatView.name}...`}
                className="flex-1 rounded-full min-h-[2.5rem] resize-none"
                disabled={chatLoading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || chatLoading}
                size="lg"
                className="rounded-full w-12 h-12 text-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />

      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/profile')} className="flex items-center gap-2 hover-scale">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">Back to Profile</span>
          </Button>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/connections')} 
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Connections</span>
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" /> Tribe
            </div>
          </div>
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
                      onClick={() => navigate(`/ping/${profile.user_id}`)}
                    >
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name || "Profile"} />
                      <AvatarFallback>{(profile.display_name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/ping/${profile.user_id}`)}
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
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => handleTribeProfileClick(other)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={prof.avatar || ''} alt={prof.name} />
                        <AvatarFallback>{prof.name[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium iridescent-text">{prof.name}</p>
                        <p className="text-xs text-muted-foreground iridescent-text">Connected on {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handlePing(other)} 
                        size="sm" 
                        variant="outline" 
                        className="hover-scale relative"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {unreadCounts[other] > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                        )}
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromTribe(other);
                        }} 
                        size="sm" 
                        variant="outline"
                        className="hover-scale text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
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