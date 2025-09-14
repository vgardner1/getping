import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    profilePhoto: null as File | null,
    avatarUrl: "" as string
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Populate form with user data on load
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata?.display_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, linkedin_url, instagram_handle, social_links')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const links = (profile.social_links as Record<string, any> | null) || {};
          setProfileData(prev => ({
            ...prev,
            name: prev.name || (profile.display_name as string) || prev.name,
            // Never pre-populate avatarUrl for new signups - always start blank
            linkedin: (profile.linkedin_url as string) || (links.linkedin as string) || prev.linkedin,
            instagram: (links.instagram as string) || (profile.instagram_handle as string) || prev.instagram,
            twitter: (links.twitter as string) || prev.twitter,
          }));
        }

        const { data: social } = await supabase
          .from('social_media_data')
          .select('platform')
          .eq('user_id', user.id);

        if (social) {
          setConnectedPlatforms(social.map((s: any) => s.platform));
        }
      } catch (e) {
        console.error('Error preloading profile/social data', e);
      }
    };
    loadExisting();
  }, [user]);

  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log('No file selected or no user');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'invalid file type',
        description: 'please select an image file (jpg, png, etc.).'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'file too large',
        description: 'please select an image smaller than 5mb.'
      });
      return;
    }

    console.log('Starting photo upload for file:', file.name);
    setLoading(true);
    
    try {
      // Create preview URL immediately for better UX
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profilePhoto: file,
        avatarUrl: previewUrl // Show preview immediately
      }));

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      console.log('Uploading to path:', fileName);
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get public URL and replace preview
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Clean up preview URL and set final URL
      URL.revokeObjectURL(previewUrl);
      setProfileData(prev => ({
        ...prev,
        avatarUrl: publicUrl
      }));

      toast({
        title: 'photo uploaded!',
        description: 'your profile photo has been uploaded successfully.'
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      // Reset the avatar URL on error
      setProfileData(prev => ({
        ...prev,
        profilePhoto: null,
        avatarUrl: ""
      }));
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: `Failed to upload photo: ${error.message || 'Please try again.'}`
      });
    }
    setLoading(false);
  };

  const saveProfileData = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profileData.name || (user.user_metadata as any)?.display_name,
          bio: `Q1: ${profileData.question1}\n\nQ2: ${profileData.question2}\n\nQ3: ${profileData.question3}\n\nQ4: ${profileData.question4}\n\nQ5: ${profileData.question5}`,
          avatar_url: profileData.avatarUrl,
          linkedin_url: profileData.linkedin,
          instagram_handle: profileData.instagram,
          social_links: {
            linkedin: profileData.linkedin,
            instagram: profileData.instagram,
            twitter: profileData.twitter
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Failed to save profile. Please try again.'
      });
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      const success = await saveProfileData();
      if (success && user) {
        try {
          await supabase.functions.invoke('process-profile', {
            body: {
              userId: user.id,
              platforms: connectedPlatforms,
              seedProfile: {
                displayName: profileData.name || (user.user_metadata as any)?.display_name,
                bio: `Q1: ${profileData.question1}\n\nQ2: ${profileData.question2}\n\nQ3: ${profileData.question3}\n\nQ4: ${profileData.question4}\n\nQ5: ${profileData.question5}`,
                social_links: {
                  linkedin: profileData.linkedin,
                  instagram: profileData.instagram,
                  twitter: profileData.twitter
                }
              }
            }
          });

          // Wait for AI processing to complete before navigating
          const start = Date.now();
          let completed = false;
          while (Date.now() - start < 90000) { // up to 90s
            const { data: job } = await supabase
              .from('profile_processing_jobs')
              .select('status, progress')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            if (job?.status === 'completed') { completed = true; break; }
            if (job?.status === 'failed') { throw new Error('Profile generation failed'); }
            await new Promise((r) => setTimeout(r, 1500));
          }

          toast({
            title: 'Profile completed!',
            description: 'Your profile is ready! You can always edit it later.'
          });
        } catch (e) {
          console.error('AI generation failed, continuing with saved data', e);
          toast({
            title: 'Profile saved!',
            description: 'Your profile has been created. You can always edit it later.'
          });
        }

        // Navigate to profile with a small delay to ensure data is saved
        setTimeout(() => {
          navigate('/profile');
        }, 500);
      }
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/profile');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">add your photo</h2>
              <p className="text-muted-foreground iridescent-text">help people recognize you</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-secondary/20 rounded-full flex items-center justify-center border-2 border-dashed border-primary/50 overflow-hidden relative">
                {profileData.avatarUrl ? (
                  <img 
                    src={profileData.avatarUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover rounded-full" 
                    onError={(e) => {
                      console.error('Image failed to load:', profileData.avatarUrl);
                      // Reset avatar URL if image fails to load
                      setProfileData(prev => ({ ...prev, avatarUrl: "" }));
                    }}
                  />
                ) : (
                  <span className="text-4xl">📷</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
                  <span>{profileData.profilePhoto ? 'change photo' : 'upload photo'}</span>
                </Button>
              </label>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">let's get to know you</h2>
              <p className="text-muted-foreground iridescent-text">answer a few questions to help us create your perfect profile</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  what do you do professionally, and what's one thing about your work that most people don't realize or find surprising?
                </label>
                <textarea
                  name="question1"
                  value={profileData.question1}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="tell us about your professional work..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  outside of work, what's something you're genuinely excited about right now?
                </label>
                <textarea
                  name="question2"
                  value={profileData.question2}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="what interests you outside of work?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  What's a cause, principle, or type of impact that you care deeply about?
                </label>
                <textarea
                  name="question3"
                  value={profileData.question3}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="What causes or principles matter to you?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  What's something you're currently learning, building, or working toward?
                </label>
                <textarea
                  name="question4"
                  value={profileData.question4}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="What are you currently working on or learning?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  What's an experience or perspective you have that tends to lead to interesting conversations?
                </label>
                <textarea
                  name="question5"
                  value={profileData.question5}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="What experiences or perspectives do you bring to conversations?"
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">social links</h2>
              <p className="text-muted-foreground iridescent-text">connect your social profiles</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">linkedin</label>
                <input
                  type="url"
                  name="linkedin"
                  value={profileData.linkedin}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={profileData.instagram}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="https://instagram.com/yourname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">x (twitter)</label>
                <input
                  type="url"
                  name="twitter"
                  value={profileData.twitter}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="https://x.com/yourname"
                />
              </div>
            </div>
          </div>
        );
      
          {/* Venmo/payment step removed by request */}
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Progress Bar */}
      <div className="bg-primary h-2 relative z-10">
        <div 
          className="bg-primary-foreground h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/profile" className="text-xl font-bold iridescent-text">ping!</Link>
          <div className="text-sm iridescent-text">
            step {currentStep} of {totalSteps} • {Math.round(progress)}% complete
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6 pb-28 relative z-10">
        <Card className="bg-card border-border p-8">
          {renderStep()}
          
          <div className="flex gap-4 mt-8">
            <Button 
              variant="outline"
              onClick={handleSkip}
              className="flex-1 border-primary text-primary hover:bg-primary/10"
            >
              skip for now
            </Button>
            
              <Button 
              onClick={handleNext}
              disabled={loading}
              className="flex-1 shimmer bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'saving...' : (currentStep === totalSteps ? 'complete' : 'next')}
            </Button>
          </div>
          
          <Progress value={progress} className="mt-6" />
        </Card>
      </main>
    </div>
  );
};

export default ProfileSetup;