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
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [manualData, setManualData] = useState({
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
    // Check if user already has social connections
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    if (!user) return;

    const { data: socialData } = await supabase
      .from('social_media_data')
      .select('platform')
      .eq('user_id', user.id);

    if (socialData) {
      setLinkedinConnected(socialData.some(d => d.platform === 'linkedin'));
      setInstagramConnected(socialData.some(d => d.platform === 'instagram'));
    }
  };

  const handleLinkedInConnect = () => {
    const clientId = 'your_linkedin_client_id'; // This should be from environment
    const redirectUri = `${window.location.origin}/profile-setup`;
    const scope = 'r_liteprofile%20r_emailaddress';
    
    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=linkedin`;
    
    window.location.href = linkedinUrl;
  };

  const handleInstagramConnect = () => {
    const clientId = 'your_instagram_client_id'; // This should be from environment
    const redirectUri = `${window.location.origin}/profile-setup`;
    const scope = 'user_profile,user_media';
    
    const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=instagram`;
    
    window.location.href = instagramUrl;
  };

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
    updatedLinks[index].platform = label.toLowerCase().replace(/\s+/g, '');
    setSocialLinks(updatedLinks);
  };

  const validateRequiredFields = () => {
    const requiredLinks = socialLinks.filter(link => link.required);
    return requiredLinks.every(link => link.value.trim() !== '');
  };

  const handleManualSubmit = async () => {
    if (!user) return;

    if (!validateRequiredFields()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Email, Phone Number, LinkedIn).",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare social links data
      const socialLinksData = socialLinks
        .filter(link => link.value.trim() !== '')
        .reduce((acc, link) => {
          acc[link.platform] = {
            label: link.label,
            url: link.value,
            platform: link.platform
          };
          return acc;
        }, {} as Record<string, any>);

      // Save manual data to profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: (user.user_metadata as any)?.display_name || (user.email || '').split('@')[0],
          bio: (manualData.bio && manualData.bio.trim()) ? manualData.bio.trim() : 'Excited to connect and network with like-minded people!',
          job_title: manualData.job_title,
          company: manualData.company,
          location: manualData.location,
          phone_number: manualData.phone_number,
          linkedin_url: socialLinks.find(link => link.platform === 'linkedin')?.value || '',
          social_links: socialLinksData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Store Instagram username as social data if provided
      const instagramLink = socialLinks.find(link => link.platform === 'instagram');
      if (instagramLink?.value) {
        await supabase
          .from('social_media_data')
          .upsert({
            user_id: user.id,
            platform: 'instagram',
            raw_data: { username: instagramLink.value },
            updated_at: new Date().toISOString()
          });
      }

      // Skip AI generation and go directly to completion
      toast({
        title: "Profile created!",
        description: "Your profile has been saved successfully."
      });
      onComplete();
    } catch (error) {
      console.error('Error saving manual data:', error);
      toast({
        title: "Error",
        description: "Failed to save profile information.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateProfile = async () => {
    if (!user) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Determine which platforms to process
      const platforms = [];
      if (linkedinConnected) platforms.push('linkedin');
      if (instagramConnected || manualData.instagram_username) platforms.push('instagram');

      // Call the profile processing function
      const { data, error } = await supabase.functions.invoke('process-profile', {
        body: {
          userId: user.id,
          platforms
        }
      });

      if (error) throw error;

      // Poll for progress updates
      const pollProgress = setInterval(async () => {
        const { data: job } = await supabase
          .from('profile_processing_jobs')
          .select('status, progress')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (job) {
          setProgress(job.progress);
          
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
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Connect Your Social Profiles</CardTitle>
              <p className="text-center text-muted-foreground">
                Connect your LinkedIn and Instagram to create an AI-powered networking profile
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold">LinkedIn</h3>
                    {linkedinConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  {!linkedinConnected ? (
                    <Button 
                      onClick={handleLinkedInConnect}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </Button>
                  ) : (
                    <p className="text-sm text-green-600">✓ Connected</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-6 w-6 text-pink-600" />
                    <h3 className="font-semibold">Instagram</h3>
                    {instagramConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  {!instagramConnected ? (
                    <Button 
                      onClick={handleInstagramConnect}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect Instagram
                    </Button>
                  ) : (
                    <p className="text-sm text-green-600">✓ Connected</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={() => setStep(2)} variant="outline">
                  Add Manually Instead
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!linkedinConnected && !instagramConnected}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={manualData.bio}
                    onChange={(e) => setManualData({...manualData, bio: e.target.value})}
                    placeholder="Passionate about technology and innovation..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={manualData.location}
                    onChange={(e) => setManualData({...manualData, location: e.target.value})}
                    placeholder="Boston, MA"
                  />
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-4">
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
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Generate Your AI Profile</CardTitle>
              <p className="text-center text-muted-foreground">
                Our AI will analyze your data to create an amazing networking profile
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {processing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>Generating your profile...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    This may take a few minutes as our AI analyzes your data
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p>Ready to create your AI-powered profile?</p>
                  <Button onClick={handleGenerateProfile} size="lg">
                    Generate My Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Profile Generated Successfully!</CardTitle>
              <p className="text-center text-muted-foreground">
                Your AI-powered networking profile is ready
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="mb-6">
                  Your profile has been enhanced with AI-generated insights based on your social media data.
                  You can now start networking with personalized conversation starters!
                </p>
                <Button onClick={onComplete} size="lg">
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        
        {renderStep()}
      </div>
    </div>
  );
};