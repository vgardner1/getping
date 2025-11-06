import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/OptimizedImage';

interface RecommendedEvent {
  id: string;
  name: string;
  start_date: string;
  venue_name: string | null;
  venue_city: string | null;
  image_url: string | null;
  category: string | null;
  url: string;
  relevance_score: number;
  reason: string;
}

interface RecommendedEventsProps {
  userId: string;
  profile: any;
  onEventClick?: (eventId: string) => void;
}

export function RecommendedEvents({ userId, profile, onEventClick }: RecommendedEventsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [userId, profile]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);

      // Get user's past event attendance
      const { data: attendances } = await supabase
        .from('event_attendances')
        .select('event_id, events(category, tags)')
        .eq('user_id', userId)
        .eq('status', 'going');

      // Get all available events
      const { data: allEvents } = await supabase
        .from('events')
        .select(`
          *,
          event_attendances(user_id, status)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(50);

      if (!allEvents) {
        setRecommendations([]);
        return;
      }

      // Calculate relevance scores
      const scoredEvents = allEvents.map((event) => {
        let score = 0;
        let reasons: string[] = [];

        // Score based on user interests
        if (profile?.interests && event.category) {
          const matchingInterests = profile.interests.filter((interest: string) =>
            event.category?.toLowerCase().includes(interest.toLowerCase()) ||
            event.tags?.some((tag: string) => tag.toLowerCase().includes(interest.toLowerCase()))
          );
          if (matchingInterests.length > 0) {
            score += matchingInterests.length * 10;
            reasons.push(`Matches your interests: ${matchingInterests.join(', ')}`);
          }
        }

        // Score based on past event categories
        if (attendances && attendances.length > 0) {
          const pastCategories = attendances
            .map((a: any) => a.events?.category)
            .filter(Boolean);
          if (pastCategories.includes(event.category)) {
            score += 15;
            reasons.push('Similar to events you\'ve attended');
          }
        }

        // Score based on industry/company
        if (profile?.company && event.description) {
          const companyKeywords = profile.company.toLowerCase().split(' ');
          const matchingKeywords = companyKeywords.filter((keyword: string) =>
            event.description.toLowerCase().includes(keyword)
          );
          if (matchingKeywords.length > 0) {
            score += 8;
            reasons.push('Relevant to your industry');
          }
        }

        // Score based on location proximity
        if (profile?.location && event.venue_city) {
          const userCity = profile.location.split(',')[0].trim().toLowerCase();
          const eventCity = event.venue_city.toLowerCase();
          if (userCity === eventCity) {
            score += 12;
            reasons.push('In your city');
          }
        }

        // Score based on job title/role
        if (profile?.job_title && (event.name || event.description)) {
          const titleKeywords = profile.job_title.toLowerCase().split(' ');
          const matchingKeywords = titleKeywords.filter((keyword: string) =>
            event.name.toLowerCase().includes(keyword) ||
            event.description?.toLowerCase().includes(keyword)
          );
          if (matchingKeywords.length > 0) {
            score += 10;
            reasons.push('Relevant to your role');
          }
        }

        // Boost popular events from network
        const attendanceCount = event.event_attendances?.length || 0;
        if (attendanceCount > 0) {
          score += attendanceCount * 2;
          reasons.push(`${attendanceCount} people from your network are going`);
        }

        return {
          ...event,
          relevance_score: score,
          reason: reasons.join(' • ') || 'Recommended for you'
        };
      });

      // Filter and sort by relevance
      const topRecommendations = scoredEvents
        .filter(e => e.relevance_score > 0)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 6);

      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No personalized recommendations yet. Attend more events to get better suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on your interests, past events, and network activity
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((event) => (
            <div
              key={event.id}
              className="group relative rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => onEventClick?.(event.id)}
            >
              {event.image_url && (
                <div className="relative h-32 w-full overflow-hidden">
                  <OptimizedImage
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round(event.relevance_score)}%
                  </div>
                </div>
              )}
              <div className="p-3 space-y-2">
                <h4 className="font-semibold text-sm line-clamp-2">{event.name}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{event.venue_name}</span>
                  </div>
                )}
                <p className="text-xs text-primary line-clamp-2">{event.reason}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(event.url, '_blank');
                  }}
                >
                  View Event
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
