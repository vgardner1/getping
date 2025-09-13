import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import profilePhoto from "/lovable-uploads/5cfc116f-36f7-4ba8-9859-4fdb89227406.png";

export const ProfileCard = () => {
  const handlePing = () => {
    // Open chat bubble and generate questions
    window.dispatchEvent(new CustomEvent('open-chat'));

    // Toast feedback
    import("@/hooks/use-toast").then(({ toast }) => {
      toast({
        title: "Opening chat…",
        description: "We’ve generated 3 intriguing questions to break the ice.",
      });
    });
  };

  return (
    <Card className="bg-card border-border p-8 text-center max-w-md mx-auto">
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
    </Card>
  );
};