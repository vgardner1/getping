import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { MapPin, Building2, ExternalLink, Mail, Phone, ArrowLeft } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SaveContactButton } from "@/components/SaveContactButton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createChatWithUser } from "@/utils/chatUtils";
import { useConnections } from "@/hooks/useConnections";

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
  phone_number?: string;
  skills?: string[];
  interests?: string[];
  social_links?: any;
}

const normalizeUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

const PublicProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, loading: connectionLoading, checkConnection, removeConnection } = useConnections();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const trackProfileView = async () => {
    if (!userId) return;
    
    try {
      const viewerIp = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      await supabase
        .from('profile_views')
        .insert({
          profile_user_id: userId,
          viewer_user_id: user?.id || null,
          viewer_ip: viewerIp,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
    } catch (error) {
      // Silent fail for tracking - don't block profile loading
      console.warn('Profile view tracking failed:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
      if (user) {
        checkConnection(userId);
      }
    }
  }, [userId, user]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      
      // Track profile view first
      await trackProfileView();
      
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

      // Get contact info (phone + email) using secure function
      // Only returns data if user is connected or viewing own profile
      const { data: contactData, error: contactError } = await supabase.rpc(
        'get_user_contact_secure',
        { target_user_id: userId }
      );

      if (!contactError && contactData && contactData.length > 0) {
        setUserEmail(contactData[0].email || '');
        // Update phone number in profile if returned
        if (contactData[0].phone_number) {
          setProfile(prev => prev ? { ...prev, phone_number: contactData[0].phone_number } : null);
        }
      }

    } catch (error: any) {
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

  const handlePing = async () => {
    if (!user) {
      navigate('/signup');
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

  const handleRemoveFromTribe = async () => {
    if (!userId) return;
    
    const success = await removeConnection(userId);
    if (success) {
      // Optionally navigate back or update UI
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

  const displayName = profile.display_name || 'User';

  // Ensure phone number availability for display and contact card
  const linkPhone = typeof (profile.social_links as any)?.phone === 'string'
    ? (profile.social_links as any).phone
    : (profile.social_links as any)?.phone?.url;
  const phoneNumber = String(profile.phone_number || linkPhone || '').trim();

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(user ? '/profile' : '/')}
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            aria-label="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">ping!</span>
          </button>
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
              {user && user.id !== userId && (
                <div className="flex gap-3 w-full max-w-xs">
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handlePing}
                    disabled={creatingChat}
                  >
                    {creatingChat ? 'Starting chat...' : `ping! ${displayName.split(' ')[0] || 'User'}`}
                  </Button>
                  
                  {isConnected && (
                    <Button 
                      variant="outline"
                      onClick={handleRemoveFromTribe}
                      disabled={connectionLoading}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {connectionLoading ? 'Removing...' : 'Remove'}
                    </Button>
                  )}
                </div>
              )}
              
              {!user && (
                <Button 
                  className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate('/signup')}
                >
                  Join ping! to connect
                </Button>
              )}
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
                <SaveContactButton profile={profile} userEmail={userEmail} />
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold iridescent-text mb-6 text-center">Contact Information</h2>
            
            <div className="space-y-4">
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
              
              {phoneNumber && (
                <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium iridescent-text">Phone</p>
                        <a 
                          href={`tel:${phoneNumber}`}
                          className="text-sm text-muted-foreground iridescent-text hover:text-primary transition-colors cursor-pointer"
                        >
                          {phoneNumber}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {profile.website_url && (
                <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                  <a 
                    href={normalizeUrl(profile.website_url!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium iridescent-text">Website</p>
                        <p className="text-sm text-muted-foreground iridescent-text truncate hover:text-primary transition-colors">
                          {profile.website_url}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </a>
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
                  
                  const rawUrl = typeof linkData === 'string' ? linkData : linkData.url;
                  const url = normalizeUrl(rawUrl);
                  
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
                            {platform === 'website' && <ExternalLink className="w-5 h-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium iridescent-text capitalize">
                              {platform === 'linkedin' && 'LinkedIn'}
                              {platform === 'instagram' && 'Instagram'}
                              {platform === 'twitter' && 'Twitter/X'}
                              {platform === 'venmo' && 'Venmo'}
                              {platform === 'website' && 'Website'}
                               {!['linkedin', 'instagram', 'twitter', 'venmo', 'website'].includes(platform) && platform}
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

        {/* Join CTA for non-signed in users */}
        {!user && (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <Card className="bg-card border-border p-6 text-center">
                <h3 className="text-xl font-bold iridescent-text mb-2">Want to connect with {displayName}?</h3>
                <p className="text-muted-foreground iridescent-text mb-4">
                  Get ping! to unlock instant networking
                </p>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Join ping!
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProfile;