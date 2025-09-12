import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { MapPin, Building2, ExternalLink, Mail, Phone, ArrowLeft } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SaveContactButton } from "@/components/SaveContactButton";
import { useToast } from "@/hooks/use-toast";

interface PublicProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  job_title?: string;
  website_url?: string;
  skills?: string[];
  interests?: string[];
  social_links?: any;
  phone_number?: string;
}

const PublicProfile = () => {
  const { userId } = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      
      // Get public profile data using the secure function
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_public_profile_secure',
        { target_user_id: userId }
      );

      if (profileError) throw profileError;

      if (!profileData || profileData.length === 0) {
        setError('Profile not found');
        return;
      }

      setProfile(profileData[0]);

      // Get user email for contact saving
      const { data: emailData, error: emailError } = await supabase.rpc(
        'get_user_email_for_contact',
        { target_user_id: userId }
      );

      if (!emailError && emailData) {
        setUserEmail(emailData);
      } else {
        setUserEmail('contact@pingapp.com'); // Fallback
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="iridescent-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-destructive mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist or isn't publicly available.
          </p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = (profile.display_name?.toLowerCase() === 'vgardner') ? 'Vaness Gardner' : (profile.display_name || 'User');

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">ping!</span>
          </Link>
          <div className="text-sm text-muted-foreground iridescent-text">
            Public Profile
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-8 relative z-10">
        {/* Profile Card */}
        <div className="flex justify-center">
          <Card className="bg-card border-border p-8 text-center w-full max-w-2xl">
            <Link to={`/ping/${userId}/details`} className="block">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.display_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            
            <Link to={`/ping/${userId}/details`} className="block hover:scale-105 transition-transform duration-200">
              <h1 className="text-3xl font-bold iridescent-text mb-2 cursor-pointer">
                {displayName}
              </h1>
            </Link>
            
            <p className="text-lg text-muted-foreground iridescent-text mb-4">
              {profile.job_title || "Professional"}
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="iridescent-text">{profile.location}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="iridescent-text">{profile.company}</span>
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto iridescent-text">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-col items-center gap-3">
              <Button className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                Connect with {displayName.split(' ')[0] || 'User'}
              </Button>
              
              <SaveContactButton profile={profile} userEmail={userEmail} />
            </div>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold iridescent-text mb-6 text-center">Contact Information</h2>
            
            <div className="space-y-4">
              {profile.phone_number && (
                <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium iridescent-text">Phone</p>
                        <a 
                          href={`tel:${profile.phone_number}`}
                          className="text-sm text-muted-foreground iridescent-text truncate hover:text-primary transition-colors cursor-pointer"
                        >
                          {profile.phone_number}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              {userEmail && (
                <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium iridescent-text">Email</p>
                        <a 
                          href={`mailto:${userEmail}`}
                          className="text-sm text-muted-foreground iridescent-text truncate hover:text-primary transition-colors cursor-pointer"
                        >
                          {userEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <h2 className="text-2xl font-bold iridescent-text mb-6 text-center">Connect on Social</h2>
              
              <div className="space-y-4">
                {Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => {
                  // Skip empty values
                  if (!linkData || (typeof linkData === 'object' && !linkData.url) || (typeof linkData === 'string' && !linkData)) {
                    return null;
                  }
                  
                  const url = typeof linkData === 'string' ? linkData : linkData.url;
                  
                  return (
                    <Card key={platform} className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {platform === 'linkedin' && <Building2 className="w-5 h-5 text-primary" />}
                            {platform === 'instagram' && <span className="text-primary font-bold">IG</span>}
                            {platform === 'twitter' && <span className="text-primary font-bold">X</span>}
                            {platform === 'venmo' && <span className="text-primary font-bold">V</span>}
                            {!['linkedin', 'instagram', 'twitter', 'venmo'].includes(platform) && <ExternalLink className="w-5 h-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium iridescent-text capitalize">
                              {platform === 'linkedin' && 'LinkedIn'}
                              {platform === 'instagram' && 'Instagram'}
                              {platform === 'twitter' && 'Twitter/X'}
                              {platform === 'venmo' && 'Venmo'}
                              {!['linkedin', 'instagram', 'twitter', 'venmo'].includes(platform) && platform}
                            </p>
                            <p className="text-sm text-muted-foreground iridescent-text truncate">
                              {url}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </a>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProfile;