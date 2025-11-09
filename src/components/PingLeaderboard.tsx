import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  pingCount: number;
  rank: number;
}

export const PingLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaders();
  }, []);

  const loadLeaders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all conversations the user is part of
      const { data: conversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!conversations || conversations.length === 0) {
        setLoading(false);
        return;
      }

      const conversationIds = conversations.map(c => c.conversation_id);

      // Get message counts per conversation
      const { data: messages } = await supabase
        .from('messages')
        .select('conversation_id, sender_id, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Count messages per sender (excluding current user)
      const senderCounts = new Map<string, number>();
      messages?.forEach(msg => {
        if (msg.sender_id !== user.id) {
          const count = senderCounts.get(msg.sender_id) || 0;
          senderCounts.set(msg.sender_id, count + 1);
        }
      });

      // Get profiles for top senders
      const topSenderIds = Array.from(senderCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([senderId]) => senderId);

      if (topSenderIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', topSenderIds);

      const leaderboardData: LeaderboardEntry[] = (profiles || [])
        .map((profile) => ({
          id: profile.user_id,
          name: profile.display_name || 'Unknown',
          avatar: profile.avatar_url,
          pingCount: senderCounts.get(profile.user_id) || 0,
          rank: 0,
        }))
        .sort((a, b) => b.pingCount - a.pingCount)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaders(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/80 backdrop-blur border-primary/30 p-4 w-72 shadow-xl">
        <div className="space-y-2">
          <div className="h-4 bg-primary/20 rounded animate-pulse" />
          <div className="h-4 bg-primary/20 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/80 backdrop-blur border-primary/30 p-5 w-80 shadow-xl animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Most Pings</h3>
        </div>

        <div className="space-y-3">
          {leaders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pings yet</p>
          ) : (
            leaders.map((leader) => (
              <div
                key={leader.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  {leader.rank}
                </div>
                
                <Avatar className="h-12 w-12 border border-primary/30">
                  <AvatarImage src={leader.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {leader.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {leader.name}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm font-bold">{leader.pingCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};
