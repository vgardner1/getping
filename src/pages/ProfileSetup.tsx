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
    bio: "",
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
    if (!file || !user) return;

    setLoading(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileData({
        ...profileData,
        profilePhoto: file,
        avatarUrl: publicUrl
      });

      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been uploaded successfully.'
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.'
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
          bio: profileData.bio,
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
                bio: profileData.bio,
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
        window.location.href = '/profile';
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
              <h2 className="text-2xl font-bold iridescent-text mb-2">Write Your Bio</h2>
              <p className="text-muted-foreground iridescent-text">Tell people about yourself</p>
            </div>
            <div>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                rows={4}
                placeholder="Creative director passionate about design and innovation..."
              />
              <p className="text-xs text-muted-foreground mt-2 iridescent-text">
                {profileData.bio.length}/200 characters
              </p>
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