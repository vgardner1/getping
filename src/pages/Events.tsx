import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarField } from '@/components/StarField';
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';
import { RecommendedEvents } from '@/components/RecommendedEvents';
import { EventModal } from '@/components/EventModal';

interface Event {
  id: string;
  eventbrite_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  url: string;
  image_url: string | null;
  category: string | null;
  tags: string[];
  event_attendances: Array<{ user_id: string; status: string }>;
}

export default function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchEvents();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-eventbrite-events', {
        body: {
          location: profile?.location || 'Boston, MA',
          interests: profile?.interests || [],
          page: 1,
        },
      });

      if (error) throw error;
      setEvents(data.events || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (eventId: string, status: 'going' | 'interested') => {
    try {
      const { error } = await supabase.from('event_attendances').upsert(
        {
          user_id: user?.id,
          event_id: eventId,
          status,
        },
        { onConflict: 'user_id,event_id' }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Marked as ${status}!`,
      });

      setSelectedEvent(null);
      // Refresh events to show updated attendance
      fetchEvents();
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update attendance',
        variant: 'destructive',
      });
    }
  };

  const getUserStatus = (event: Event): string | null => {
    const userAttendance = event.event_attendances?.find((a) => a.user_id === user?.id);
    return userAttendance?.status || null;
  };

  const getAttendeeCount = (event: Event): number => {
    return event.event_attendances?.filter((a) => a.status === 'going').length || 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />

      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">Back to Profile</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 relative z-10 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold iridescent-text mb-2">Upcoming Events</h1>
          <p className="text-muted-foreground iridescent-text">
            Events tailored to your interests in {profile?.location || 'your area'}
          </p>
        </div>

        {/* Recommended Events Section */}
        {profile && !loading && (
          <RecommendedEvents 
            userId={user.id} 
            profile={profile}
            onEventClick={(eventId) => {
              const event = events.find(e => e.id === eventId);
              if (event?.url) window.open(event.url, '_blank');
            }}
          />
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="iridescent-text">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Check back later for events in your area!
            </p>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">All Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
              const userStatus = getUserStatus(event);
              const attendeeCount = getAttendeeCount(event);

              return (
                <Card key={event.id} className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer">
                  <div onClick={() => setSelectedEvent(event)}>
                    {event.image_url && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <OptimizedImage
                          src={event.image_url}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">{event.name}</h3>
                        {event.category && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {event.category}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        
                        {event.venue_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="line-clamp-1">{event.venue_name}</span>
                          </div>
                        )}

                        {attendeeCount > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{attendeeCount} going from your network</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex gap-2">
                    {userStatus === 'going' ? (
                      <Button variant="default" size="sm" className="flex-1" disabled>
                        Going ✓
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
            </div>
          </div>
        )}
      </main>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onGoing={() => selectedEvent && handleAttendance(selectedEvent.id, 'going')}
        attendeeCount={selectedEvent ? getAttendeeCount(selectedEvent) : 0}
      />
    </div>
  );
}