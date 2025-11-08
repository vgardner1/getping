import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Building2, Mail, Phone, Briefcase, X, MessageCircle } from 'lucide-react';

interface FloatingProfilePopupProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  job_title?: string;
  website_url?: string;
  phone_number?: string;
  skills?: string[];
  interests?: string[];
  social_links?: any;
}

export const FloatingProfilePopup = ({ userId, isOpen, onClose }: FloatingProfilePopupProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (userId && isOpen) {
      loadProfile();
    }
  }, [userId, isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get public profile using the secure RPC function
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_public_profile_secure',
        { target_user_id: userId }
      );

      if (profileError) throw profileError;

      if (profileData && profileData.length > 0) {
        const data = profileData[0];
        setProfile(data);
        // Email is not in public profile for privacy
        setUserEmail('');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:left-auto md:right-[10%] md:translate-x-0 z-50 w-[90%] max-w-[400px] animate-scale-in">
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-background/40 via-primary/5 to-background/40 backdrop-blur-2xl shadow-2xl">
        {/* Glossy refractor effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(74,222,128,0.1),transparent_50%)] pointer-events-none" />
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 hover:bg-primary/20 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="relative p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : profile ? (
            <>
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="h-24 w-24 border-2 border-primary/50 shadow-lg shadow-primary/20">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                  <AvatarFallback className="bg-primary/20 text-2xl">
                    {profile.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {profile.display_name || 'User'}
                  </h2>
                  {profile.job_title && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Briefcase className="h-3 w-3" />
                      {profile.job_title}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-muted-foreground text-center px-2">{profile.bio}</p>
              )}

              {/* Info Grid */}
              <div className="space-y-2 text-sm">
                {profile.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {userEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-primary uppercase">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 hover:bg-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-primary uppercase">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.slice(0, 6).map((interest, index) => (
                      <Badge key={index} variant="outline" className="border-primary/30">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex justify-center gap-3 pt-2">
                  {Object.entries(profile.social_links).map(([platform, url]) => {
                    if (!url) return null;
                    const Icon = platform === 'linkedin' ? Mail : Mail; // Simplified for now
                    return (
                      <a 
                        key={platform}
                        href={typeof url === 'string' ? url : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-primary/20 hover:bg-primary/30 backdrop-blur">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  className="backdrop-blur border-primary/30"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Profile not found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
