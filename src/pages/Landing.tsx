import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { Link } from "react-router-dom";
import Ring3D from "@/components/Ring3D";

const Landing = () => {
  const [visibleText, setVisibleText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleText(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <h1 className="text-2xl font-bold iridescent-text">ping!</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="text-center space-y-12 max-w-4xl">
          {/* 3D Ring */}
          <div className="flex justify-center">
            <Ring3D />
          </div>

          {/* Hero Text */}
          <div className={`space-y-6 transition-all duration-1000 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold iridescent-text leading-tight">
              Your NFC Ring.
              <br />
              Your Digital Identity.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground iridescent-text max-w-2xl mx-auto">
              Share your contact, portfolio, and social links instantly with just a tap. 
              The future of networking is here.
            </p>
          </div>

          {/* CTA Button */}
          <div className={`transition-all duration-1000 delay-500 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link to="/signup">
              <Button 
                size="lg"
                className="shimmer bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 px-12 py-6 text-xl font-semibold"
              >
                Get Your Ping - $9.99
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4 iridescent-text">
              7-day free trial • Get 1 month free when a friend orders
            </p>
          </div>

          {/* Features */}
          <div className={`grid md:grid-cols-3 gap-8 mt-16 transition-all duration-1000 delay-1000 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold iridescent-text">Instant Share</h3>
              <p className="text-sm text-muted-foreground iridescent-text">
                Tap your ring to any NFC-enabled device to share your profile instantly
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold iridescent-text">Track Analytics</h3>
              <p className="text-sm text-muted-foreground iridescent-text">
                See who views your profile and track engagement with detailed analytics
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold iridescent-text">All-in-One</h3>
              <p className="text-sm text-muted-foreground iridescent-text">
                LinkedIn, Instagram, X, email, phone, Venmo - all in one place
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;