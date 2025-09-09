import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building2, Globe, Mail, Phone, Download, ExternalLink } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
                {profile.website_url && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-primary" />
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="iridescent-text hover:text-primary transition-colors"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio Section */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground iridescent-text leading-relaxed">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience Section */}
          {profile.experience && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(profile.experience) ? (
                    profile.experience.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary/30 pl-4">
                        <h4 className="font-semibold iridescent-text">{exp.title || exp.position}</h4>
                        <p className="text-primary">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">{exp.duration || exp.period}</p>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{profile.experience}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="iridescent-text">{profile.phone_number}</span>
                  </div>
                )}
                
                {/* Social Links */}
                {profile.social_links && Object.entries(profile.social_links).map(([platform, linkData]: [string, any]) => {
                  if (!linkData || (typeof linkData === 'object' && !linkData.url) || (typeof linkData === 'string' && !linkData)) {
                    return null;
                  }
                  
                  return (
                    <div key={platform} className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <a 
                        href={typeof linkData === 'string' ? linkData : linkData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="iridescent-text hover:text-primary transition-colors capitalize"
                      >
                        {platform}
                      </a>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

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