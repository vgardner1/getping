import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Circle, Trophy, MessageCircle, ChevronUp, ChevronDown, Users, UserPlus } from 'lucide-react';
import { Network3D } from '@/components/Network3D';
import { RelationshipHealthPanel } from '@/components/RelationshipHealthPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NetworkSearchBar } from '@/components/NetworkSearchBar';
import { LeaderboardCard } from '@/components/network/LeaderboardCard';
import { ChatsCard } from '@/components/network/ChatsCard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MessagesInvite from '@/components/onboarding/MessagesInvite';
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
  const [chatDrawerState, setChatDrawerState] = useState<'hidden' | 'half' | 'full'>('hidden');

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

  const loadIndustryConnections = async (industry: string) => {
    if (!user) return;

    // For now, create demo industry network
    const industryPeople: NetworkPerson[] = [];
    const count = 15 + Math.floor(Math.random() * 10);

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const lat = (Math.sin(angle * Math.PI / 180) * 50) + (Math.random() * 10 - 5);
      const lng = (Math.cos(angle * Math.PI / 180) * 120) + (Math.random() * 10 - 5);

      industryPeople.push({
        id: `industry-${industry}-${i}`,
        name: `${industry} Contact ${i + 1}`,
        circle: 'business',
        angle,
        lat: Math.max(-85, Math.min(85, lat)),
        lng,
      });
    }

    setPeople(industryPeople);
  };

  const handlePersonClick = (person: NetworkPerson) => {
    console.log('Person clicked:', person);
    setSelectedPerson(person);
  };

  const handleHealthChange = (id: string, score: number) => {
    setPersonHealth((prev) => ({ ...prev, [id]: score }));
  };

  const handleChatDrawerToggle = () => {
    if (chatDrawerState === 'hidden') {
      setChatDrawerState('half');
    } else if (chatDrawerState === 'half') {
      setChatDrawerState('full');
    } else {
      setChatDrawerState('hidden');
    }
  };

  const handleDrawerClose = () => {
    setChatDrawerState('hidden');
  };


  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Floating Search Bar - Halfway between top and circle */}
      <div className="absolute top-[30%] md:top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[90%] max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative">
            <NetworkSearchBar />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-2">
        <div className="flex items-center justify-between p-2 md:p-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/network/visualize')}
            className="text-white hover:bg-white/10 h-7 px-3 md:h-9 md:px-4 font-bold text-xs md:text-sm"
          >
            ping!
          </Button>

          <h1 className="text-sm md:text-lg font-bold text-white">
            visualize my circle
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-7 w-7 md:h-9 md:w-9 border bg-black/50 border-primary/30 text-white hover:bg-white/10"
              >
                <Circle className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card/95 backdrop-blur z-[100]" align="end">
              <DropdownMenuItem onClick={() => {
                setCircleType('my');
                setSelectedIndustry(null);
                setSelectedEvent(null);
                if (!isDemoMode) {
                  loadRealConnections();
                }
              }}>
                my circle
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {
                setCircleType('industry');
                setSelectedEvent(null);
                const defaultIndustry = industries[0];
                setSelectedIndustry(defaultIndustry);
                loadIndustryConnections(defaultIndustry);
              }}>
                industry circle
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {
                setCircleType('event');
                setSelectedIndustry(null);
                setSelectedEvent(null);
                if (userEvents.length > 0) {
                  loadEventAttendees();
                }
              }}>
                event circle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Leaderboard Pullout Tab - Top Left */}
      <div className="absolute left-0 top-12 md:top-14 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-r-lg rounded-l-none border-l-0 bg-black/80 backdrop-blur border-primary/30 hover:bg-primary/20 h-8 w-8"
            >
              <Trophy className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-3 bg-black/95 backdrop-blur border-primary/30">
            <LeaderboardCard prioritizedNames={["me","gaspard","josh","spencer"]} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Text Your Contacts Pullout Tab - Below Leaderboard */}
      <div className="absolute left-0 top-24 md:top-28 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-r-lg rounded-l-none border-l-0 bg-black/80 backdrop-blur border-primary/30 hover:bg-primary/20 h-8 w-8"
            >
              <UserPlus className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-black/95 backdrop-blur border-primary/30 overflow-y-auto">
            <MessagesInvite onBack={() => {}} skipSuccessNavigation />
          </SheetContent>
        </Sheet>
      </div>

      {/* Demo Mode Toggle - Bottom Right */}
      <div className="absolute right-4 bottom-24 md:bottom-28 z-20">
        <div className="bg-black/90 backdrop-blur border border-primary/30 rounded-lg p-3 w-48">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-foreground">Try Demo</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="h-6 w-6"
            >
              <Users className="h-3 w-3 text-primary" />
            </Button>
          </div>
          
          {/* Clickable Fake Profile */}
          <button
            onClick={() => navigate('/u/demo-user')}
            className="w-full p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 hover:border-primary/40"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold">
                JD
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-semibold text-foreground">Jane Doe</p>
                <p className="text-[10px] text-muted-foreground">Demo Profile</p>
              </div>
            </div>
          </button>
          
          <Button
            variant={isDemoMode ? "default" : "outline"}
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="w-full mt-2 h-7 text-xs"
          >
            {isDemoMode ? 'Exit Demo' : 'Enter Demo'}
          </Button>
        </div>
      </div>

      {/* Bottom Chats Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-primary/30 shadow-2xl transition-all duration-300 z-40 ${
          chatDrawerState === 'hidden' ? 'translate-y-[calc(100%-3rem)]' :
          chatDrawerState === 'half' ? 'translate-y-[50%]' :
          'translate-y-0'
        }`}
        style={{ height: '80vh' }}
      >
        {/* Handle Bar */}
        <button
          onClick={handleChatDrawerToggle}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full p-3 flex flex-col items-center gap-1 hover:bg-white/5 transition-colors"
        >
          <div className="w-12 h-1 bg-primary/30 rounded-full" />
          <div className="flex items-center gap-2 text-xs text-foreground mt-1">
            {chatDrawerState === 'full' ? (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>ping!</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-3 w-3" />
                <span>chats</span>
                <ChevronUp className="h-3 w-3" />
              </>
            )}
          </div>
        </button>

        {/* Chats Content */}
        <div className="pt-12 px-4 h-full overflow-y-auto pb-20">
          <ChatsCard />
        </div>
      </div>

      {/* 3D Network Visualization */}
      <Network3D
        people={people}
        onPersonClick={handlePersonClick}
        personHealth={personHealth}
        circleType={circleType}
        industries={circleType === 'industry' ? industries : undefined}
        events={circleType === 'event' ? userEvents.map(e => e.name) : undefined}
        isDemoMode={isDemoMode}
      />
    </div>
  );
}
