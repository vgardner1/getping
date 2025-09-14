import { ProfileCard } from "@/components/ProfileCard";
import { SocialLink } from "@/components/SocialLink";
import { WorkCarousel } from "@/components/WorkCarousel";
import { StarField } from "@/components/StarField";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import profilePhoto from "/lovable-uploads/5cfc116f-36f7-4ba8-9859-4fdb89227406.png";
import { MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfileSimple = () => {
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 relative z-10">
        {/* Main Profile Card */}
        <Card className="bg-card border-border p-8 max-w-md mx-auto mb-8">
          {/* Profile Section */}
          <div className="text-center">
            <Link to="/profile/details" className="block hover:scale-105 transition-transform duration-200">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-primary overflow-hidden">
                <img
                  src={profilePhoto}
                  alt="Profile Photo"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h1 className="text-2xl font-bold iridescent-text mb-2">
                Profile Name
              </h1>
            </Link>
            
            <p className="text-muted-foreground mb-4 leading-relaxed iridescent-text">
              Entrepreneur & Creative Director building the future of sustainable
              design through AI-powered innovation
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Boston, MA</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Sustainable Design & AI</span>
              </div>
            </div>

            <Link to="/chat/thread/vaness" className="block">
              <Button 
                className="w-full shimmer bg-primary hover:bg-primary/90 text-primary-foreground font-medium hover:scale-105 transition-transform duration-200"
              >
                Ping Vaness
              </Button>
            </Link>
          </div>
        </Card>

        {/* Featured Work Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold iridescent-text text-center mb-6">
            Featured Work
          </h2>
          <WorkCarousel />
        </section>

        {/* Social & Business Links */}
        <section className="max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold iridescent-text text-center mb-6">
            Connect & Learn More
          </h2>
          <div className="space-y-4">
            <SocialLink
              platform="linkedin"
              title="LinkedIn - Connect with me"
              url="#"
            />
            <SocialLink
              platform="instagram"
              title="Instagram - Behind the scenes"
              url="https://www.instagram.com/reeze.gar/"
            />
            <SocialLink
              platform="link"
              title="Generator at Babson"
              url="https://entrepreneurship.babson.edu"
            />
            <SocialLink
              platform="link"
              title="BIND Solutions"
              url="https://bind.solutions"
            />
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="text-center space-y-6">
          <Link to="/learn-more">
            <Button 
              variant="outline" 
              className="shimmer border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform duration-200 px-8 py-3"
            >
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
    </div>
  );
};

export default ProfileSimple;