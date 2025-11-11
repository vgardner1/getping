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
  // Position to the left or right of the circle, not covering it
  const positionStyles = position 
    ? { 
        top: `${position.top}px`, 
        left: `${position.left}px`, 
        transform: position.preferRight 
          ? 'translate(80px, -50%)' // Position to the right
          : 'translate(calc(-100% - 80px), -50%)' // Position to the left
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <Card 
      className="fixed w-[280px] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/20 z-50 animate-scale-in"
      style={positionStyles}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground z-10"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="p-4 space-y-3">
        {/* Avatar and name section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg shadow-primary/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">{name}</h3>
            {title && (
              <p className="text-xs text-muted-foreground font-medium">{title}</p>
            )}
          </div>
        </div>

        {/* Contact info section */}
        <div className="space-y-1.5 pt-1">
          {company && (
            <div className="flex items-center gap-2 text-xs">
              <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground">{company}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground">{location}</span>
            </div>
          )}

          {email && (
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground truncate">{email}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground">{phone}</span>
            </div>
          )}
        </div>

        {/* AI-generated bio */}
        {(bio || isLoadingBio) && (
          <div className="pt-2 border-t border-border/50">
            {isLoadingBio ? (
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-4/5" />
              </div>
            ) : (
              <div className="flex gap-1.5 items-start">
                <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground italic leading-relaxed">{bio}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={onViewProfile}
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs"
          >
            View Profile
          </Button>
          {onMessage && (
            <Button
              onClick={onMessage}
              variant="outline"
              size="sm"
              className="flex-1 border-primary/30 hover:bg-primary/10 text-xs"
            >
              Message
            </Button>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
    </Card>
  );
};
