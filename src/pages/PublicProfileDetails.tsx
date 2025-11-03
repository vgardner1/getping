import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { ArrowLeft, MapPin, Building2, ExternalLink, Calendar, Award, MessageSquare, FileText, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useConnections } from "@/hooks/useConnections";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResumeViewer } from "@/components/ResumeViewer";
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
  experience?: any[];
  featured_work?: any[];
  resume_url?: string;
  resume_filename?: string;
}

const PublicProfileDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected, loading: connectionLoading, checkConnection, removeConnection } = useConnections();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResume, setShowResume] = useState(false);
  
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
      // Track profile view first
      await trackProfileView();
      // Use SECURITY DEFINER RPC for anonymous public access
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_public_profile_data',
        { target_user_id: userId }
      );

      if (profileError) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      if (!profileData || profileData.length === 0) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      const p = profileData[0];
      
      // Parse experience data
      let experienceData: any[] = [];
      if (p.experience && typeof p.experience === 'object' && Array.isArray(p.experience)) {
        experienceData = p.experience;
      } else if (p.work_experience && typeof p.work_experience === 'object' && Array.isArray(p.work_experience)) {
        experienceData = p.work_experience;
      }
      
      setProfile({
        user_id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        location: p.location,
        company: p.company,
        job_title: p.job_title,
        website_url: p.website_url,
        phone_number: (p as any).phone_number || null,
        skills: p.skills || [],
        interests: p.interests || [],
        social_links: p.social_links || {},
        experience: experienceData,
        resume_url: (p as any).resume_url,
        resume_filename: (p as any).resume_filename,
      });

      // Fetch contact info (phone + email) using secure function
      // Only returns data if user is connected or viewing own profile
      const { data: contactData } = await supabase.rpc(
        'get_user_contact_secure',
        { target_user_id: userId }
      );

      // Only override phone if contact data has a phone and profile doesn't
      if (contactData && contactData.length > 0 && contactData[0].phone_number && !(p as any).phone_number) {
        setProfile(prev => prev ? { ...prev, phone_number: contactData[0].phone_number } : null);
      }
    } catch (error) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromTribe = async () => {
    if (!userId) return;
    
    const success = await removeConnection(userId);
    if (success) {
      // Connection removed successfully
    }
  };

  const downloadResume = () => {
    if (profile?.resume_url) {
      const filename = profile.resume_filename || 'resume.pdf';
      const link = document.createElement('a');
      link.href = profile.resume_url;
      link.setAttribute('download', filename);
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const viewResume = () => {
    if (profile?.resume_url) {
      setShowResume(true);
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

  const displayName = profile.display_name || "User";

  // Use actual profile data
  const workExperience = profile?.experience || [];
  const skills = profile?.skills || [];
  const interests = profile?.interests || [];
  
  const detailedProfile = {
    fullBio: profile.bio || "No bio available yet.",
    experience: workExperience,
    coreSkills: skills,
    interests: interests,
  };

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
            <span className="text-xl font-bold iridescent-text">Back</span>
          </button>
          <div className="flex gap-2">
            {/* Removed remove from tribe button for now */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 relative z-10 break-words text-pretty hyphens-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6">
            <OptimizedImage
              src={(() => {
                const url = profile.avatar_url || "";
                if (!url) return "/placeholder.svg";
                if (/^(https?:|data:)/i.test(url)) return url;
                try {
                  const { data } = supabase.storage.from('avatars').getPublicUrl(url);
                  return data.publicUrl || "/placeholder.svg";
                } catch {
                  return "/placeholder.svg";
                }
              })()}
              alt={profile.display_name || "Profile"}
              className="w-full h-full"
            />
          </div>
          
          <h1 className="text-4xl font-bold iridescent-text mb-2">
            {displayName}
          </h1>
          
          <p className="text-xl text-muted-foreground iridescent-text mb-4">
            {profile.job_title || "Creative Technologist"}
          </p>
          
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
        </div>

        {/* Contact Information */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">Contact</h2>
          <div className="space-y-3">
            {(() => {
              const linkPhone = typeof (profile.social_links as any)?.phone === 'string'
                ? (profile.social_links as any).phone
                : (profile.social_links as any)?.phone?.url;
              const phoneNumber = profile.phone_number || linkPhone;
              return phoneNumber ? (
                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary text-sm">📞</span>
                  </div>
                  <div>
                    <p className="font-medium iridescent-text">Phone</p>
                    <a 
                      href={`tel:${phoneNumber}`}
                      className="text-muted-foreground iridescent-text hover:text-primary transition-colors"
                    >
                      {phoneNumber}
                    </a>
                  </div>
                </div>
              ) : null;
            })()}
            {profile.website_url && (
              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium iridescent-text">Website</p>
                  <a 
                    href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground iridescent-text hover:text-primary transition-colors"
                  >
                    {profile.website_url}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bio Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">About</h2>
          <p className="text-muted-foreground iridescent-text leading-relaxed break-words text-pretty">
            {detailedProfile.fullBio}
          </p>
        </Card>

        {/* Experience Section */}
        {detailedProfile.experience.length > 0 && (
          <Card className="bg-card border-border p-6 mb-6">
            <h2 className="text-2xl font-bold iridescent-text mb-4">Professional Experience</h2>
            {detailedProfile.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-6 relative">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-2 top-2"></div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold iridescent-text">{exp.company}</h3>
                <p className="text-primary font-medium">{exp.position}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <span className="iridescent-text">{exp.duration}</span>
                </div>
                <p className="text-muted-foreground iridescent-text mb-3 break-words text-pretty">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            ))}
          </Card>
        )}

        {/* Resume Section */}
        {profile.resume_url && (
          <Card className="bg-card border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold iridescent-text flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Resume
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={viewResume}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  onClick={downloadResume}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-secondary/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium iridescent-text">
                    {profile.resume_filename || 'Resume.pdf'}
                  </p>
                  <p className="text-sm text-muted-foreground iridescent-text">
                    Available for download
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Core Skills Section */}
        {detailedProfile.coreSkills.length > 0 && (
          <Card className="bg-card border-border p-6 mb-6">
            <h2 className="text-2xl font-bold iridescent-text mb-4">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {detailedProfile.coreSkills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary/20 text-primary rounded-full font-medium break-words max-w-full"
              >
                {skill}
              </span>
              ))}
            </div>
          </Card>
        )}

        {/* Interests Section */}
        {detailedProfile.interests.length > 0 && (
          <Card className="bg-card border-border p-6 mb-6">
            <h2 className="text-2xl font-bold iridescent-text mb-4">Interests</h2>
            <div className="flex flex-wrap gap-3">
              {detailedProfile.interests.map((interest, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-secondary/20 text-muted-foreground rounded-full break-words max-w-full"
              >
                {interest}
              </span>
              ))}
            </div>
          </Card>
        )}


        {/* CTA Section - Only show for non-signed in users */}
        {!user && (
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
        )}
      </main>

      <Dialog open={showResume} onOpenChange={setShowResume}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resume</DialogTitle>
          </DialogHeader>
          {profile?.resume_url && (
            <ResumeViewer
              url={profile.resume_url}
              fileName={profile.resume_filename || 'resume'}
              height={640}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowResume(false)}>Close</Button>
            <Button onClick={downloadResume} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PublicProfileDetails;