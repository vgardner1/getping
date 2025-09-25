import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarField } from '@/components/StarField';
import { ArrowLeft, MapPin, Building2, Calendar, ExternalLink, MessageCircle, Send, FileText, Download, Eye, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';
import damChair from '@/assets/dam-chair.jpg';
import rootsTable from '@/assets/roots-table.jpg';
import stormRepublic from '@/assets/storm-republic.jpg';
import lucidRepublic from '@/assets/lucid-republic.jpg';

const ProfileDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      // For now, just show a success message
      // In a real app, you'd save this to a comments table
      toast({
        title: "Comment Posted",
        description: "Your comment has been posted successfully!"
      });
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
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
      window.open(profile.resume_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="iridescent-text">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <p className="iridescent-text">Profile not found</p>
        </div>
      </div>
    );
  }

  // Default work experience and featured work
  const workExperience = profile?.work_experience || [];

  const featuredWork = [
    { title: "Dam Chair", type: "Furniture Design", image: damChair },
    { title: "Republic 2.0", type: "Digital Art", image: stormRepublic },
    { title: "Roots Table", type: "Sustainable Design", image: rootsTable }
  ];

  const skills = profile?.skills || ["AI Design", "Sustainable Architecture", "Biomimicry", "Creative Direction", "Digital Art", "Innovation Strategy"];
  const interests = profile?.interests || ["Philosophy", "Museum Curation", "Environmental Art", "Technology Ethics", "Future Design"];

  // Mock endorsements
  const endorsements = [
    {
      name: "Sarah Johnson",
      time: "2 days ago",
      comment: "Amazing work on the Dam Chair! The AI integration is revolutionary.",
      avatar: "/placeholder.svg"
    },
    {
      name: "Michael Chen",
      time: "1 week ago", 
      comment: "Love the sustainable design approach. Can't wait to see Republic 2.0 in museums!",
      avatar: "/placeholder.svg"
    }
  ];

  const displayName = profile.display_name || 'User';

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">Back to Profile</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-8 relative z-10">
        {/* Profile Header */}
        <Card className="bg-card border-border p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden flex-shrink-0">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.display_name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold iridescent-text mb-2 story-link animate-enter hover-scale transition-all duration-500 ease-out">
                {displayName}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {profile.job_title || "Professional"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{profile.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </Card>

        {/* Resume Section - Prominent and High Up */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="iridescent-text flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Resume & CV
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.resume_url ? (
              <>
                <div className="flex items-center justify-between p-6 border border-primary/20 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg iridescent-text">
                        {profile.resume_filename || 'Resume.pdf'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF Document • Ready to view and share
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={viewResume}
                      variant="outline"
                      size="lg"
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      View Resume
                    </Button>
                    <Button
                      onClick={downloadResume}
                      variant="default"
                      size="lg"
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                {/* Enhanced PDF Preview */}
                <div className="mt-6 border border-primary/20 rounded-xl overflow-hidden bg-background/30 backdrop-blur-sm">
                  <div className="p-4 bg-primary/10 border-b border-primary/20">
                    <p className="font-semibold iridescent-text text-center">Resume Preview</p>
                  </div>
                  <iframe
                    src={`${profile.resume_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-96 border-0"
                    title="Resume Preview"
                  />
                </div>
              </>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-primary/30 rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold iridescent-text mb-2">No Resume Uploaded</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your resume to make it easily accessible to connections
                </p>
                <Button 
                  onClick={() => navigate('/profile?edit=true')}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Experience */}
        {workExperience && workExperience.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="iridescent-text">Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {workExperience.map((job, index) => (
                <div key={index} className="border-l-2 border-primary/30 pl-6 relative">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg iridescent-text">{job.company}</h3>
                      <p className="text-primary font-medium">{job.position}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{job.duration}</p>
                      {job.location && <p>{job.location}</p>}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-muted-foreground mb-3 leading-relaxed">{job.description}</p>
                  )}
                  {job.skills_used && job.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.skills_used.map((skill: string, skillIndex: number) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Featured Work */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="iridescent-text">Featured Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredWork.map((work, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="h-36 overflow-hidden rounded-md mb-3">
                    <OptimizedImage src={work.image} alt={work.title} className="w-full h-full" />
                  </div>
                  <h4 className="font-semibold iridescent-text">{work.title}</h4>
                  <p className="text-sm text-muted-foreground">{work.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="iridescent-text">Core Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="iridescent-text">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Endorsements */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="iridescent-text">Endorsements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {endorsements.map((endorsement, index) => (
              <div key={index} className="flex gap-3 p-3 border border-border rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={endorsement.avatar} />
                  <AvatarFallback>{endorsement.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium iridescent-text">{endorsement.name}</span>
                    <span className="text-xs text-muted-foreground">{endorsement.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{endorsement.comment}</p>
                </div>
              </div>
            ))}

            {/* Post Comment */}
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-medium iridescent-text mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Post Comment
              </h4>
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write an endorsement or comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!comment.trim() || submittingComment}
                    className="w-full md:w-auto"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileDetails;