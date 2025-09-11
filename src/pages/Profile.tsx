import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, MapPin, Building2, Edit, BarChart3, ExternalLink, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "@/components/ProfileSetup";
import { ProfileEdit } from "@/components/ProfileEdit";
import { useToast } from "@/hooks/use-toast";
import { SaveContactButton } from "@/components/SaveContactButton";
import { ChatSystem } from "@/components/ChatSystem";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Redirect if not authenticated - but only after loading is complete and we're sure there's no user
  useEffect(() => {
    if (!loading && !user) {
      // Add a small delay to ensure session is fully resolved
      const timer = setTimeout(() => {
        if (!user) {
          navigate('/auth');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, show profile setup
        if (error.code === 'PGRST116') {
          setShowProfileSetup(true);
        }
      } else {
        setProfile(data);
        // If profile exists but not AI processed, might want to show setup
        if (!data.display_name || !data.bio) {
          setShowProfileSetup(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    fetchProfile(); // Reload profile data
  };

  const handleProfileEditSave = () => {
    setShowProfileEdit(false);
    fetchProfile(); // Reload profile data
  };

  const handleProfileEditCancel = () => {
    setShowProfileEdit(false);
  };

  // Show loading state
  if (loading || profileLoading) {
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

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background relative">
        <StarField />
        <div className="max-w-4xl mx-auto p-6 relative z-10">
          <ProfileSetup onComplete={handleProfileSetupComplete} />
        </div>
      </div>
    );
  }

  // Show profile edit if requested
  if (showProfileEdit) {
    return (
      <div className="min-h-screen bg-background relative">
        <StarField />
        <div className="relative z-10">
          <ProfileEdit 
            profile={profile} 
            onSave={handleProfileEditSave} 
            onCancel={handleProfileEditCancel} 
          />
        </div>
      </div>
    );
  }

  // Show analytics if requested
  if (showAnalytics) {
    return (
      <div className="min-h-screen bg-background relative">
        <StarField />
        
        {/* Header */}
        <header className="border-b border-border p-4 relative z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
              onClick={() => setShowAnalytics(false)}
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold iridescent-text">Back to Profile</span>
            </Button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <AnalyticsDashboard />
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user || !profile) {
    return null;
  }

  const displayName = (profile.display_name?.toLowerCase() === 'vgardner') ? 'Vaness Gardner' : (profile.display_name || user.email);

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-2 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-2">
          <span className="text-lg font-bold iridescent-text">ping!</span>
          
          {/* Network in center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 rounded-full px-4 py-1.5 backdrop-blur-sm border border-primary/20 shadow-lg text-sm"
              onClick={() => navigate('/network')}
            >
              <span className="iridescent-text font-medium">Network</span>
            </Button>
          </div>
          
          {/* Right side icon bubbles */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 rounded-full w-8 h-8 backdrop-blur-sm border border-primary/20 shadow-lg"
              onClick={() => setShowProfileEdit(true)}
            >
              <Edit className="w-4 h-4 text-primary" />
            </Button>
            <Button 
              variant="ghost"
              size="icon" 
              className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 rounded-full w-8 h-8 backdrop-blur-sm border border-primary/20 shadow-lg"
              onClick={() => navigate('/profile/analytics')}
            >
              <BarChart3 className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-28 space-y-6 relative z-10">
        {/* Simplified Profile Card */}
        <div className="p-6 text-center">
          <div 
            className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/profile/details')}
          >
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 
            className="text-3xl font-bold iridescent-text mb-2 cursor-pointer story-link animate-enter hover-scale transition-all duration-500 ease-out"
            onClick={() => navigate('/profile/details')}
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

          
          <Button className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
            Ping {displayName.split(' ')[0] || 'User'}
          </Button>
          
          <div className="mt-4">
            <SaveContactButton profile={profile} userEmail={user.email || ''} />
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
            {user.email && (
              <Card className="bg-card border-border p-3 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium iridescent-text text-sm">Email</p>
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-sm text-muted-foreground iridescent-text truncate hover:text-primary transition-colors cursor-pointer block"
                    >
                      {user.email}
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
      </main>
      
      {/* Chat System */}
      <ChatSystem 
        targetUserId={profile.user_id} 
        targetProfile={{
          user_id: profile.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url
        }} 
      />
    </div>
  );
};

export default Profile;