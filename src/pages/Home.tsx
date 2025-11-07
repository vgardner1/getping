import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Network3D } from '@/components/Network3D';
import { CircleStrengthTracker } from '@/components/CircleStrengthTracker';
import { HomeNav } from '@/components/HomeNav';
import { RecommendedPingsSidebar } from '@/components/RecommendedPingsSidebar';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Briefcase } from 'lucide-react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  userId?: string;
  isConnected?: boolean;
  relationshipHealthScore?: number;
}

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [personHealth, setPersonHealth] = useState<Record<string, number>>({});
  const [circleType, setCircleType] = useState<'my' | 'industry' | 'event'>('my');
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [industries] = useState(['AI', 'Tech', 'Sustainability']);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !isDemoMode) {
      loadRealConnections();
      loadUserEvents();
    } else if (isDemoMode) {
      loadDemoData();
    }
  }, [user, isDemoMode, circleType]);

  const loadUserEvents = async () => {
    if (!user) return;

    const { data: attendances } = await supabase
      .from('event_attendances')
      .select('event_id, events(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'going');

    setUserEvents(attendances?.map(a => a.events).filter(Boolean) || []);
  };

  const loadRealConnections = async () => {
    if (!user) return;

    const { data: connections } = await supabase
      .from('connections')
      .select('user_id, target_user_id')
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (!connections || connections.length === 0) {
      setPeople([]);
      return;
    }

    const otherUserIds = Array.from(
      new Set(connections.map((c: any) => (c.user_id === user.id ? c.target_user_id : c.user_id)))
    );

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', otherUserIds);

    const count = profiles?.length || 0;
    const angleIncrement = 360 / (count || 1);

    const networkPeople: NetworkPerson[] = (profiles || []).map((p, i) => ({
      id: p.user_id,
      name: p.display_name || 'Connection',
      circle: 'friends',
      angle: i * angleIncrement,
      userId: p.user_id,
      relationshipHealthScore: 70 + Math.random() * 30,
    }));

    setPeople(networkPeople);
    
    // Calculate health scores
    const healthMap: Record<string, number> = {};
    networkPeople.forEach(p => {
      healthMap[p.id] = p.relationshipHealthScore || 70;
    });
    setPersonHealth(healthMap);
  };

  const loadDemoData = () => {
    const circles: Array<'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended'> = 
      ['family', 'friends', 'business', 'acquaintances', 'network', 'extended'];
    
    const demoPeople: NetworkPerson[] = [];
    const healthMap: Record<string, number> = {};

    circles.forEach((circle, circleIdx) => {
      const count = circleIdx === 0 ? 3 : circleIdx === 1 ? 8 : circleIdx === 2 ? 12 : circleIdx === 3 ? 15 : circleIdx === 4 ? 20 : 25;
      
      for (let i = 0; i < count; i++) {
        const id = `demo-${circle}-${i}`;
        const healthScore = circleIdx === 0 ? 85 + Math.random() * 15 :
                           circleIdx === 1 ? 75 + Math.random() * 20 :
                           circleIdx === 2 ? 70 + Math.random() * 25 :
                           circleIdx === 3 ? 60 + Math.random() * 30 :
                           circleIdx === 4 ? 55 + Math.random() * 35 :
                           45 + Math.random() * 40;
        
        // Add some at-risk contacts
        const isAtRisk = Math.random() < 0.15;
        const finalScore = isAtRisk ? 15 + Math.random() * 25 : healthScore;
        
        demoPeople.push({
          id,
          name: `${circle.charAt(0).toUpperCase() + circle.slice(1)} ${i + 1}`,
          circle,
          angle: (360 / count) * i,
          relationshipHealthScore: finalScore,
        });
        
        healthMap[id] = finalScore;
      }
    });

    setPeople(demoPeople);
    setPersonHealth(healthMap);
  };

  const handlePersonClick = (person: NetworkPerson) => {
    setSelectedPerson(person);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col relative overflow-hidden">
      {/* Top Nav */}
      <HomeNav />

      {/* Main Content */}
      <div className="flex-1 relative flex">
        {/* Circle Strength Tracker - Overlay on canvas */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <div className="pointer-events-auto">
            <CircleStrengthTracker 
              people={people} 
              personHealth={personHealth}
              isDemoMode={isDemoMode}
            />
          </div>
        </div>


        {/* 3D Visualization Canvas */}
        <div className="flex-1">
          <Network3D 
            people={people}
            onPersonClick={handlePersonClick}
            personHealth={personHealth}
            circleType={circleType}
            industries={circleType === 'industry' ? industries : undefined}
            events={circleType === 'event' ? userEvents.map(e => e.name) : undefined}
          />
        </div>

        {/* Right Sidebar */}
        <RecommendedPingsSidebar 
          selectedPerson={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          people={people}
          personHealth={personHealth}
          isDemoMode={isDemoMode}
        />
      </div>

      {/* Circle Filter - Bottom Center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex gap-4 bg-black/80 backdrop-blur border border-primary/30 rounded-full px-6 py-3">
          <Button
            variant={circleType === 'my' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCircleType('my')}
            className="rounded-full"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant={circleType === 'event' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCircleType('event')}
            className="rounded-full"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={circleType === 'industry' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCircleType('industry')}
            className="rounded-full"
          >
            <Briefcase className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Demo/Real Toggle - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          variant="outline"
          onClick={() => setIsDemoMode(!isDemoMode)}
          className="bg-black/80 backdrop-blur border-primary/30 text-foreground hover:bg-primary/10 font-mono"
        >
          {isDemoMode ? '🎭 Demo' : '⚡ Real'}
        </Button>
      </div>
    </div>
  );
}
