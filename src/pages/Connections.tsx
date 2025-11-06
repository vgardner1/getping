import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Users, Calendar, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Connection {
  id: string;
  target_user_id: string;
  source: string;
  met_at_event_id: string | null;
  created_at: string;
  notes: string | null;
  profile: {
    display_name: string;
    avatar_url: string | null;
    company: string | null;
    job_title: string | null;
    location: string | null;
  };
  event: {
    name: string;
    start_date: string;
    venue_name: string | null;
  } | null;
}

export default function Connections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    filterConnections();
  }, [searchQuery, connections]);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('id, target_user_id, source, met_at_event_id, created_at, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (connectionsError) throw connectionsError;

      // Fetch profiles for all connections
      const profileIds = connectionsData.map(c => c.target_user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, company, job_title, location')
        .in('user_id', profileIds);

      // Fetch events
      const eventIds = connectionsData
        .map(c => c.met_at_event_id)
        .filter(Boolean) as string[];
      
      const { data: eventsData } = eventIds.length > 0 
        ? await supabase
            .from('events')
            .select('id, name, start_date, venue_name')
            .in('id', eventIds)
        : { data: [] };

      // Combine data
      const combined = connectionsData.map(conn => ({
        ...conn,
        profile: profilesData?.find(p => p.user_id === conn.target_user_id) || {
          display_name: 'Unknown',
          avatar_url: null,
          company: null,
          job_title: null,
          location: null
        },
        event: eventsData?.find(e => e.id === conn.met_at_event_id) || null
      }));

      setConnections(combined as any);
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const filterConnections = () => {
    if (!searchQuery.trim()) {
      setFilteredConnections(connections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = connections.filter((conn) => {
      const profile = conn.profile;
      const event = conn.event;
      
      return (
        profile?.display_name?.toLowerCase().includes(query) ||
        profile?.company?.toLowerCase().includes(query) ||
        profile?.job_title?.toLowerCase().includes(query) ||
        profile?.location?.toLowerCase().includes(query) ||
        event?.name?.toLowerCase().includes(query) ||
        event?.venue_name?.toLowerCase().includes(query)
      );
    });

    setFilteredConnections(filtered);
  };

  // Group connections by event
  const groupedConnections = filteredConnections.reduce((groups, conn) => {
    const key = conn.met_at_event_id || 'no-event';
    const eventName = conn.event?.name || 'Direct Connections';
    
    if (!groups[key]) {
      groups[key] = {
        eventName,
        eventDate: conn.event?.start_date,
        connections: []
      };
    }
    groups[key].connections.push(conn);
    return groups;
  }, {} as Record<string, { eventName: string; eventDate?: string; connections: Connection[] }>);

  const getSourceBadge = (source: string) => {
    const badges = {
      profile_view: { label: 'Profile View', variant: 'secondary' as const },
      event: { label: 'Event', variant: 'default' as const },
      manual: { label: 'Added', variant: 'outline' as const }
    };
    return badges[source as keyof typeof badges] || badges.manual;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Connections</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, industry, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{connections.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {Object.keys(groupedConnections).length - (groupedConnections['no-event'] ? 1 : 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {connections.filter(c => c.source === 'profile_view').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Connections Grouped by Event */}
        {!loading && Object.keys(groupedConnections).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "No connections match your search"
                  : "Connect with people at events or share your profile to grow your network"}
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && Object.entries(groupedConnections).map(([key, group]) => (
          <Card key={key} className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{group.eventName}</CardTitle>
                  {group.eventDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(group.eventDate)}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">
                  {group.connections.length} {group.connections.length === 1 ? 'person' : 'people'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/profile/${conn.target_user_id}`)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conn.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {conn.profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold truncate">
                        {conn.profile?.display_name || 'Unknown'}
                      </h4>
                      <Badge {...getSourceBadge(conn.source)}>
                        {getSourceBadge(conn.source).label}
                      </Badge>
                    </div>
                    {conn.profile?.job_title && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">
                          {conn.profile.job_title}
                          {conn.profile.company && ` at ${conn.profile.company}`}
                        </span>
                      </div>
                    )}
                    {conn.profile?.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{conn.profile.location}</span>
                      </div>
                    )}
                    {conn.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{conn.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
