import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [profileData, setProfileData] = useState({
    name: "John Doe", // From signup
    email: "john@example.com", // From signup
    phone: "+1 (555) 123-4567", // From signup
    bio: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    venmo: "",
    profilePhoto: null as File | null
  });

  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup and redirect to profile
      window.location.href = '/profile';
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
              <div className="w-32 h-32 bg-secondary/20 rounded-full flex items-center justify-center border-2 border-dashed border-primary/50">
                <span className="text-4xl">📷</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
                onChange={(e) => setProfileData({...profileData, profilePhoto: e.target.files?.[0] || null})}
              />
              <label htmlFor="photo-upload">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
                  <span>Upload Photo</span>
                </Button>
              </label>
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
              className="flex-1 shimmer bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentStep === totalSteps ? 'Complete' : 'Next'}
            </Button>
          </div>
          
          <Progress value={progress} className="mt-6" />
        </Card>
      </main>
    </div>
  );
};

export default ProfileSetup;