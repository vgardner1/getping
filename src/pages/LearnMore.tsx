import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, Zap, Shield, Users, Smartphone, Wifi, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const LearnMore = () => {
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
          <Link to="/checkout">
            <Button className="shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200">
              Get Your Ping Ring - $99
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold iridescent-text mb-4">
            What is Ping?
          </h1>
          <p className="text-xl text-muted-foreground iridescent-text leading-relaxed max-w-3xl mx-auto">
            Ping is the future of professional networking. A beautiful, NFC-enabled ring that instantly shares 
            your professional profile with a simple tap. No more fumbling for business cards or typing contact info.
          </p>
        </section>

        {/* How It Works */}
        <Card className="bg-card border-border p-8">
          <h2 className="text-3xl font-bold iridescent-text text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold iridescent-text">1. Tap Your Ring</h3>
              <p className="text-muted-foreground iridescent-text">
                Simply tap your Ping ring against any NFC-enabled device (most smartphones)
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Wifi className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold iridescent-text">2. Instant Connection</h3>
              <p className="text-muted-foreground iridescent-text">
                Your professional profile opens instantly on their device - no app downloads required
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold iridescent-text">3. Stay Connected</h3>
              <p className="text-muted-foreground iridescent-text">
                They can view your work, contact info, and send you a ping to connect
              </p>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="bg-card border-border p-8">
          <h2 className="text-3xl font-bold iridescent-text text-center mb-8">Why Choose Ping?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold iridescent-text mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground iridescent-text">
                    Share your entire professional identity in under 2 seconds. No more typing or scanning QR codes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold iridescent-text mb-2">Premium Design</h3>
                  <p className="text-muted-foreground iridescent-text">
                    3D printed and electroplated for a luxury feel. Available in multiple finishes to match your style.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold iridescent-text mb-2">Universal Compatibility</h3>
                  <p className="text-muted-foreground iridescent-text">
                    Works with any NFC-enabled smartphone. No special apps or setup required for recipients.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold iridescent-text mb-2">Always Updated</h3>
                  <p className="text-muted-foreground iridescent-text">
                    Your profile stays current automatically. Update once, and everyone gets the latest info.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="bg-card border-border p-8 text-center">
          <h2 className="text-3xl font-bold iridescent-text mb-4">Get Your Ping Ring</h2>
          <div className="text-5xl font-bold iridescent-text mb-2">$99</div>
          <p className="text-muted-foreground iridescent-text mb-6">
            One-time purchase • Free shipping • 30-day money-back guarantee
          </p>
          <div className="max-w-md mx-auto space-y-4 mb-8">
            <div className="text-left space-y-2 text-muted-foreground iridescent-text">
              <div>✓ Premium 3D printed & electroplated ring</div>
              <div>✓ NFC chip with lifetime cloud hosting</div>
              <div>✓ Customizable professional profile</div>
              <div>✓ Analytics and connection tracking</div>
              <div>✓ Multiple ring sizes available</div>
            </div>
          </div>
          <Link to="/checkout">
            <Button size="lg" className="shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200 px-12 py-4 text-lg">
              Order Your Ping Ring Now
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default LearnMore;