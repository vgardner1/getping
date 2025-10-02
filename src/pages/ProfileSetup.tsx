import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from '@/components/ImageCropper';

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
    profilePhoto: null as File | null,
    avatarUrl: "" as string,
    workExperience: [{ company: "", position: "", duration: "", description: "" }]
  });
  
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');
  
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

        // No need to check for OAuth social media data - users input links directly
      } catch (e) {
        // Silent fail - user can enter data manually
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
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL and replace preview
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

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

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create preview URL for the cropped image
      const previewUrl = URL.createObjectURL(croppedImageBlob);
      setProfileData(prev => ({
        ...prev,
        avatarUrl: previewUrl
      }));

      // Upload cropped image to Supabase storage
      const fileName = `${user.id}/avatar.jpg`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImageBlob, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL and replace preview
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Clean up preview URL and set final URL
      URL.revokeObjectURL(previewUrl);
      setProfileData(prev => ({
        ...prev,
        avatarUrl: publicUrl
      }));

      toast({
        title: 'photo uploaded successfully!',
        description: 'your profile photo has been updated.'
      });

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'upload failed',
        description: 'failed to upload photo. please try again.'
      });
    } finally {
      setLoading(false);
      // Clean up temp image URL
      if (tempImageSrc) {
        URL.revokeObjectURL(tempImageSrc);
        setTempImageSrc('');
      }
    }
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
          work_experience: profileData.workExperience.filter(exp => exp.company && exp.position),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Failed to save profile. Please try again.'
      });
      return false;
    }
  };

  const addWorkExperience = () => {
    setProfileData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: "", position: "", duration: "", description: "" }]
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
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
                },
                workExperience: profileData.workExperience.filter(exp => exp.company && exp.position)
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
              <h2 className="text-2xl font-bold iridescent-text mb-2">work experience</h2>
              <p className="text-muted-foreground iridescent-text">tell us about your professional background</p>
            </div>
            <div className="space-y-4">
              {profileData.workExperience.map((exp, index) => (
                <div key={index} className="p-4 bg-secondary/20 border border-border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium iridescent-text">Experience {index + 1}</h3>
                    {profileData.workExperience.length > 1 && (
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                      className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                      placeholder="Company name"
                    />
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                      className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                      placeholder="Job title"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateWorkExperience(index, 'duration', e.target.value)}
                    className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                    placeholder="Duration (e.g., 2020-2023)"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text resize-none"
                    rows={3}
                    placeholder="Describe your role and achievements..."
                  />
                </div>
              ))}
              <button
                onClick={addWorkExperience}
                className="w-full p-3 border-2 border-dashed border-primary/50 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              >
                + Add Another Experience
              </button>
            </div>
          </div>
        );
      
      case 4:
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
      
      <ImageCropper
        isOpen={showCropper}
        onClose={() => {
          setShowCropper(false);
          if (tempImageSrc) {
            URL.revokeObjectURL(tempImageSrc);
            setTempImageSrc('');
          }
        }}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default ProfileSetup;