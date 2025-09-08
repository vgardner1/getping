import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import stormImage from "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png";

const Storm = () => {
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
            <h1 className="text-4xl font-bold iridescent-text mb-4">Storm</h1>
            <p className="text-lg iridescent-text">Republic 2.0 Project</p>
          </div>
          
          <Card className="bg-card border-border overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={stormImage}
                alt="Storm - Republic 2.0"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <p className="text-lg iridescent-text leading-relaxed">
                  Dynamic digital art installation for Republic 2.0 project, exploring modern interpretations of classical republican ideals through contemporary digital art.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold iridescent-text">Project Details</h3>
                  <ul className="space-y-2 text-muted-foreground iridescent-text">
                    <li>• Part of the Republic 2.0 project series</li>
                    <li>• Modern interpretation of classical republican ideals</li>
                    <li>• Interactive digital art installation</li>
                    <li>• Explores themes of democracy and governance</li>
                    <li>• Contemporary visual language for ancient concepts</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold iridescent-text">Republic 2.0</h3>
                  <p className="text-muted-foreground iridescent-text leading-relaxed">
                    A visionary project reimagining Plato's Republic for the modern era, combining philosophical discourse with cutting-edge digital art and interactive experiences.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Companies Involved</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• BIND Solutions (Creative Direction)</li>
                      <li>• Republic 2.0 Collective (Curation)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Endorsements</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• “Provocative and timely” — Museum Panel</li>
                      <li>• “A compelling civic dialogue” — Arts Journal</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full shimmer border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform duration-200">
                      Back to Portfolio
                    </Button>
                  </Link>
                  <Link to="/lucid" className="flex-1">
                    <Button className="w-full shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200">
                      View Lucid Project
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

export default Storm;