import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import lucidImage from "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png";

const Lucid = () => {
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
            <h1 className="text-4xl font-bold iridescent-text mb-4">Lucid</h1>
            <p className="text-lg iridescent-text">Republic 2.0 Project • Museum Exhibition 2026</p>
          </div>
          
          <Card className="bg-card border-border overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={lucidImage}
                alt="Lucid - Republic 2.0"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <p className="text-lg iridescent-text leading-relaxed">
                  Innovative museum installation for Republic 2.0, set to debut in museums in 2026. A futuristic reinterpretation of Plato's Republic in modern visual form.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold iridescent-text">Project Details</h3>
                  <ul className="space-y-2 text-muted-foreground iridescent-text">
                    <li>• Museum installation debuting in 2026</li>
                    <li>• Futuristic interpretation of Plato's Republic</li>
                    <li>• Interactive philosophical experience</li>
                    <li>• Cutting-edge visualization technology</li>
                    <li>• Bridge between ancient wisdom and modern innovation</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold iridescent-text">Vision</h3>
                  <p className="text-muted-foreground iridescent-text leading-relaxed">
                    Lucid represents the culmination of the Republic 2.0 project, transforming Plato's philosophical masterpiece into an immersive, contemporary experience that speaks to modern audiences about timeless questions of justice, governance, and the ideal society.
                  </p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <h4 className="text-lg font-semibold iridescent-text mb-2">Coming to Museums 2026</h4>
                  <p className="text-sm text-muted-foreground iridescent-text">
                    This groundbreaking installation will tour major museums starting in 2026, offering visitors an unprecedented journey through philosophical concepts via innovative digital art and interactive technology.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Companies Involved</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• BIND Solutions (Lead Partner)</li>
                      <li>• Museum Partners (2026 Touring)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Endorsements</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• “Visionary museum piece” — Curator Panel</li>
                      <li>• “Thoughtful and immersive” — Art Review</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full shimmer border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform duration-200">
                      Back to Portfolio
                    </Button>
                  </Link>
                  <Link to="/storm" className="flex-1">
                    <Button className="w-full shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200">
                      View Storm Project
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

export default Lucid;