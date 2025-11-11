import { X, MapPin, Building2, Mail, Phone, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface FloatingProfilePreviewProps {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isLoadingBio?: boolean;
  position?: { top: number; left: number; preferRight?: boolean };
  onClose: () => void;
  onViewProfile: () => void;
  onMessage?: () => void;
}

export const FloatingProfilePreview = ({
  name,
  title,
  company,
  location,
  email,
  phone,
  avatarUrl,
  bio,
  isLoadingBio,
  position,
  onClose,
  onViewProfile,
  onMessage
}: FloatingProfilePreviewProps) => {
  // Position below the circle, centered horizontally
  const positionStyles = position 
    ? { 
        top: `${position.top + 60}px`, // Position 60px below the click point
        left: `${position.left}px`,
        transform: 'translateX(-50%)' // Center horizontally
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <Card 
      className="fixed w-[200px] max-w-[90vw] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/20 z-50 animate-scale-in"
      style={positionStyles}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-foreground z-10"
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="p-2 flex items-center gap-2">
        {/* Avatar */}
        <Avatar className="h-8 w-8 border border-primary/30 shadow-sm flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        {/* Info section - compact */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-foreground truncate">{name}</h3>
          {title && (
            <p className="text-[10px] text-muted-foreground truncate">{title}</p>
          )}
          {location && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <Button
          onClick={onViewProfile}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 px-2 text-[10px] flex-shrink-0"
        >
          View
        </Button>
      </div>

      {/* Subtle gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
    </Card>
  );
};
