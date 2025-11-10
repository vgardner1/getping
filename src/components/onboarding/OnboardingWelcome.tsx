import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/onboarding/circle');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-6">👥</div>
      
      <h1 className="text-3xl font-bold text-foreground text-center mb-4">
        Your Circle Matters
      </h1>
      
      <p className="text-base text-muted-foreground text-center max-w-sm mb-12">
        Stay connected with the people who make networking meaningful
      </p>
      
      <Button 
        onClick={handleGetStarted}
        className="w-full max-w-xs"
        size="lg"
      >
        Get Started
      </Button>
    </div>
  );
}
