import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ExternalLink, Instagram, Linkedin, CheckCircle, Clock, Mail, Phone, DollarSign, Smartphone, MessageCircle, Twitter, Globe, Github, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [manualData, setManualData] = useState({
    first_name: '',
    last_name: '',
    linkedin_url: '',
    instagram_username: '',
    bio: '',
    job_title: '',
    company: '',
    location: '',
    email: '',
    phone_number: ''
  });

  const [socialLinks, setSocialLinks] = useState([
    { platform: 'email', label: 'Email', value: '', required: true, icon: 'Mail' },
    { platform: 'phone', label: 'Phone Number', value: '', required: true, icon: 'Phone' },
    { platform: 'linkedin', label: 'LinkedIn', value: '', required: true, icon: 'Linkedin' },
    { platform: 'instagram', label: 'Instagram', value: '', required: false, icon: 'Instagram' },
    { platform: 'zelle', label: 'Zelle', value: '', required: false, icon: 'DollarSign' },
    { platform: 'cashapp', label: 'Cash App', value: '', required: false, icon: 'Smartphone' },
    { platform: 'reddit', label: 'Reddit', value: '', required: false, icon: 'MessageCircle' },
    { platform: 'twitter', label: 'Twitter/X', value: '', required: false, icon: 'Twitter' },
    { platform: 'website', label: 'Personal Website', value: '', required: false, icon: 'Globe' },
    { platform: 'github', label: 'GitHub', value: '', required: false, icon: 'Github' },
    { platform: 'discord', label: 'Discord', value: '', required: false, icon: 'MessageSquare' },
    { platform: 'whatsapp', label: 'WhatsApp', value: '', required: false, icon: 'MessageCircle' }
  ]);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Component loads without needing to check OAuth connections
  }, []);

  // No need to check for OAuth connections anymore

  // OAuth connection functions removed - users will input links directly

  const updateSocialLink = (index: number, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].value = value;
    setSocialLinks(updatedLinks);
  };

  const addCustomSocialLink = () => {
    setSocialLinks([...socialLinks, {
      platform: 'custom',
      label: '',
      value: '',
      required: false,
      icon: 'ExternalLink'
    }]);
  };

  const removeCustomSocialLink = (index: number) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updatedLinks);
  };

  const updateCustomSocialLabel = (index: number, label: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].label = label;
    setSocialLinks(updatedLinks);
  };

  const handleManualSubmit = async () => {
    // Check required fields including name and phone
    if (!manualData.first_name.trim() || !manualData.last_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your first and last name.",
        variant: "destructive"
      });
      return;
    }

    if (!manualData.phone_number.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number for contact sharing.",
        variant: "destructive"
      });
      return;
    }

    const requiredFields = socialLinks.filter(link => link.required);
    const missingFields = requiredFields.filter(field => !field.value.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Required fields missing",
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const socialLinksObject = socialLinks.reduce((acc, link) => {
        if (link.value.trim()) {
          acc[link.platform] = link.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const profileData = {
        user_id: user?.id,
        display_name: `${manualData.first_name} ${manualData.last_name}`.trim(),
        bio: manualData.bio,
        job_title: manualData.job_title,
        company: manualData.company,
        location: manualData.location,
        phone_number: socialLinksObject.phone || manualData.phone_number,
        social_links: socialLinksObject,
        linkedin_url: socialLinksObject.linkedin || manualData.linkedin_url,
        instagram_handle: socialLinksObject.instagram || manualData.instagram_username
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your profile has been created successfully."
      });
      
      onComplete();

    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProcessProfile = async () => {
    setProcessing(true);
    setProgress(0);

    try {
      // Simply process based on manual data only
      const platforms = [];
      if (manualData.linkedin_url) platforms.push('linkedin');
      if (manualData.instagram_username) platforms.push('instagram');

      // Call the profile processing function
      const { data, error } = await supabase.functions.invoke('process-profile', {
        body: { 
          user_id: user?.id,
          platforms,
          manual_data: manualData
        }
      });

      if (error) throw error;

      // Start polling for progress
      const jobId = data.job_id;
      const pollProgress = setInterval(async () => {
        const { data: job, error: jobError } = await supabase
          .from('profile_processing_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (jobError) {
          console.error('Error polling job:', jobError);
          return;
        }

        if (job) {
          setProgress(job.progress || 0);
          
          if (job.status === 'completed') {
            clearInterval(pollProgress);
            setProcessing(false);
            setStep(4);
            toast({
              title: "Profile completed!",
              description: "Your profile is ready! You can always edit it later."
            });
            onComplete();
          } else if (job.status === 'failed') {
            clearInterval(pollProgress);
            setProcessing(false);
            toast({
              title: "Profile saved!",
              description: "Your profile has been created. You can always edit it later."
            });
            onComplete();
          }
        }
      }, 2000);

      // Set timeout to prevent infinite polling
      setTimeout(() => {
        clearInterval(pollProgress);
        if (processing) {
          setProcessing(false);
          toast({
            title: "Profile saved!",
            description: "Your profile has been created. You can always edit it later."
          });
          onComplete();
        }
      }, 120000); // 2 minutes timeout

    } catch (error) {
      console.error('Profile generation error:', error);
      setProcessing(false);
      toast({
        title: "Error",
        description: "Failed to generate profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Profile Setup</CardTitle>
              <p className="text-center text-muted-foreground">
                Add your information and social links to create your profile
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Profile Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={manualData.first_name}
                      onChange={(e) => setManualData({...manualData, first_name: e.target.value})}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={manualData.last_name}
                      onChange={(e) => setManualData({...manualData, last_name: e.target.value})}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={manualData.job_title}
                      onChange={(e) => setManualData({...manualData, job_title: e.target.value})}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={manualData.company}
                      onChange={(e) => setManualData({...manualData, company: e.target.value})}
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={manualData.location}
                      onChange={(e) => setManualData({...manualData, location: e.target.value})}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      value={manualData.phone_number}
                      onChange={(e) => setManualData({...manualData, phone_number: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={manualData.bio}
                    onChange={(e) => setManualData({...manualData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin_url"
                      value={manualData.linkedin_url}
                      onChange={(e) => setManualData({...manualData, linkedin_url: e.target.value})}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_username">Instagram Username</Label>
                    <Input
                      id="instagram_username"
                      value={manualData.instagram_username}
                      onChange={(e) => setManualData({...manualData, instagram_username: e.target.value})}
                      placeholder="@yourusername"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button 
                  onClick={() => setStep(2)}
                  className="px-8"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Social Links</CardTitle>
              <p className="text-center text-muted-foreground">
                Add all your social profiles and contact information
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Social Links</h3>
                  <Button onClick={addCustomSocialLink} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Link
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {socialLinks.map((link, index) => {
                    const getIconComponent = (iconName: string) => {
                      switch (iconName) {
                        case 'Mail': return Mail;
                        case 'Phone': return Phone;
                        case 'Linkedin': return Linkedin;
                        case 'Instagram': return Instagram;
                        case 'DollarSign': return DollarSign;
                        case 'Smartphone': return Smartphone;
                        case 'MessageCircle': return MessageCircle;
                        case 'Twitter': return Twitter;
                        case 'Globe': return Globe;
                        case 'Github': return Github;
                        case 'MessageSquare': return MessageSquare;
                        default: return ExternalLink;
                      }
                    };

                    const IconComponent = getIconComponent(link.icon);

                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {link.platform === 'custom' ? (
                            <Input
                              placeholder="Platform name (e.g., TikTok)"
                              value={link.label}
                              onChange={(e) => updateCustomSocialLabel(index, e.target.value)}
                              className="text-sm"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Label className="text-sm font-medium">
                                {link.label}
                                {link.required && <span className="text-destructive ml-1">*</span>}
                              </Label>
                            </div>
                          )}
                          
                          <Input
                            placeholder={
                              link.platform === 'email' ? 'your.email@example.com' :
                              link.platform === 'phone' ? '+1 (555) 123-4567' :
                              link.platform === 'linkedin' ? 'https://linkedin.com/in/yourprofile' :
                              link.platform === 'instagram' ? '@yourusername' :
                              link.platform === 'zelle' ? 'your-zelle-email@example.com' :
                              link.platform === 'cashapp' ? '$yourcashtag' :
                              link.platform === 'reddit' ? 'u/yourusername' :
                              link.platform === 'twitter' ? '@yourusername' :
                              link.platform === 'github' ? 'https://github.com/yourusername' :
                              link.platform === 'discord' ? 'username#1234' :
                              link.platform === 'whatsapp' ? '+1 (555) 123-4567' :
                              'Enter your link or username'
                            }
                            value={link.value}
                            onChange={(e) => updateSocialLink(index, e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        {!link.required && (
                          <Button
                            onClick={() => removeCustomSocialLink(index)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">*</span> Required fields: Email, Phone Number, and LinkedIn
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={() => setStep(1)} variant="outline">
                  Back
                </Button>
                <Button onClick={handleManualSubmit}>
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Processing Your Profile</CardTitle>
              <p className="text-center text-muted-foreground">
                Please wait while we analyze your social profiles and create your networking profile
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary animate-spin" />
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  {progress < 25 ? 'Initializing...' :
                   progress < 50 ? 'Analyzing social profiles...' :
                   progress < 75 ? 'Generating AI insights...' :
                   'Finalizing profile...'}
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Profile Complete!</CardTitle>
              <p className="text-center text-muted-foreground">
                Your AI-powered networking profile is ready
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg">Welcome to your new networking experience!</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        {renderStep()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {renderStep()}
    </div>
  );
};