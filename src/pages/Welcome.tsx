import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-6 max-w-md w-full">
        {/* Welcome Text */}
        <h1 className="text-6xl md:text-7xl font-bold iridescent-text">
          welcome to ping!
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full mt-12">
          <Link to="/onboarding" className="w-full">
            <Button 
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 text-lg font-medium"
            >
              sign up
            </Button>
          </Link>
          <Link to="/signin" className="w-full">
            <Button 
              size="lg"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10 py-4 text-lg font-medium"
            >
              sign in
            </Button>
          </Link>
        </div>

        {/* Skip Link */}
        <div className="mt-8">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground underline transition-colors"
          >
            skip to main site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;