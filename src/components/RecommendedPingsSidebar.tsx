import { useState, useMemo, useEffect } from 'react';
import { X, MessageCircle, Trophy, Send, Copy, Mail, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RecommendedPingsSidebarProps {
  selectedPerson: any | null;
  onClose: () => void;
  people: any[];
  personHealth: Record<string, number>;
  isDemoMode: boolean;
}

export const RecommendedPingsSidebar = ({ 
  selectedPerson, 
  onClose, 
  people,
  personHealth,
  isDemoMode 
}: RecommendedPingsSidebarProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [pingModalOpen, setPingModalOpen] = useState(false);
  const [selectedPing, setSelectedPing] = useState<any>(null);
  const [aiMessage, setAiMessage] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  // Calculate recommended follow-ups
  const recommendedFollowUps = useMemo(() => {
    return people
      .filter(p => {
        const score = personHealth[p.id] || 70;
        return score < 60; // At-risk or worse
      })
      .sort((a, b) => {
        const scoreA = personHealth[a.id] || 70;
        const scoreB = personHealth[b.id] || 70;
        return scoreA - scoreB; // Lower scores first
      })
      .slice(0, 10)
      .map(p => ({
        ...p,
        lastContact: Math.floor(Math.random() * 60) + 14,
        state: personHealth[p.id] < 40 ? 'At Risk' : 'Fading',
        tags: ['MIT', 'AI'],
      }));
  }, [people, personHealth]);

  // Mock recommended new pings
  const recommendedNewPings = useMemo(() => {
    if (!isDemoMode) return [];
    
    return [
      {
        id: 'new-1',
        name: 'Sarah Chen',
        summary: 'AI founder in Boston',
        reasonTag: 'Same event: Buildathon 2025',
        image: null,
      },
      {
        id: 'new-2',
        name: 'Marcus Williams',
        summary: 'Product designer at early-stage startup',
        reasonTag: 'Same industry: AI & Design',
        image: null,
      },
      {
        id: 'new-3',
        name: 'Elena Rodriguez',
        summary: 'VC investor focused on climate tech',
        reasonTag: 'Nearby: Boston',
        image: null,
      },
    ];
  }, [isDemoMode]);

  // Fetch real leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;

      // Get profile views grouped by profile_user_id
      const { data: viewsData } = await supabase
        .from('profile_views')
        .select('profile_user_id, profiles!inner(display_name, user_id)');

      if (!viewsData || viewsData.length === 0) {
        setLeaderboardData([]);
        return;
      }

      // Count views per user
      const viewCounts = viewsData.reduce((acc: any, view: any) => {
        const userId = view.profile_user_id;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            name: view.profiles?.display_name || 'Unknown',
            views: 0,
          };
        }
        acc[userId].views += 1;
        return acc;
      }, {});

      // Convert to array and sort by views
      const sorted = Object.values(viewCounts)
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 10);

      // Add ranks
      const withRanks = sorted.map((entry: any, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.views,
        isUser: entry.userId === user.id,
      }));

      setLeaderboardData(withRanks);
    };

    fetchLeaderboard();
  }, [user]);

  const handlePingNow = (person: any) => {
    setSelectedPing(person);
    // Generate AI message
    const messages = [
      `Hey ${person.name}! It's been a while since we connected. Would love to catch up over coffee soon!`,
      `Hi ${person.name}, I was thinking about you recently. How have you been? Let's reconnect!`,
      `${person.name}, hope you're doing well! I'd love to hear what you're working on these days.`,
    ];
    setAiMessage(messages[Math.floor(Math.random() * messages.length)]);
    setPingModalOpen(true);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(aiMessage);
    toast('Message copied to clipboard!');
  };

  const handleMarkContacted = () => {
    toast('Contact marked as reached out!');
    setPingModalOpen(false);
  };

  return (
    <>
      <div className="w-96 bg-black/90 backdrop-blur border-l border-border/30 flex flex-col overflow-hidden">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border/30 p-4">
            <TabsList className="w-full grid grid-cols-2 bg-card/50">
              <TabsTrigger value="pings" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Pings
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                Leaderboard
              </TabsTrigger>
            </TabsList>
          </div>


          {/* Recommended Pings Tab */}
          <TabsContent value="pings" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            {/* Follow-Ups Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Recommended Follow-Ups
              </h3>
              {recommendedFollowUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">All your connections are healthy! 🎉</p>
              ) : (
                recommendedFollowUps.map(person => (
                  <Card key={person.id} className="bg-card/50 border-border/30 p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm">{person.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {person.tags?.join(' • ')}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-500">
                        {person.state}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last contact: {person.lastContact} days ago
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handlePingNow(person)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Ping Now
                    </Button>
                  </Card>
                ))
              )}
            </div>

            {/* New Pings Section */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Recommended New Pings
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-suggested people to discover based on your circles, events, and interests.
                </p>
              </div>
              {recommendedNewPings.map(person => (
                <Card key={person.id} className="bg-card/50 border-border/30 p-3 space-y-2">
                  <div className="font-semibold text-sm">{person.name}</div>
                  <div className="text-xs text-muted-foreground">{person.summary}</div>
                  <div className="text-xs px-2 py-1 rounded bg-primary/20 text-primary inline-block">
                    {person.reasonTag}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Profile
                    </Button>
                    <Button size="sm" className="flex-1">
                      Save
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Top Connectors
                </h3>
              </div>

              {leaderboardData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No profile views yet. Share your profile to get started!</p>
              ) : (
                leaderboardData.map(entry => (
                  <Card 
                    key={entry.rank} 
                    className={`p-3 ${entry.isUser ? 'bg-primary/10 border-primary/30' : 'bg-card/50 border-border/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-orange-600' :
                        'text-muted-foreground'
                      }`}>
                        #{entry.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{entry.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.score} profile {entry.score === 1 ? 'view' : 'views'}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {entry.score}
                      </div>
                    </div>
                    {entry.isUser && (
                      <div className="text-xs text-primary mt-2">
                        🚀 Keep sharing your profile!
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ping Modal */}
      <Dialog open={pingModalOpen} onOpenChange={setPingModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Ping {selectedPing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                AI-Generated Message
              </label>
              <Textarea 
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                rows={4}
                className="bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCopyMessage}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button 
                className="flex-1"
                onClick={handleMarkContacted}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Contacted
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
