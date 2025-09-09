import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building2, Globe, Mail, Phone, Download, ExternalLink, Calendar, MessageSquare, Heart } from 'lucide-react';

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  profile 
}) => {
  if (!profile) return null;

  // Sample data following the framework
  const workExperience = [
    {
      company: "BIND Solutions",
      period: "2022 - Present",
      location: "Boston, MA",
      description: "Leading sustainable furniture innovation through AI-powered design. Created the first AI-designed chair on a college campus."
    },
    {
      role: "Creative Lead",
      company: "Republic 2.0 Project", 
      period: "2023 - Present",
      location: "Digital Art Installation",
      description: "Developing immersive digital art installations reimagining Plato's Republic for modern audiences. Set to debut in major museums in 2026."
    }
  ];

  const featuredWork = [
    { title: "Dam Chair", image: "/src/assets/dam-chair.jpg" },
    { title: "Republic 2.0", image: "/src/assets/lucid-republic.jpg" },
    { title: "Roots Table", image: "/src/assets/roots-table.jpg" },
    { title: "Storm Republic", image: "/src/assets/storm-republic.jpg" }
  ];

  const coreSkills = ["AI Design", "Sustainable Architecture", "Biomimicry", "Creative Direction", "Digital Art", "Innovation Strategy"];
  const interests = ["Philosophy", "Museum Curation", "Environmental Art", "Technology Ethics", "Future Design"];

  const endorsements = [
    {
      author: "Sarah Johnson",
      timeAgo: "2 days ago",
      comment: "Amazing work on the Dam Chair! The AI integration is revolutionary."
    },
    {
      author: "Michael Chen", 
      timeAgo: "1 week ago",
      comment: "Love the sustainable design approach. Can't wait to see Republic 2.0 in museums!"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-full border-4 border-primary overflow-hidden flex-shrink-0">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.display_name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold iridescent-text mb-2">
                  {profile.display_name || "User"}
                </h1>
                <p className="text-xl text-muted-foreground iridescent-text">
                  {profile.job_title || "Professional"}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="iridescent-text">{profile.company}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="iridescent-text">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Experience */}
          <div>
            <h2 className="text-2xl font-bold iridescent-text mb-6">Experience</h2>
            <div className="space-y-6">
              {workExperience.map((exp, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h3 className="text-xl font-semibold iridescent-text">
                        {exp.company}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{exp.period}</span>
                        <span>•</span>
                        <span>{exp.location}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Work */}
          <div>
            <h2 className="text-2xl font-bold iridescent-text mb-6">Featured Work</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredWork.map((work, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-medium text-center mt-2 iridescent-text">
                    {work.title}
                  </p>
                </div>
              ))}
            </div>
            
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2 iridescent-text">Republic 2.0</h3>
                <p className="text-muted-foreground">
                  Digital art installation reimagining Plato's Republic
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skills & Interests */}
          <div>
            <h2 className="text-2xl font-bold iridescent-text mb-6">Skills & Interests</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Core Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {coreSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Endorsements */}
          <div>
            <h2 className="text-2xl font-bold iridescent-text mb-6">Endorsements</h2>
            
            <div className="space-y-4 mb-6">
              {endorsements.map((endorsement, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{endorsement.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm">{endorsement.author}</p>
                          <span className="text-xs text-muted-foreground">{endorsement.timeAgo}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{endorsement.comment}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            Like
                          </Button>
                          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Post Comment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Share your thoughts..." rows={3} />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Post Comment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Mail className="w-4 h-4 mr-2" />
              Contact {profile.display_name?.split(' ')[0] || 'User'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Resume
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};