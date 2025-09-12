import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { MapPin, Building2, ExternalLink, Mail, Phone, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SaveContactButton } from "@/components/SaveContactButton";
import { buildPublicUrl } from "@/lib/utils";
import ShareModal from "@/components/ShareModal";

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
  phone_number: string;
}

const PublicPing = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      console.log('Fetching profile for userId:', userId);
      
      // Use the secure RPC function for public access
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_public_profile_secure',
        { target_user_id: userId }
      );

      console.log('Profile data:', profileData);
      console.log('Profile error:', profileError);

      if (profileError) {
        console.error('Profile error:', profileError);
        setError("Profile not found");
        setLoading(false);
        return;
      }

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
        social_links: profile.social_links || {},
        phone_number: profile.phone_number || ''
      });

      // Fetch user email for contact using the secure function
      const { data: emailData, error: emailError } = await supabase.rpc(
        'get_user_email_for_contact',
        { target_user_id: userId }
      );

      console.log('Email data:', emailData);
      console.log('Email error:', emailError);

      if (!emailError && emailData) {
        setUserEmail(emailData);
      } else {
        setUserEmail('contact@pingapp.com'); // Fallback
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

  const displayName = (profile.display_name?.toLowerCase() === 'vgardner') ? 'Vaness Gardner' : (profile.display_name || 'User');

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Guest Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold iridescent-text">ping!</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => setShowShareModal(true)}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Link to="/signup">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Join ping!
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-28 space-y-6 relative z-10">
        {/* Simplified Profile Card - Matching internal profile exactly */}
        <div className="p-6 text-center">
          <div 
            className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => window.location.href = buildPublicUrl(`/ping/${userId}/details`)}
          >
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 
            className="text-3xl font-bold iridescent-text mb-2 cursor-pointer story-link animate-enter hover-scale transition-all duration-500 ease-out"
            onClick={() => window.location.href = buildPublicUrl(`/ping/${userId}/details`)}
          >
            {displayName}
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground iridescent-text mb-4">
            {profile.job_title || "Professional"}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="iridescent-text">{profile.location}</span>
              </div>
            )}
            {profile.company && (
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" />
                <span className="iridescent-text">{profile.company}</span>
              </div>
            )}
          </div>

          <Button 
            className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
            onClick={() => window.location.href = '/signup'}
          >
            Ping {displayName.split(' ')[0] || 'User'}
          </Button>
          
          <div className="mt-4">
            <SaveContactButton profile={profile} userEmail={userEmail} />
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 iridescent-text">
            Click name or photo to learn more
          </p>
        </div>

        {/* Connect & Learn More */}
        <div>
          <h2 className="text-2xl font-bold iridescent-text mb-6 text-center animate-fade-in">The new way of connecting</h2>
          
          <div className="space-y-3 animate-fade-in">
            {profile.phone_number && (
              <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium iridescent-text">Phone</p>
                      <p className="text-sm text-muted-foreground iridescent-text truncate">{profile.phone_number}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            {userEmail && (
              <Card className="bg-card border-border p-3 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium iridescent-text text-sm">Email</p>
                    <a 
                      href={`mailto:${userEmail}`}
                      className="text-sm text-muted-foreground iridescent-text truncate hover:text-primary transition-colors cursor-pointer block"
                    >
                      {userEmail}
                    </a>
                  </div>
                </div>
              </Card>
            )}
            {profile?.social_links && Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => {
              // Skip empty values
              if (!linkData || (typeof linkData === 'object' && !linkData.url) || (typeof linkData === 'string' && !linkData)) {
                return null;
              }
              
              const url = typeof linkData === 'string' ? linkData : linkData.url;
              
              return (
                <Card key={platform} className="bg-card border-border p-3 hover:border-primary/50 transition-colors">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {platform === 'linkedin' && <Building2 className="w-4 h-4 text-primary" />}
                      {platform === 'instagram' && <span className="text-primary font-bold text-xs">IG</span>}
                      {platform === 'twitter' && <span className="text-primary font-bold text-xs">X</span>}
                      {platform === 'venmo' && <span className="text-primary font-bold text-xs">V</span>}
                      {platform === 'website' && <ExternalLink className="w-4 h-4 text-primary" />}
                      {!['linkedin', 'instagram', 'twitter', 'venmo', 'website'].includes(platform) && <ExternalLink className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium iridescent-text text-sm capitalize">
                        {platform === 'linkedin' && 'LinkedIn'}
                        {platform === 'instagram' && 'Instagram'}
                        {platform === 'twitter' && 'Twitter/X'}
                        {platform === 'venmo' && 'Venmo'}
                        {platform === 'website' && 'Website'}
                        {!['linkedin', 'instagram', 'twitter', 'venmo', 'website'].includes(platform) && platform}
                      </p>
                      {platform === 'website' && (
                        <p className="text-xs text-muted-foreground iridescent-text truncate">
                          {url}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-primary flex-shrink-0" />
                  </a>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold iridescent-text mb-4 text-center">Skills</h3>
            <div className="flex flex-wrap gap-2 justify-center">
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
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold iridescent-text mb-4 text-center">Interests</h3>
            <div className="flex flex-wrap gap-2 justify-center">
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userId={userId || ''}
        displayName={displayName}
      />
    </div>
  );
};

export default PublicPing;