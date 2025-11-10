import { useState, useEffect } from 'react';
import { Search, TrendingUp, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  title?: string;
  viewCount: number;
  isInCircle: boolean;
}

export const NetworkSearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [topUsers, setTopUsers] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopUsers();
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      searchUsers();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const loadTopUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile view counts
      const { data: viewCounts, error } = await supabase
        .from('profile_views')
        .select('profile_user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count views per user
      const viewCountMap = new Map<string, number>();
      viewCounts?.forEach((view) => {
        const count = viewCountMap.get(view.profile_user_id) || 0;
        viewCountMap.set(view.profile_user_id, count + 1);
      });

      // Get top 3 users by view count
      const topUserEntries = Array.from(viewCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      // Mock data for specific users if they're not in top 3
      const mockUsers = [
        { userId: user.id, name: 'Me', viewCount: 22 },
        { userId: 'spencer-id', name: 'Spencer', viewCount: 18 },
        { userId: 'josh-id', name: 'Josh', viewCount: 15 },
        { userId: 'gaspard-id', name: 'Gaspard', viewCount: 12 },
      ];

      // Use real data if available, otherwise use mock data
      let topUserIds: string[];
      if (topUserEntries.length === 0) {
        // No real data, use mock
        topUserIds = mockUsers.slice(0, 3).map(u => u.userId);
        mockUsers.forEach(u => viewCountMap.set(u.userId, u.viewCount));
      } else {
        // Ensure current user is first with correct count
        topUserIds = topUserEntries.map(([userId]) => userId);
        if (!topUserIds.includes(user.id)) {
          topUserIds = [user.id, ...topUserIds.slice(0, 2)];
          viewCountMap.set(user.id, 22);
        }
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, job_title')
        .in('user_id', topUserIds);

      const topUserResults: SearchResult[] = (profiles || []).map((profile) => ({
        id: profile.user_id,
        userId: profile.user_id,
        name: profile.display_name || 'Unknown',
        avatar: profile.avatar_url,
        title: profile.job_title,
        viewCount: viewCountMap.get(profile.user_id) || 0,
        isInCircle: true,
      })).sort((a, b) => b.viewCount - a.viewCount);

      setTopUsers(topUserResults);
    } catch (error) {
      console.error('Error loading top users:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Search in connections
      const { data: connections } = await supabase
        .from('connections')
        .select('target_user_id, profiles!connections_target_user_id_fkey(user_id, display_name, avatar_url, job_title)')
        .eq('user_id', user.id)
        .ilike('profiles.display_name', `%${query}%`)
        .limit(5);

      // Search in all public profiles
      const { data: publicProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, job_title')
        .eq('is_public', true)
        .ilike('display_name', `%${query}%`)
        .neq('user_id', user.id)
        .limit(5);

      // Get view counts for search results
      const allUserIds = [
        ...(connections || []).map((c: any) => c.profiles?.user_id),
        ...(publicProfiles || []).map((p) => p.user_id),
      ].filter(Boolean);

      const { data: viewCounts } = await supabase
        .from('profile_views')
        .select('profile_user_id')
        .in('profile_user_id', allUserIds);

      const viewCountMap = new Map<string, number>();
      viewCounts?.forEach((view) => {
        const count = viewCountMap.get(view.profile_user_id) || 0;
        viewCountMap.set(view.profile_user_id, count + 1);
      });

      const connectionUserIds = new Set(
        (connections || []).map((c: any) => c.profiles?.user_id)
      );

      const searchResults: SearchResult[] = [
        ...(connections || [])
          .filter((c: any) => c.profiles)
          .map((c: any) => ({
            id: c.profiles.user_id,
            userId: c.profiles.user_id,
            name: c.profiles.display_name || 'Unknown',
            avatar: c.profiles.avatar_url,
            title: c.profiles.job_title,
            viewCount: viewCountMap.get(c.profiles.user_id) || 0,
            isInCircle: true,
          })),
        ...(publicProfiles || [])
          .filter((p) => !connectionUserIds.has(p.user_id))
          .map((p) => ({
            id: p.user_id,
            userId: p.user_id,
            name: p.display_name || 'Unknown',
            avatar: p.avatar_url,
            title: p.job_title,
            viewCount: viewCountMap.get(p.user_id) || 0,
            isInCircle: false,
          })),
      ];

      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/u/${userId}`);
    setQuery('');
    setShowResults(false);
  };

  const displayResults = query ? results : topUsers;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input with 3D effect and animation */}
      <div className="relative group animate-float">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300" />
        <div className="relative transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary z-10 drop-shadow-lg" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            placeholder="grow your circle ⭕"
            className="pl-12 pr-4 py-6 bg-black/90 backdrop-blur-xl border-2 border-primary/40 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/30 transition-all duration-300 shadow-2xl shadow-primary/20 relative"
            style={{
              boxShadow: '0 8px 32px rgba(0, 255, 102, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          />
        </div>
      </div>

      {/* Search Results Dropdown - Only show when there's a query */}
      {showResults && query && displayResults.length > 0 && (
        <Card className="absolute top-full mt-2 w-full bg-black/95 backdrop-blur-xl border-2 border-primary/30 shadow-2xl shadow-primary/20 rounded-xl overflow-hidden z-50 animate-fade-in">
          <div className="p-2">
            {displayResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleUserClick(result.userId)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer group"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/30 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={result.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {result.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {result.name}
                    </p>
                    {result.isInCircle && (
                      <span className="text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                        In Circle
                      </span>
                    )}
                  </div>
                  {result.title && (
                    <p className="text-xs text-muted-foreground truncate">
                      {result.title}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-primary">
                  <User className="h-3 w-3" />
                  <span className="text-sm font-bold">{result.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
