import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
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
    venmo: "",
    profilePhoto: null as File | null,
    avatarUrl: "" as string
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

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

    console.log('Starting photo upload for file:', file.name);
    setLoading(true);
    try {
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

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      setProfileData(prev => ({
        ...prev,
        profilePhoto: file,
        avatarUrl: publicUrl
      }));

      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been uploaded successfully.'
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
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
          display_name: profileData.name || user.user_metadata.display_name,
          bio: `Q1: ${profileData.question1}\n\nQ2: ${profileData.question2}\n\nQ3: ${profileData.question3}\n\nQ4: ${profileData.question4}\n\nQ5: ${profileData.question5}`,
          avatar_url: profileData.avatarUrl,
          linkedin_url: profileData.linkedin,
          social_links: {
            linkedin: profileData.linkedin,
            instagram: profileData.instagram,
            twitter: profileData.twitter,
            venmo: profileData.venmo
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
          // Kick off AI profile generation using provided info
          await supabase.functions.invoke('process-profile', {
            body: {
              userId: user.id,
              platforms: [],
              seedProfile: {
                displayName: profileData.name || user.user_metadata?.display_name,
                bio: `Q1: ${profileData.question1}\n\nQ2: ${profileData.question2}\n\nQ3: ${profileData.question3}\n\nQ4: ${profileData.question4}\n\nQ5: ${profileData.question5}`,
                linkedin: profileData.linkedin,
                instagram: profileData.instagram,
                social_links: {
                  linkedin: profileData.linkedin,
                  instagram: profileData.instagram,
                  twitter: profileData.twitter,
                  venmo: profileData.venmo
                }
              }
            }
          });
        } catch (e) {
          console.error('AI generation failed, continuing with saved data', e);
        }

        toast({
          title: 'Profile completed!',
          description: 'Your profile has been set up successfully.'
        });
        
        // Use navigate instead of window.location.href for better React Router integration
        setTimeout(() => {
          window.location.href = '/profile';
        }, 500); // Small delay to ensure toast shows and data is saved
      }
      setLoading(false);
    }
  };

  const handleSkip = () => {
    window.location.href = '/profile';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">Add Your Photo</h2>
              <p className="text-muted-foreground iridescent-text">Help people recognize you</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-secondary/20 rounded-full flex items-center justify-center border-2 border-dashed border-primary/50 overflow-hidden">
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
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
                  <span>{profileData.profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                </Button>
              </label>
              {profileData.profilePhoto && (
                <p className="text-sm text-muted-foreground">{profileData.profilePhoto.name}</p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">Let's get to know you</h2>
              <p className="text-muted-foreground iridescent-text">Answer a few questions to help us create your perfect profile</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  What do you do professionally, and what's one thing about your work that most people don't realize or find surprising?
                </label>
                <textarea
                  name="question1"
                  value={profileData.question1}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="I'm a UX designer and most people don't realize how much psychology goes into every button placement..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">
                  Outside of work, what's something you're genuinely excited about right now?
                </label>
                <textarea
                  name="question2"
                  value={profileData.question2}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                  rows={3}
                  placeholder="I'm learning to make sourdough bread and experimenting with different fermentation techniques..."
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
                  placeholder="I'm passionate about digital accessibility and making technology inclusive for everyone..."
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
                  placeholder="I'm building a mobile app to help people track their carbon footprint..."
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
                  placeholder="I lived in 5 different countries before turning 25, which gives me a unique perspective on..."
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">Social Links</h2>
              <p className="text-muted-foreground iridescent-text">Connect your social profiles</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">LinkedIn</label>
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
                <label className="block text-sm font-medium iridescent-text mb-2">Instagram</label>
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
                <label className="block text-sm font-medium iridescent-text mb-2">X (Twitter)</label>
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
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold iridescent-text mb-2">Payment Method</h2>
              <p className="text-muted-foreground iridescent-text">Add how people can pay you</p>
            </div>
            <div>
              <label className="block text-sm font-medium iridescent-text mb-2">Venmo</label>
              <input
                type="text"
                name="venmo"
                value={profileData.venmo}
                onChange={handleInputChange}
                className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                placeholder="@yourvenmo"
              />
            </div>
          </div>
        );
      
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
            Step {currentStep} of {totalSteps} • {Math.round(progress)}% Complete
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
              Skip for Now
            </Button>
            
              <Button 
              onClick={handleNext}
              disabled={loading}
              className="flex-1 shimmer bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Saving...' : (currentStep === totalSteps ? 'Complete' : 'Next')}
            </Button>
          </div>
          
          <Progress value={progress} className="mt-6" />
        </Card>
      </main>
    </div>
  );
};

export default ProfileSetup;