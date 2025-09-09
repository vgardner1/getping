import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, MapPin, Building2, Edit, BarChart3, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "@/components/ProfileSetup";
import { ProfileEdit } from "@/components/ProfileEdit";
import { ProfileDetailsModal } from "@/components/ProfileDetailsModal";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  
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

  // Default work items (can be made dynamic later)
  const workItems = profile?.featured_work || [
    {
      id: 1,
      title: "Creative Projects",
      description: "Showcase of innovative design work",
      image: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png",
      category: "Design"
    },
    {
      id: 2,
      title: "Digital Innovation",
      description: "Modern digital art and technology projects",
      image: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png",
      category: "Digital Art"
    },
    {
      id: 3,
      title: "Sustainable Design",
      description: "Eco-friendly and sustainable design solutions",
      image: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png",
      category: "Sustainability"
    },
    {
      id: 4,
      title: "Professional Work",
      description: "Transparent design exploration project",
      image: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png",
      category: "Conceptual Design"
    }
  ];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWorkIndex((prevIndex) => (prevIndex + 1) % workItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [workItems.length]);

  const nextWork = () => {
    setCurrentWorkIndex((prevIndex) => (prevIndex + 1) % workItems.length);
  };

  const prevWork = () => {
    setCurrentWorkIndex((prevIndex) => (prevIndex - 1 + workItems.length) % workItems.length);
  };

  const getWorkItemAtIndex = (index: number) => {
    if (workItems.length === 0) return null;
    return workItems[(index + workItems.length) % workItems.length];
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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
              onClick={() => setShowProfileEdit(true)}
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
              onClick={() => navigate('/profile/analytics')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-8 relative z-10">
        {/* Simplified Profile Card */}
        <Card className="bg-card border-border p-8 text-center">
          <div 
            className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setShowDetailsModal(true)}
          >
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 
            className="text-3xl font-bold iridescent-text mb-2 cursor-pointer hover:text-primary transition-colors duration-200"
            onClick={() => setShowDetailsModal(true)}
          >
            {profile.display_name || user.email}
          </h1>
          
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
          
          <Button className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground">
            Ping {profile.display_name?.split(' ')[0] || 'User'}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4 iridescent-text">
            Click name or photo to learn more
          </p>
        </Card>

        {/* Featured Work */}
        <div>
          <h2 className="text-2xl font-bold iridescent-text mb-6 text-center">Featured Work</h2>
          
          {workItems.length > 0 && (
            <div className="relative overflow-hidden">
              <div className="flex items-center justify-center relative">
                {/* Left Arrow */}
                <button
                  onClick={prevWork}
                  className="absolute left-2 z-10 p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>

                {/* Carousel Container */}
                <div className="w-full px-16">
                  <div className="flex items-center justify-center space-x-6">
                    {/* Left Side Item */}
                    {getWorkItemAtIndex(currentWorkIndex - 1) && (
                      <div className="w-20 h-24 opacity-60 transform scale-90 transition-all duration-500 overflow-hidden rounded-lg border border-border/50">
                        <img
                          src={getWorkItemAtIndex(currentWorkIndex - 1)?.image}
                          alt={getWorkItemAtIndex(currentWorkIndex - 1)?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Main Item */}
                    {getWorkItemAtIndex(currentWorkIndex) && (
                      <div className="w-44 h-56 flex-shrink-0 transform transition-all duration-500 hover:scale-105">
                        <div className="w-full h-full bg-card border-2 border-primary/30 rounded-xl overflow-hidden shimmer shadow-lg">
                          <div className="h-3/4 overflow-hidden">
                            <img
                              src={getWorkItemAtIndex(currentWorkIndex)?.image}
                              alt={getWorkItemAtIndex(currentWorkIndex)?.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                          </div>
                          <div className="p-3 h-1/4 flex flex-col justify-center bg-gradient-to-t from-background/80 to-transparent">
                            <h3 className="font-semibold text-sm iridescent-text truncate">
                              {getWorkItemAtIndex(currentWorkIndex)?.title}
                            </h3>
                            <p className="text-xs text-muted-foreground iridescent-text">
                              {getWorkItemAtIndex(currentWorkIndex)?.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Right Side Item */}
                    {getWorkItemAtIndex(currentWorkIndex + 1) && (
                      <div className="w-20 h-24 opacity-60 transform scale-90 transition-all duration-500 overflow-hidden rounded-lg border border-border/50">
                        <img
                          src={getWorkItemAtIndex(currentWorkIndex + 1)?.image}
                          alt={getWorkItemAtIndex(currentWorkIndex + 1)?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={nextWork}
                  className="absolute right-2 z-10 p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {workItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentWorkIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentWorkIndex
                        ? 'bg-primary scale-125'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Work Description */}
              {getWorkItemAtIndex(currentWorkIndex) && (
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-semibold iridescent-text mb-2">
                    {getWorkItemAtIndex(currentWorkIndex)?.title}
                  </h3>
                  <p className="text-muted-foreground iridescent-text text-sm">
                    {getWorkItemAtIndex(currentWorkIndex)?.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connect & Learn More */}
        <div>
          <h2 className="text-2xl font-bold iridescent-text mb-6 text-center">Connect & Learn More</h2>
          
          <div className="space-y-4">
            {profile?.social_links && Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => {
              // Skip empty values
              if (!linkData || (typeof linkData === 'object' && !linkData.url) || (typeof linkData === 'string' && !linkData)) {
                return null;
              }
              
              return (
                <Card key={platform} className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
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
                          {platform === 'linkedin' && 'LinkedIn - Connect with me'}
                          {platform === 'instagram' && 'Instagram - Behind the scenes'}
                          {platform === 'twitter' && 'Twitter/X - Follow my updates'}
                          {platform === 'venmo' && 'Venmo - Send payment'}
                          {!['linkedin', 'instagram', 'twitter', 'venmo'].includes(platform) && `${platform} - Connect with me`}
                        </p>
                        <p className="text-sm text-muted-foreground iridescent-text truncate">
                          {typeof linkData === 'string' ? linkData : linkData.url}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              );
            })}
            
            {(!profile?.social_links || Object.keys(profile.social_links).filter(key => profile.social_links[key]).length === 0) && (
              <Card className="bg-card border-border p-6 text-center">
                <p className="text-muted-foreground iridescent-text">
                  No social links added yet. Complete your profile setup to add social connections.
                </p>
                <Button 
                  onClick={() => setShowProfileSetup(true)}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Complete Profile Setup
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate('/learn-more')}
          >
            Learn More About Ping
          </Button>
          <p className="text-sm text-muted-foreground iridescent-text">
            Buy your ping now - $9.99
          </p>
        </div>
      </main>

      {/* Profile Details Modal */}
      <ProfileDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        profile={profile}
      />
    </div>
  );
};

export default Profile;