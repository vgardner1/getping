import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface EventModalProps {
  event: {
    id: string;
    name: string;
    description: string;
    start_date: string;
    venue_name: string | null;
    venue_city: string | null;
    venue_state: string | null;
    image_url: string | null;
    url: string;
    event_attendances?: Array<{ user_id: string }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onGoing: () => void;
  attendeeCount: number;
}

export function EventModal({ event, isOpen, onClose, onGoing, attendeeCount }: EventModalProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.name}</DialogTitle>
        </DialogHeader>
        
        {event.image_url && (
          <OptimizedImage 
            src={event.image_url} 
            alt={event.name}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-medium">When</p>
              <p className="text-sm text-muted-foreground">{formatDate(event.start_date)}</p>
            </div>
          </div>

          {event.venue_name && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {event.venue_name}
                  {event.venue_city && `, ${event.venue_city}`}
                  {event.venue_state && `, ${event.venue_state}`}
                </p>
              </div>
            </div>
          )}

          {attendeeCount > 0 && (
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Who's Going</p>
                <p className="text-sm text-muted-foreground">
                  {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} from your network
                </p>
              </div>
            </div>
          )}

          {event.description && (
            <div>
              <p className="font-medium mb-2">About</p>
              <p className="text-sm text-muted-foreground line-clamp-6">{event.description}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={onGoing} className="flex-1">
              I'm Going
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(event.url, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
