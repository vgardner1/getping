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
}

interface LeaderboardCardProps {
  prioritizedNames?: string[]; // names to always include if found
}

export const LeaderboardCard = ({ prioritizedNames = [] }: LeaderboardCardProps) => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaders();
  }, []);

  const loadLeaders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Conversations I'm in
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      const conversationIds = participantData?.map((p) => p.conversation_id) || [];
      if (conversationIds.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      // Messages in those conversations (count by sender, including me)
      const { data: messages } = await supabase
        .from('messages')
        .select('conversation_id, sender_id')
        .in('conversation_id', conversationIds);

      const senderCounts = new Map<string, number>();
      messages?.forEach((m) => {
        senderCounts.set(m.sender_id, (senderCounts.get(m.sender_id) || 0) + 1);
      });

      const senderIds = Array.from(senderCounts.keys());

      // Always include current user and prioritized display names if available
      // Fetch profiles by sender ids
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', [...senderIds, user.id]);

      // Fetch by display name matches for prioritizedNames
      let prioritizedProfiles: any[] = [];
      if (prioritizedNames.length > 0) {
        const ors = prioritizedNames
          .map((n) => `display_name.ilike.*${n}*`)
          .join(',');
        const { data } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .or(ors);
        prioritizedProfiles = data || [];
      }

      const allProfilesMap = new Map<string, { user_id: string; display_name: string | null; avatar_url: string | null }>();
      [...(senderProfiles || []), ...prioritizedProfiles].forEach((p) => {
        allProfilesMap.set(p.user_id, p);
      });

      // Build entries, ensuring prioritized names appear (even if 0 messages)
      const allEntries: LeaderboardEntry[] = [];
      allProfilesMap.forEach((p) => {
        const count = senderCounts.get(p.user_id) || 0;
        const firstName = (p.display_name || 'User').split(' ')[0];
        allEntries.push({
          id: p.user_id,
          name: firstName,
          avatar: p.avatar_url || undefined,
          pingCount: count,
        });
      });

      // If still missing prioritized names (no profile found), add placeholders
      prioritizedNames.forEach((name) => {
        const firstName = name.split(' ')[0];
        const exists = allEntries.some((e) => (e.name || '').toLowerCase().includes(firstName.toLowerCase()));
        if (!exists) {
          allEntries.push({ id: `placeholder-${firstName}`, name: firstName, pingCount: 0 });
        }
      });

      // Sort and limit
      const sorted = allEntries
        .sort((a, b) => b.pingCount - a.pingCount || a.name.localeCompare(b.name))
        .slice(0, 6);

      setLeaders(sorted);
    } catch (e) {
      console.error('Error loading leaderboard', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Trophy className="h-3 w-3 text-primary" />
        <h3 className="text-xs font-semibold text-foreground">Leaders</h3>
      </div>

      {loading ? (
        <div className="space-y-1">
          <div className="h-8 bg-primary/10 rounded animate-pulse" />
          <div className="h-8 bg-primary/10 rounded animate-pulse" />
        </div>
      ) : leaders.length === 0 ? (
        <p className="text-[10px] text-muted-foreground px-1">No pings yet</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {leaders.map((leader, idx) => {
            const getPositionColor = () => {
              if (idx === 0) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500';
              if (idx === 1) return 'bg-gray-400/20 border-gray-400/30 text-gray-400';
              if (idx === 2) return 'bg-amber-600/20 border-amber-600/30 text-amber-600';
              return 'bg-primary/10 border-primary/20 text-primary';
            };

            return (
              <div
                key={leader.id}
                className={`flex items-center gap-2 p-2 rounded-lg border ${getPositionColor()}`}
              >
                <span className="text-xs font-bold w-4">#{idx + 1}</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={leader.avatar} alt={`${leader.name} avatar`} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {leader.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{leader.name}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 text-primary" />
                    <span className="text-[10px] text-muted-foreground">{leader.pingCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
