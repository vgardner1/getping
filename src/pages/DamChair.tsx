import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import damChairImage from "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png";

const DamChair = () => {
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
          <Button variant="outline" className="shimmer bg-primary text-primary-foreground hover:bg-primary/90 border-primary hover:scale-105 transition-transform duration-200">
            Create Your Ping
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 relative z-10">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold iridescent-text mb-4">Dam Chair</h1>
          </div>
          
          <Card className="bg-card border-border overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={damChairImage}
                alt="Dam Chair"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <p className="text-lg iridescent-text leading-relaxed">
                  AI-designed chair inspired by beaver dam architecture, the first full-scale chair designed with generative AI on a college campus. Created through BIND solutions for sustainable furniture innovation.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold iridescent-text">Project Details</h3>
                  <ul className="space-y-2 text-muted-foreground iridescent-text">
                    <li>• First AI-designed furniture piece on a college campus</li>
                    <li>• Inspired by biomimicry and beaver dam architecture</li>
                    <li>• Sustainable design principles</li>
                    <li>• Innovative use of generative AI in furniture design</li>
                  </ul>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Companies Involved</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• BIND Solutions (Lead Design & Fabrication)</li>
                      <li>• Babson College (Studio & Exhibition)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Endorsements</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• “A milestone for AI in furniture” — Design Dept.</li>
                      <li>• “Elegant, functional biomimicry” — Faculty Panel</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    className="flex-1 shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200"
                    onClick={() => window.open('https://bind.solutions', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit BIND Solutions
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full shimmer border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform duration-200">
                      Back to Portfolio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DamChair;