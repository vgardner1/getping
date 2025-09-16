import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { MapPin, Building2, ExternalLink, Mail, Phone, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SaveContactButton } from "@/components/SaveContactButton";
import { getShareableUrl } from "@/lib/environment";
import ShareModal from "@/components/ShareModal";
import { useAuth } from "@/hooks/useAuth";
import { createChatWithUser } from "@/utils/chatUtils";
import { useToast } from "@/hooks/use-toast";

interface PublicProfile {
  user_id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  company: string;
  job_title: string;
  website_url: string;
  phone_number?: string;
  skills: string[];
  interests: string[];
  social_links: any;
}


// Normalize URLs so external links don't route internally
const normalizeUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

const PublicPing = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      console.log('Fetching profile for userId:', userId);
      console.log('Current URL:', window.location.href);
      console.log('Is production:', !window.location.pathname.includes('/sandbox/'));
      
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
        phone_number: profile.phone_number,
        skills: profile.skills || [],
        interests: profile.interests || [],
        social_links: profile.social_links || {}
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

  const handlePing = async () => {
    if (!user) {
      if (userId) {
        try {
          localStorage.setItem('postLoginIntent', JSON.stringify({ type: 'ping', targetUserId: userId }));
        } catch {}
      }
      navigate('/auth');
      return;
    }

    if (!userId) return;

    // Prevent pinging yourself
    if (user.id === userId) {
      toast({
        title: "Cannot ping yourself",
        description: "You can't start a conversation with yourself!",
        variant: "destructive"
      });
      return;
    }

    setCreatingChat(true);
    try {
      console.log('Creating chat with user:', userId);
      
      const conversationId = await createChatWithUser(userId, user.id);
      
      if (!conversationId) {
        throw new Error('No conversation ID returned');
      }

      toast({
        title: "ping! successful!",
        description: `Connected with ${profile?.display_name || 'user'}. They've been added to your tribe!`,
      });

      // Navigate to the chat
      navigate(`/chat/${conversationId}?to=${userId}`);
      
    } catch (error) {
      console.error('Error creating chat:', error);
      
      // More specific error messages
      let errorMessage = "Failed to start conversation. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = "Conversation already exists. Redirecting...";
        } else if (error.message.includes('not found')) {
          errorMessage = "User not found. Please try again.";
        }
      }
      
      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCreatingChat(false);
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

  const displayName = profile.display_name || 'User';

  // Ensure phone number availability for display and contact card
  const linkPhone = typeof (profile.social_links as any)?.phone === 'string'
    ? (profile.social_links as any).phone
    : (profile.social_links as any)?.phone?.url;
  const phoneNumber = String((profile as any).phone_number || linkPhone || '').trim();

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Guest Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(user ? '/profile' : '/')}
            className="text-xl font-bold iridescent-text hover:scale-105 transition-transform duration-200"
          >
            ping!
          </button>
          <div className="flex items-center gap-2">
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
            onClick={() => window.location.href = getShareableUrl(`/ping/${userId}/details`)}
          >
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 
            className="text-3xl font-bold iridescent-text mb-2 cursor-pointer story-link animate-enter hover-scale transition-all duration-500 ease-out"
            onClick={() => window.location.href = getShareableUrl(`/ping/${userId}/details`)}
          >
            {displayName}
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground iridescent-text mb-2">
            {profile.job_title || "Professional"}
          </p>
          
          <p className="text-xs text-muted-foreground mb-4 iridescent-text">
            Click name or photo to learn more
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
            onClick={handlePing}
            disabled={creatingChat}
          >
            {creatingChat ? 'Starting chat...' : `ping! ${displayName.split(' ')[0] || 'User'}`}
          </Button>
          
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
            <SaveContactButton profile={profile} userEmail={userEmail} />
          </div>
        </div>

        {/* Connect & Learn More */}
        <div>
          <h2 className="text-2xl font-bold iridescent-text mb-6 text-center animate-fade-in">The new way of connecting</h2>
          
          <div className="space-y-3 animate-fade-in">
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
            {phoneNumber && (
              <Card className="bg-card border-border p-3 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium iridescent-text text-sm">Phone</p>
                    <a 
                      href={`tel:${phoneNumber}`}
                      className="text-sm text-muted-foreground iridescent-text hover:text-primary transition-colors cursor-pointer block"
                    >
                      {phoneNumber}
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
              
              const rawUrl = typeof linkData === 'string' ? linkData : linkData.url;
              const url = normalizeUrl(rawUrl);
              
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

        {/* Share Profile Button */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/10" 
            onClick={() => setShowShareModal(true)}
          >
            <Share2 className="w-4 h-4 mr-2" /> Share Profile
          </Button>
        </div>

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
          <div className="flex flex-col gap-3 items-center">
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started - Free Trial
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground iridescent-text">
              Already have an account?{' '}
              <button
                onClick={() => {
                  if (userId) {
                    try { localStorage.setItem('postLoginIntent', JSON.stringify({ type: 'ping', targetUserId: userId })); } catch {}
                  }
                  navigate('/auth');
                }}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
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