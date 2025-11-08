import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Network3D } from '@/components/Network3D';
import { CircleStrengthBar } from '@/components/CircleStrengthBar';
import { HomeNav } from '@/components/HomeNav';
import { RecommendedPingsSidebar } from '@/components/RecommendedPingsSidebar';
import { ProfileHealthModal } from '@/components/ProfileHealthModal';
import { FloatingProfilePopup } from '@/components/FloatingProfilePopup';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Briefcase } from 'lucide-react';
import { setupMessageNotifications, requestNotificationPermission } from '@/lib/notifications';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  userId?: string;
  isConnected?: boolean;
  relationshipHealthScore?: number;
  screenPosition?: { x: number; y: number };
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
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Setup notifications
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
      const channel = setupMessageNotifications(user.id, supabase);
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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

  const handlePersonClick = (person: NetworkPerson, screenPosition?: { x: number; y: number }) => {
    setSelectedPerson({ ...person, screenPosition });
    if (person.userId === 'current-user') {
      setShowProfilePopup(true);
    } else {
      setShowHealthModal(true);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div className="h-screen bg-black text-foreground flex flex-col relative overflow-hidden w-full touch-none overscroll-none">
      {/* Top Nav */}
      <HomeNav />

      {/* Main Content - Full Screen 3D */}
      <div className="flex-1 relative w-full">
        {/* 3D Visualization Canvas - Full Screen */}
        <div className="absolute inset-0 w-full h-full">
          <Network3D 
            people={people}
            onPersonClick={handlePersonClick}
            personHealth={personHealth}
            circleType={circleType}
            industries={circleType === 'industry' ? industries : undefined}
            events={circleType === 'event' ? userEvents.map(e => e.name) : undefined}
          />
        </div>

      {/* Circle Strength Bar - Moved Up */}
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4">
          <CircleStrengthBar people={people} personHealth={personHealth} />
        </div>

        {/* Leaderboard Overlay */}
        <RecommendedPingsSidebar 
          selectedPerson={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          people={people}
          personHealth={personHealth}
          isDemoMode={isDemoMode}
        />

        {/* Profile Health Modal */}
        {selectedPerson && selectedPerson.userId !== 'current-user' && user && (
          <ProfileHealthModal
            person={selectedPerson}
            isOpen={showHealthModal}
            onClose={() => {
              setShowHealthModal(false);
              setSelectedPerson(null);
            }}
            userId={user.id}
            position={(selectedPerson as any).screenPosition}
          />
        )}

        {/* Floating Profile Popup for current user */}
        {selectedPerson && selectedPerson.userId === 'current-user' && user && (
          <FloatingProfilePopup
            userId={user.id}
            isOpen={showProfilePopup}
            onClose={() => {
              setShowProfilePopup(false);
              setSelectedPerson(null);
            }}
          />
        )}
      </div>

      {/* Circle Filter - Bottom Center */}
      <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex gap-2 md:gap-4 bg-black/80 backdrop-blur border border-primary/30 rounded-full px-4 md:px-6 py-2 md:py-3">
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
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDemoMode(!isDemoMode)}
          className="rounded-full bg-black/80 backdrop-blur border-primary/30 text-xs md:text-sm"
        >
          {isDemoMode ? 'Demo' : 'Real'}
        </Button>
      </div>

    </div>
  );
}