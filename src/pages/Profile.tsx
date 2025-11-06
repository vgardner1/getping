import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, MapPin, Building2, Edit, BarChart3, ExternalLink, Mail, Phone, Search, UserPlus, Share2, FileText, Download, Eye, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "@/components/ProfileSetup";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ProfileEdit } from "@/components/ProfileEdit";
import { useToast } from "@/hooks/use-toast";
import { SaveContactButton } from "@/components/SaveContactButton";
import GlobalSearch from "@/components/GlobalSearch";
import SMSModal from "@/components/SMSModal";
import ShareModal from "@/components/ShareModal";
import { getPublicProfileUrl, isProduction } from "@/lib/environment";
import { ContactSyncButton } from "@/components/ContactSyncButton";

// Normalize URLs to ensure external links open correctly
const normalizeUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};
const Profile = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Redirect if not authenticated - but only after loading is complete
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnreadMessageCount();
    }
  }, [user]);
  const fetchProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('user_id', user?.id).single();
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, show profile setup
        if (error.code === 'PGRST116') {
          setShowProfileSetup(true);
        }
      } else {
        // For the user's own profile, also fetch contact info securely
        let contactInfo = null;
        if (user?.id) {
          try {
            const {
              data: contactData,
              error: contactError
            } = await supabase.rpc('get_profile_contact_info', {
              target_user_id: user.id
            });
            if (!contactError && contactData && contactData.length > 0) {
              contactInfo = contactData[0];
            }
          } catch (e) {
            console.warn('Could not fetch contact info:', e);
          }
        }

        // Merge profile data with contact info
        setProfile({
          ...data,
          phone_number: contactInfo?.phone_number || null,
          email: contactInfo?.email || user?.email || null,
          contact_social_links: contactInfo?.contact_social_links || null
        });

        // Only show setup if profile is completely empty
        if (!data.display_name && !data.bio && !data.job_title && !data.avatar_url) {
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

  const fetchUnreadMessageCount = async () => {
    if (!user) return;
    try {
      // Get last read timestamps from localStorage
      const lastReadKey = `lastRead_${user.id}`;
      const lastReadStr = localStorage.getItem(lastReadKey);
      const lastRead = lastReadStr ? new Date(lastReadStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get all conversations for the user
      const { data: conversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      
      if (conversations && conversations.length > 0) {
        // Count unread messages since last read
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversations.map(c => c.conversation_id))
          .neq('sender_id', user.id)
          .gte('created_at', lastRead.toISOString());
        
        setUnreadMessageCount(count || 0);
      }
    } catch (error) {
      console.warn('Could not fetch unread message count:', error);
    }
  };

  const markMessagesAsRead = () => {
    if (!user) return;
    const lastReadKey = `lastRead_${user.id}`;
    localStorage.setItem(lastReadKey, new Date().toISOString());
    setUnreadMessageCount(0);
  };

  const downloadResume = () => {
    if (profile?.resume_url) {
      const link = document.createElement('a');
      link.href = profile.resume_url;
      link.download = profile.resume_filename || 'resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Resume Downloaded",
        description: "Resume has been saved to your device."
      });
    }
  };

  const viewResume = () => {
    if (profile?.resume_url) {
      // Use anchor tag to avoid popup blockers
      const link = document.createElement('a');
      link.href = profile.resume_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Show loading state
  if (loading || profileLoading) {
    return <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="iridescent-text">Loading profile...</p>
        </div>
      </div>;
  }

  // Show profile setup if needed
  if (showProfileSetup) {
    return <div className="min-h-screen bg-background relative">
        <StarField />
        <div className="max-w-4xl mx-auto p-6 relative z-10">
          <ProfileSetup onComplete={handleProfileSetupComplete} />
        </div>
      </div>;
  }

  // Show profile edit if requested
  if (showProfileEdit) {
    return <div className="min-h-screen bg-background relative">
        <StarField />
        <div className="relative z-10">
          <ProfileEdit profile={profile} onSave={handleProfileEditSave} onCancel={handleProfileEditCancel} onLogout={() => navigate('/auth')} />
        </div>
      </div>;
  }

  // Show analytics if requested
  if (showAnalytics) {
    return <div className="min-h-screen bg-background relative">
        <StarField />
        
        {/* Header */}
        <header className="border-b border-border p-4 relative z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="ghost" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200" onClick={() => setShowAnalytics(false)}>
              <ArrowLeft className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold iridescent-text">Back to Profile</span>
            </Button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <AnalyticsDashboard />
        </div>
      </div>;
  }

  // Don't render if no user
  if (!user || !profile) {
    return null;
  }
  const displayName = profile.display_name || user.email;
  console.log('Profile data:', {
    profile,
    displayName,
    userEmail: user.email
  });
  return <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-2 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-2">
          <span className="text-lg font-bold iridescent-text">ping!</span>
          
          {/* Network in center with search */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Button variant="ghost" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 rounded-full px-4 py-1.5 backdrop-blur-sm border border-primary/20 shadow-lg text-sm relative" onClick={() => navigate('/network/visualize')}>
              <Search className="w-4 h-4 text-primary" />
              <span className="iridescent-text font-medium">Find Your Tribe</span>
              {unreadMessageCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              )}
            </Button>
          </div>
          
          {/* Right side icon bubbles */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 rounded-full w-10 h-10 backdrop-blur-sm border border-primary/20 shadow-lg" onClick={() => setShowProfileEdit(true)}>
              <Edit className="w-5 h-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 rounded-full w-10 h-10 backdrop-blur-sm border border-primary/20 shadow-lg" onClick={() => navigate('/profile/analytics')}>
              <BarChart3 className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-28 space-y-6 relative z-10">
        {/* Simplified Profile Card */}
        <div className="p-6 text-center">
          <Link to="/profile/details" aria-label="View profile details" className="block w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6 hover:scale-105 transition-transform duration-200">
            <OptimizedImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name || "Profile"} className="w-full h-full" priority={true} />
          </Link>
          
          <Link to="/profile/details" className="block">
            <h1 className="text-3xl font-bold iridescent-text mb-2 cursor-pointer hover:scale-105 transition-transform duration-200">
              {displayName}
            </h1>
          </Link>
          
          <p className="text-base md:text-lg text-muted-foreground iridescent-text mb-2">
            {profile.job_title || "Professional"}
          </p>
          
          
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-2">
            {profile.location && <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="iridescent-text">{profile.location}</span>
              </div>}
            {profile.company && <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" />
                <span className="iridescent-text">{profile.company}</span>
              </div>}
          </div>

          <p className="text-xs text-muted-foreground mb-4 iridescent-text">
            click name or photo to learn more
          </p>

          <Button className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" onClick={() => {
            markMessagesAsRead();
            navigate('/chat');
          }}>
            ping! {displayName.split(' ')[0] || 'user'}
          </Button>
          
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm w-full max-w-xs mx-auto">
            <SaveContactButton profile={profile} userEmail={user.email || ''} />
          </div>
        </div>

        {/* Connect & Learn More */}
        <div>
          <h2 className="text-2xl font-bold iridescent-text mb-6 text-center animate-fade-in">The new way of connecting</h2>
          
          <div className="space-y-3 animate-fade-in">
            {profile.phone_number && <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium iridescent-text">Phone</p>
                      <p className="text-sm text-muted-foreground iridescent-text truncate">{profile.phone_number}</p>
                    </div>
                  </div>
                </div>
              </Card>}
            {user.email && <Card className="bg-card border-border p-3 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium iridescent-text text-sm">Email</p>
                    <a href={`mailto:${user.email}`} className="text-sm text-muted-foreground iridescent-text truncate hover:text-primary transition-colors cursor-pointer block">
                      {user.email}
                    </a>
                  </div>
                </div>
              </Card>}
            {profile?.social_links && Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => {
            // Skip empty values
            if (!linkData || typeof linkData === 'object' && !linkData.url || typeof linkData === 'string' && !linkData) {
              return null;
            }
            const rawUrl = typeof linkData === 'string' ? linkData : linkData.url;
            const url = normalizeUrl(rawUrl);
            return <Card key={platform} className="bg-card border-border p-3 hover:border-primary/50 transition-colors">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full">
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
                      {platform === 'website' && <p className="text-xs text-muted-foreground iridescent-text truncate">
                          {url}
                        </p>}
                    </div>
                    <ExternalLink className="w-3 h-3 text-primary flex-shrink-0" />
                  </a>
                </Card>;
          })}
          </div>
        </div>

        {/* Share Profile Button - Bottom of page */}
        <div className="mt-8 flex flex-col items-center space-y-3">
          <Button 
            variant="default" 
            className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={() => navigate('/events')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            See upcoming events
          </Button>
          
          <Button variant="outline" className="w-full max-w-sm border-primary text-primary hover:bg-primary/10" onClick={() => setShowShareModal(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share my ping! profile
          </Button>
          <Button variant="outline" className="w-full max-w-sm border-primary/50 text-primary hover:bg-primary/5 flex items-center justify-center gap-2" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4" />
            Invite a friend for 1 month free
          </Button>
          
          <div className="w-full max-w-sm">
            <ContactSyncButton />
          </div>
        </div>
      </main>
      
      
      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} userId={user.id} displayName={displayName} />
      
      {/* Invite Friend Modal */}
      <SMSModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} userProfile={profile} isInvite={true} />
      
      {/* Global Search */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>;
};
export default Profile;