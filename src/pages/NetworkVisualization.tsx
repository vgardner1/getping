import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Circle } from 'lucide-react';
import { Network3D } from '@/components/Network3D';
import { RelationshipHealthPanel } from '@/components/RelationshipHealthPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PingLeaderboard } from '@/components/PingLeaderboard';
import { ChatPreviewPopup } from '@/components/ChatPreviewPopup';
import { NetworkSearchBar } from '@/components/NetworkSearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  lat: number;
  lng: number;
  userId?: string;
  isConnected?: boolean;
}

export default function NetworkVisualization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [circleType, setCircleType] = useState<'my' | 'event' | 'industry'>('my');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [personHealth, setPersonHealth] = useState<Record<string, number>>({});
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [industries] = useState<string[]>(['AI', 'Tech', 'Sustainability']);

  useEffect(() => {
    if (user && !isDemoMode) {
      loadRealConnections();
      loadUserEvents();
    } else if (isDemoMode) {
      loadDemoData();
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    if (user && circleType === 'event' && userEvents.length > 0) {
      loadEventAttendees();
    }
  }, [user, circleType, userEvents]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time event attendance changes
    const channel = supabase
      .channel('event-attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_attendances'
        },
        (payload) => {
          console.log('Event attendance changed:', payload);
          if (circleType === 'event') {
            loadEventAttendees();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, circleType]);

  const loadUserEvents = async () => {
    if (!user) return;

    const { data: attendances, error } = await supabase
      .from('event_attendances')
      .select('event_id, events(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'going');

    if (error) {
      console.error('Error loading user events', error);
      return;
    }

    setUserEvents(attendances?.map(a => a.events).filter(Boolean) || []);
  };

  const loadEventAttendees = async () => {
    if (!user || userEvents.length === 0) return;

    // Get all attendees for events the user is attending
    const eventIds = userEvents.map(e => e.id);
    
    const { data: attendances, error } = await supabase
      .from('event_attendances')
      .select('user_id, event_id')
      .in('event_id', eventIds)
      .eq('status', 'going')
      .neq('user_id', user.id); // Exclude current user

    if (error) {
      console.error('Error loading event attendees', error);
      return;
    }

    if (!attendances || attendances.length === 0) {
      setPeople([]);
      return;
    }

    // Get unique user IDs
    const attendeeUserIds = Array.from(new Set(attendances.map(a => a.user_id)));

    // Fetch profiles for attendees
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', attendeeUserIds);

    if (profilesError) {
      console.error('Error loading attendee profiles', profilesError);
      return;
    }

    // Check which attendees the user is connected to
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('user_id, target_user_id')
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (connectionsError) {
      console.error('Error loading connections', connectionsError);
    }

    // Create a set of connected user IDs
    const connectedUserIds = new Set(
      connections?.map((c: any) => 
        c.user_id === user.id ? c.target_user_id : c.user_id
      ) || []
    );

    // Group attendees by event
    const attendeesByEvent = new Map<string, any[]>();
    attendances.forEach((attendance) => {
      if (!attendeesByEvent.has(attendance.event_id)) {
        attendeesByEvent.set(attendance.event_id, []);
      }
      attendeesByEvent.get(attendance.event_id)!.push(attendance.user_id);
    });

    // Create network people for each event ring
    const networkPeople: NetworkPerson[] = [];
    
    userEvents.forEach((event, eventIndex) => {
      const attendeeIds = attendeesByEvent.get(event.id) || [];
      const attendeeProfiles = profiles?.filter(p => attendeeIds.includes(p.user_id)) || [];
      
      attendeeProfiles.forEach((profile, i) => {
        const totalInRing = attendeeProfiles.length;
        const angle = (360 / Math.max(totalInRing, 1)) * i;
        
        networkPeople.push({
          id: profile.user_id,
          name: profile.display_name || 'Attendee',
          circle: `event-${eventIndex}` as any,
          angle,
          lat: 0,
          lng: 0,
          userId: profile.user_id,
          isConnected: connectedUserIds.has(profile.user_id)
        });
      });
    });

    setPeople(networkPeople);
  };

  const loadRealConnections = async () => {
    if (!user) return;

    // Fetch both directions of connections (user is either side)
    const { data: connections, error } = await supabase
      .from('connections')
      .select('user_id, target_user_id')
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (error) {
      console.error('Error loading connections', error);
      setPeople([]);
      return;
    }

    if (!connections || connections.length === 0) {
      setPeople([]);
      return;
    }

    // Derive the other user's id for each connection
    const otherUserIds = Array.from(
      new Set(
        connections.map((c: any) => (c.user_id === user.id ? c.target_user_id : c.user_id))
      )
    );

    if (otherUserIds.length === 0) {
      setPeople([]);
      return;
    }

    // Fetch profiles for connected users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, location')
      .in('user_id', otherUserIds);

    if (profilesError) {
      console.error('Error loading profiles', profilesError);
      setPeople([]);
      return;
    }

    const count = profiles?.length || 0;
    const angleIncrement = 360 / (count || 1);

    const networkPeople: NetworkPerson[] = (profiles || []).map((p, i) => {
      const angle = i * angleIncrement;
      const lat = (Math.sin(angle * Math.PI / 180) * 50) + (Math.random() * 10 - 5);
      const lng = (Math.cos(angle * Math.PI / 180) * 120) + (Math.random() * 10 - 5);
      return {
        id: p.user_id,
        name: p.display_name || 'Connection',
        circle: 'friends',
        angle,
        lat: Math.max(-85, Math.min(85, lat)),
        lng,
        userId: p.user_id,
      };
    });

    setPeople(networkPeople);
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
        
        const angle = (360 / count) * i;
        const lat = (Math.sin(angle * Math.PI / 180) * 50) + (Math.random() * 10 - 5);
        const lng = (Math.cos(angle * Math.PI / 180) * 120) + (Math.random() * 10 - 5);
        
        demoPeople.push({
          id,
          name: `${circle.charAt(0).toUpperCase() + circle.slice(1)} ${i + 1}`,
          circle,
          angle,
          lat: Math.max(-85, Math.min(85, lat)),
          lng,
        });
        
        healthMap[id] = finalScore;
      }
    });

    setPeople(demoPeople);
    setPersonHealth(healthMap);
  };

  const handlePersonClick = (person: NetworkPerson) => {
    console.log('Person clicked:', person);
    setSelectedPerson(person);
  };

  const handleHealthChange = (id: string, score: number) => {
    setPersonHealth((prev) => ({ ...prev, [id]: score }));
  };


  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header with Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-transparent pb-4 md:pb-8">
        <div className="flex items-center justify-between p-3 md:p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/network')}
            className="text-white hover:bg-white/10 h-8 w-8 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <h1 className="text-lg md:text-2xl font-bold text-white">
            {circleType === 'my' && 'My Network'}
            {circleType === 'industry' && 'Industry Network'}
            {circleType === 'event' && 'Event Network'}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 md:h-10 md:w-10 border-2 bg-black/50 border-primary/30 text-white hover:bg-white/10"
              >
                <Circle className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card z-[100]" align="end">
              <DropdownMenuItem onClick={() => {
                setCircleType('my');
                setSelectedIndustry(null);
                setSelectedEvent(null);
                loadRealConnections();
              }}>
                My circle
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {
                setCircleType('industry');
                setSelectedIndustry(null);
                setSelectedEvent(null);
              }}>
                Industry circle
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {
                setCircleType('event');
                setSelectedIndustry(null);
                setSelectedEvent(null);
              }}>
                Event circle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="px-3 md:px-4 pt-2 hidden md:block">
          <NetworkSearchBar />
        </div>
      </div>

      {/* Leaderboard - Top Left - Hidden on mobile */}
      <div className="fixed top-[220px] left-4 z-20 hidden md:block">
        <PingLeaderboard />
      </div>

      {/* Chat Preview - Top Right - Hidden on mobile */}
      <div className="fixed top-[220px] right-4 z-20 hidden md:block">
        <ChatPreviewPopup />
      </div>

      {/* Mobile: Stack vertically with proper spacing */}
      <div className="fixed top-[260px] left-0 right-0 z-20 md:hidden px-4 space-y-8 max-h-[70vh] overflow-y-auto pb-8">
        <PingLeaderboard />
        <ChatPreviewPopup />
      </div>

      {/* Relationship Health Panel */}
      {selectedPerson && (
        <div className="fixed top-1/2 -translate-y-1/2 right-4 z-30">
          <RelationshipHealthPanel
            person={selectedPerson}
            onClose={() => setSelectedPerson(null)}
            onHealthChange={handleHealthChange}
          />
        </div>
      )}

      {/* Demo Mode Toggle - bottom right */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          variant={isDemoMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsDemoMode(!isDemoMode)}
        >
          {isDemoMode ? "Demo Mode" : "My Circle"}
        </Button>
      </div>

      {/* 3D Network Visualization */}
      <Network3D
        people={people}
        onPersonClick={handlePersonClick}
        personHealth={personHealth}
        circleType={circleType}
        industries={circleType === 'industry' ? industries : undefined}
        events={circleType === 'event' ? userEvents.map(e => e.name) : undefined}
      />
    </div>
  );
}
