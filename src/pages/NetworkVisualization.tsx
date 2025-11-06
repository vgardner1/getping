import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Globe, Circle, Search, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Network3D } from '@/components/Network3D';
import { NetworkGlobe } from '@/components/NetworkGlobe';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChatList } from '@/components/ChatList';
import { MessageCircle } from 'lucide-react';
import { RelationshipHealthPanel } from '@/components/RelationshipHealthPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances';
  angle: number;
  lat: number;
  lng: number;
  userId?: string;
}

export default function NetworkVisualization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [viewMode, setViewMode] = useState<'chats' | 'circles' | 'globe'>('chats');
  const [circleType, setCircleType] = useState<'my' | 'industry' | 'event'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [personHealth, setPersonHealth] = useState<Record<string, number>>({});

  // Check URL params for navigation from events page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const type = params.get('type');
    
    if (view === 'circles') {
      setViewMode('circles');
    }
    if (type === 'event' || type === 'industry' || type === 'my') {
      setCircleType(type as 'my' | 'industry' | 'event');
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadRealConnections();
    }
  }, [user]);

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

  const handlePersonClick = (person: NetworkPerson) => {
    console.log('Person clicked:', person);
    setSelectedPerson(person);
  };

  const handleHealthChange = (id: string, score: number) => {
    setPersonHealth((prev) => ({ ...prev, [id]: score }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-border z-50">
        <div className="p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (viewMode === 'chats') {
                navigate('/profile');
              } else {
                setViewMode('chats');
              }
            }}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold iridescent-text">
            {viewMode === 'chats' ? 'chats' : 'visualize your circle'}
          </h1>
        </div>
        
        {/* Search bar - only show in chats view */}
        {viewMode === 'chats' && (
          <div className="px-4 pb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'chats' | 'circles' | 'globe')} className="flex-1 flex flex-col w-full h-full">
        <TabsContent value="chats" className="flex-1 m-0 h-full">
          <ChatList searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="circles" className="flex-1 m-0 h-full">
          <Network3D people={people} onPersonClick={handlePersonClick} personHealth={personHealth} />
        </TabsContent>
        
        <TabsContent value="globe" className="flex-1 m-0 h-full">
          <NetworkGlobe people={people} onPersonClick={handlePersonClick} />
        </TabsContent>

        {/* View toggle at bottom */}
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 pb-2">
          <TabsList className="bg-card/95 backdrop-blur border border-border shadow-lg">
            <TabsTrigger value="chats" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chats
            </TabsTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm bg-primary text-primary-foreground shadow-sm"
                  data-state={viewMode === 'circles' ? 'active' : 'inactive'}
                  onClick={() => setViewMode('circles')}
                >
                  <Circle className="h-4 w-4" />
                  {circleType === 'my' ? 'My circle' : circleType === 'industry' ? 'Industry circle' : 'Event circles'}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-card border-border">
                <DropdownMenuItem onClick={() => setCircleType('my')}>
                  My circle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCircleType('industry')}>
                  Industry circle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCircleType('event')}>
                  Event circles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TabsTrigger value="globe" className="gap-2">
              <Globe className="h-4 w-4" />
              Globe
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Relationship Health Panel */}
      <RelationshipHealthPanel 
        person={selectedPerson} 
        onClose={() => setSelectedPerson(null)} 
        onHealthChange={handleHealthChange}
      />
    </div>
  );
}
