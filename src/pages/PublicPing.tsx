import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { MapPin, Building2, ExternalLink, Mail, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SaveContactButton } from "@/components/SaveContactButton";

interface PublicProfile {
  user_id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  company: string;
  job_title: string;
  website_url: string;
  skills: string[];
  interests: string[];
  social_links: any;
}

const PublicPing = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      // Fetch public profile data
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_public_profile_secure', { target_user_id: userId });

      if (profileError) throw profileError;

      if (!profileData || profileData.length === 0) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      const profile = profileData[0];
      setProfile({
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        job_title: profile.job_title,
        website_url: profile.website_url,
        skills: profile.skills || [],
        interests: profile.interests || [],
        social_links: (profile as any).social_links || {}
      });

      // Fetch user email for contact
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_email_for_contact', { target_user_id: userId });

      if (!emailError && emailData) {
        setUserEmail(emailData);
      }
    } catch (error) {
      console.error('Error fetching public profile:', error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10 max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold iridescent-text mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground iridescent-text mb-6">
            The profile you're looking for doesn't exist or has been made private.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Guest Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold iridescent-text">ping!</span>
          <Link to="/signup">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Join ping!
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6 pb-28 relative z-10">
        {/* Profile Header */}
        <Card className="bg-card border-border p-8 mb-6">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.display_name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-3xl font-bold iridescent-text mb-2">
              {profile.display_name}
            </h1>
            
            {profile.job_title && (
              <p className="text-lg text-muted-foreground iridescent-text mb-4">
                {profile.job_title}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
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
              <div className="bg-secondary/20 rounded-lg p-4 mb-6">
                <p className="text-muted-foreground iridescent-text text-left whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center mb-6">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Connect
              </Button>
              <SaveContactButton profile={profile} userEmail={userEmail} />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <div className="space-y-4 mb-6">
          {userEmail && (
            <Card className="bg-card border-border p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium iridescent-text">Email</p>
                  <a 
                    href={`mailto:${userEmail}`}
                    className="text-sm text-muted-foreground iridescent-text hover:text-primary transition-colors"
                  >
                    {userEmail}
                  </a>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Social Links */}
        {profile.social_links && Object.keys(profile.social_links).length > 0 && (
          <Card className="bg-card border-border p-6 mb-6">
            <h3 className="text-lg font-semibold iridescent-text mb-4">Connect with {profile.display_name}</h3>
            <div className="space-y-3">
              {Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => {
                if (!linkData || (typeof linkData === 'object' && !linkData.url) || (typeof linkData === 'string' && !linkData)) {
                  return null;
                }
                
                const url = typeof linkData === 'string' ? linkData : linkData.url;
                
                return (
                  <a 
                    key={platform}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {platform === 'linkedin' && <Building2 className="w-4 h-4 text-primary" />}
                      {platform === 'instagram' && <span className="text-primary font-bold text-xs">IG</span>}
                      {platform === 'twitter' && <span className="text-primary font-bold text-xs">X</span>}
                      {platform === 'website' && <ExternalLink className="w-4 h-4 text-primary" />}
                      {!['linkedin', 'instagram', 'twitter', 'website'].includes(platform) && <ExternalLink className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium iridescent-text capitalize">
                        {platform === 'linkedin' && 'LinkedIn'}
                        {platform === 'instagram' && 'Instagram'}
                        {platform === 'twitter' && 'Twitter/X'}
                        {platform === 'website' && 'Website'}
                        {!['linkedin', 'instagram', 'twitter', 'website'].includes(platform) && platform}
                      </p>
                      {platform === 'website' && (
                        <p className="text-xs text-muted-foreground iridescent-text">
                          {url}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </a>
                );
              })}
            </div>
          </Card>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="bg-card border-border p-6 mb-6">
            <h3 className="text-lg font-semibold iridescent-text mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="bg-card border-border p-6 mb-6">
            <h3 className="text-lg font-semibold iridescent-text mb-4">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary/20 text-muted-foreground rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="bg-card border-border p-6 text-center">
          <h3 className="text-xl font-bold iridescent-text mb-2">Ready to join ping!?</h3>
          <p className="text-muted-foreground iridescent-text mb-4">
            Get your own NFC ring and start networking instantly
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground iridescent-text">✨ 7 days completely free</p>
            <p className="text-sm text-muted-foreground iridescent-text">📱 Instant profile sharing</p>
            <p className="text-sm text-muted-foreground iridescent-text">🔗 Build your network</p>
          </div>
          <Link to="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started - Free Trial
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default PublicPing;