import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import rootsTableImage from "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png";

const RootsTable = () => {
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
            <h1 className="text-4xl font-bold iridescent-text mb-4">Roots Table</h1>
          </div>
          
          <Card className="bg-card border-border overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={rootsTableImage}
                alt="Roots Table"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <p className="text-lg iridescent-text leading-relaxed">
                  Organic dining table design for BIND with flowing lines that mimic tree root systems, representing sustainable furniture with biomimicry principles.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold iridescent-text">Project Details</h3>
                  <ul className="space-y-2 text-muted-foreground iridescent-text">
                    <li>• Biomimetic design inspired by tree root systems</li>
                    <li>• Organic flowing lines and natural forms</li>
                    <li>• Sustainable materials and construction</li>
                    <li>• Functional art that brings nature indoors</li>
                  </ul>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Companies Involved</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• BIND Solutions (Design & Production)</li>
                      <li>• Local Artisan Collective (Finishing)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold iridescent-text mb-2">Endorsements</h3>
                    <ul className="space-y-2 text-muted-foreground iridescent-text">
                      <li>• “Nature brought to the table” — Interior Review</li>
                      <li>• “Sustainable craft done right” — EcoDesign Weekly</li>
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

export default RootsTable;