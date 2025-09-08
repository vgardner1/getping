import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SocialLink } from "@/components/SocialLink";
import { StarField } from "@/components/StarField";
import { WorkCarousel } from "@/components/WorkCarousel";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import profilePhoto from "/lovable-uploads/5cfc116f-36f7-4ba8-9859-4fdb89227406.png";
const Index = () => {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = ['Welcome', 'to', 'Ping'];
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleWords(prev => {
        if (prev < words.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [words.length]);
  return <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10 safe-top">
        <div className="max-w-6xl mx-auto flex items-center justify-start">
          <h1 className="text-xl font-bold iridescent-text">ping!</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 relative z-10 safe-bottom">
        {/* Comprehensive Portfolio Card */}
        <Card className="bg-card border-border p-8 max-w-md mx-auto space-y-8">
          {/* Welcome Section - from Welcome page */}
          <div className="text-center space-y-6">
            {/* Animated Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                {words.map((word, index) => <span key={index} className={`inline-block mr-4 iridescent-text transition-all duration-700 transform ${index < visibleWords ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                    {word}
                  </span>)}
              </h1>
              
              {/* Subtitle appears after all words */}
              <p className={`text-sm md:text-base text-muted-foreground iridescent-text transition-all duration-700 delay-1000 ${visibleWords >= words.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Your creative network awaits
              </p>
            </div>

            {/* Action Buttons from Welcome page */}
            <div className={`flex flex-col gap-3 transition-all duration-700 delay-1500 ${visibleWords >= words.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Link to="/signup">
                <Button className="w-full shimmer bg-primary text-primary-foreground hover:bg-primary/90 border-primary hover:scale-105 transition-transform duration-200">
                  Sign Up
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="outline" className="w-full shimmer border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform duration-200">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Skip to main site from Welcome page */}
            <div className={`transition-all duration-700 delay-2000 ${visibleWords >= words.length ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/welcome" className="text-xs text-muted-foreground hover:text-primary transition-colors underline">
                Skip to main site
              </Link>
            </div>
          </div>

          {/* Profile Section */}
          

          {/* Featured Work Carousel */}
          

          {/* Social & Business Links */}
          
        </Card>

        {/* Bottom Actions - Learn More About Ping */}
        <div className="text-center space-y-6 mt-8">
          <Link to="/learn-more">
            <Button variant="outline" className="shimmer border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform duration-200 px-8 py-3">
              Learn More About Ping
            </Button>
          </Link>
          <Link to="/checkout">
            <p className="text-xs text-muted-foreground iridescent-text cursor-pointer hover:text-primary transition-colors">
              Buy your ping now - $9.99
            </p>
          </Link>
        </div>
      </main>
    </div>;
};
export default Index;