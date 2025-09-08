import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, MapPin, Building2, Calendar, Award, Send, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Resume } from "@/components/Resume";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "@/components/ProfileSetup";
import { useToast } from "@/hooks/use-toast";
import { SocialLink } from "@/components/SocialLink";
const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
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

  // Default work items (can be made dynamic later)
  const workItems = profile?.featured_work || [
    {
      id: 1,
      title: "Dam Chair",
      description: "AI-designed sustainable furniture piece",
      image: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png",
      category: "Furniture Design"
    },
    {
      id: 2,
      title: "Republic 2.0",
      description: "Digital art installation reimagining Plato's Republic",
      image: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png",
      category: "Digital Art"
    },
    {
      id: 3,
      title: "Roots Table",
      description: "Biomimetic table design inspired by root systems",
      image: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png",
      category: "Furniture Design"
    },
    {
      id: 4,
      title: "Storm Collection",
      description: "Weather-inspired architectural elements",
      image: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png",
      category: "Architecture"
    },
    {
      id: 5,
      title: "Lucid Series",
      description: "Transparent design exploration project",
      image: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png",
      category: "Conceptual Design"
    }
  ];
  
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      text: "Amazing work on the Dam Chair! The AI integration is revolutionary.",
      timestamp: "2 days ago"
    },
    {
      id: 2,
      author: "Michael Chen",
      text: "Love the sustainable design approach. Can't wait to see Republic 2.0 in museums!",
      timestamp: "1 week ago"
    }
  ]);

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        author: profile?.display_name || "Anonymous User",
        text: newComment,
        timestamp: "Just now"
      }]);
      setNewComment("");
    }
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
              onClick={() => setShowProfileSetup(true)}
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button variant="outline" className="shimmer bg-primary text-primary-foreground hover:bg-primary/90 border-primary hover:scale-105 transition-transform duration-200">
              Send Message
            </Button>
            <AnalyticsDashboard />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-8 relative z-10">
        {/* Profile Header */}
        <Card className="bg-card border-border p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-48 h-48 mx-auto md:mx-0 rounded-full border-4 border-primary overflow-hidden flex-shrink-0">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.display_name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold iridescent-text mb-2">
                  {profile.display_name || user.email}
                </h1>
                <p className="text-xl iridescent-text mb-4">
                  {profile.job_title || "Professional"}
                </p>
                <p className="text-muted-foreground iridescent-text leading-relaxed">
                  {profile.bio || "Welcome to my profile! I'm excited to connect and share my work with you."}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="iridescent-text">
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        {profile.bio && (
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-semibold iridescent-text mb-4">About</h2>
            <div className="space-y-4 text-muted-foreground iridescent-text">
              <p>{profile.bio}</p>
            </div>
          </Card>
        )}

        {/* Resume Section */}
        <Resume />
        
        {/* Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-semibold iridescent-text mb-6">Experience</h2>
            <div className="space-y-6">
              {profile.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-primary pl-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold iridescent-text">{exp.title}</h3>
                      <p className="text-primary iridescent-text">{exp.company}</p>
                      <p className="text-sm text-muted-foreground iridescent-text">
                        {exp.start_date} - {exp.end_date || 'Present'} • {exp.location}
                      </p>
                    </div>
                    <Award className="w-5 h-5 text-primary mt-1" />
                  </div>
                  {exp.description && (
                    <p className="text-muted-foreground mt-2 iridescent-text">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Work Portfolio Carousel */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-2xl font-semibold iridescent-text mb-6">Featured Work</h2>
          
          {workItems.length > 0 ? (
            <div className="relative overflow-hidden">
              {/* Mobile Carousel */}
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground iridescent-text">
                No featured work to display yet. Connect your profiles to showcase your work!
              </p>
            </div>
          )}
        </Card>

        {/* Social Links */}
        {profile.social_links && Object.keys(profile.social_links).length > 0 && (
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-semibold iridescent-text mb-4">Social Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => (
                <SocialLink
                  key={platform}
                  platform={platform}
                  title={linkData.label || platform}
                  url={linkData.url || linkData}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Skills & Interests */}
        {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
          <Card className="bg-card border-border p-6">
            <h2 className="text-2xl font-semibold iridescent-text mb-4">Skills & Interests</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.skills?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold iridescent-text mb-3">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-sm iridescent-text">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.interests?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold iridescent-text mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string) => (
                      <span key={interest} className="px-3 py-1 bg-secondary/60 border border-border rounded-full text-sm iridescent-text">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Endorsements Section */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-2xl font-semibold iridescent-text mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Endorsements
          </h2>
          
          {/* Add Comment */}
          <div className="space-y-4 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
              className="w-full p-3 bg-secondary/20 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
              rows={3}
            />
            <Button 
              onClick={handleAddComment}
              className="shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200"
            >
              <Send className="w-4 h-4 mr-2" />
              Post Comment
            </Button>
          </div>
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-secondary/20 border border-border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold iridescent-text">{comment.author}</h4>
                  <span className="text-xs text-muted-foreground iridescent-text">{comment.timestamp}</span>
                </div>
                <p className="text-muted-foreground iridescent-text">{comment.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;