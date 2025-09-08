import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, ArrowRight, User, CreditCard, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Mock account creation - redirect to checkout
    window.location.href = '/checkout';
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <User className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold iridescent-text">Create Your Account</h2>
              <p className="text-muted-foreground iridescent-text">Let's get you set up with your ping profile</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <CreditCard className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold iridescent-text">Get Your Ping Ring</h2>
              <p className="text-muted-foreground iridescent-text">7-day free trial, then $9.99/month</p>
            </div>
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="iridescent-text font-medium">Ping Ring + Service</span>
                <span className="iridescent-text font-bold">$9.99/month</span>
              </div>
              <div className="text-sm text-muted-foreground iridescent-text space-y-2">
                <p>✓ Physical NFC ring shipped to you</p>
                <p>✓ Digital profile with analytics</p>
                <p>✓ Unlimited profile updates</p>
                <p>✓ 7-day free trial</p>
                <p>✓ Get 1 month free when a friend orders</p>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <UserCheck className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold iridescent-text">Invite a Friend</h2>
              <p className="text-muted-foreground iridescent-text">Get your first month free when they order</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium iridescent-text mb-2">Friend's Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="w-full p-3 bg-secondary/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary iridescent-text"
                  placeholder="Enter friend's phone number"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10"
              >
                Send Invite via SMS
              </Button>
              <p className="text-xs text-center text-muted-foreground iridescent-text">
                Skip this step if you prefer to invite friends later
              </p>
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
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">ping!</span>
          </Link>
          <div className="text-sm iridescent-text">Step {step} of 3</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="relative z-10 bg-secondary/20 h-2">
        <div 
          className="bg-primary h-full transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6 pb-28 relative z-10">
        <Card className="bg-card border-border p-8">
          {renderStep()}
          
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button 
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-primary text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {step < 3 ? (
              <Button 
                onClick={handleNext}
                className="flex-1 shimmer bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!formData.name || !formData.email || !formData.phone || !formData.password}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="flex-1 shimmer bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Onboarding;