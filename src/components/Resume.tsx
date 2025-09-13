import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff } from "lucide-react";

export const Resume = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleDownload = () => {
    // In a real app, this would download the actual PDF
    const link = document.createElement('a');
    link.href = '/placeholder-resume.pdf'; // This would be the actual PDF path
    link.download = 'Resume.pdf';
    link.click();
  };

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold iridescent-text">Resume</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shimmer border-secondary text-secondary hover:bg-secondary/10 text-xs px-2 py-1"
          >
            {isExpanded ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {isExpanded ? "Less" : "More"}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="shimmer bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1"
          >
            <Download className="w-3 h-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* PDF Preview Frame - Responsive Size */}
      <div className={`w-full border border-border rounded-lg overflow-hidden bg-white transition-all duration-300 ${isExpanded ? 'h-96' : 'h-64'}`}>
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className={`w-full mx-auto bg-white shadow-sm ${isExpanded ? 'max-w-md p-6' : 'max-w-xs p-4'}`}>
            {/* Resume Preview Content */}
            <div className="text-center mb-4">
              <h1 className={`font-bold text-gray-900 mb-1 ${isExpanded ? 'text-xl' : 'text-lg'}`}>Resume</h1>
              <p className={`text-gray-600 ${isExpanded ? 'text-base' : 'text-sm'}`}>Professional Resume</p>
              <div className={`text-gray-500 mt-1 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                <p>vaness@bind.solutions {isExpanded && '| (617) 555-0123'}</p>
                <p>Boston, MA {isExpanded && '| www.bind.solutions'}</p>
              </div>
            </div>

            <div className={`space-y-3 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">SUMMARY</h3>
                <p className={`text-gray-700 leading-tight ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                  {isExpanded 
                    ? "Visionary entrepreneur and creative director pioneering sustainable design innovation through AI technology. Founded BIND Solutions to create furniture that minimizes environmental impact while contributing to ecological restoration." 
                    : "Visionary entrepreneur pioneering sustainable design through AI technology..."
                  }
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">EXPERIENCE</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className={`font-medium text-gray-900 ${isExpanded ? 'text-sm' : 'text-xs'}`}>Founder & Creative Director</p>
                        <p className={`text-gray-600 ${isExpanded ? 'text-sm' : 'text-xs'}`}>BIND Solutions</p>
                      </div>
                      <span className={`text-gray-500 ${isExpanded ? 'text-sm' : 'text-xs'}`}>2022 - Present</span>
                    </div>
                    <p className={`text-gray-600 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                      {isExpanded 
                        ? "Founded sustainable furniture company focused on AI-powered design innovation. Created the first AI-designed chair installed on a college campus."
                        : "Founded sustainable furniture company..."
                      }
                    </p>
                  </div>
                  
                  {isExpanded && (
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Creative Lead</p>
                          <p className="text-gray-600 text-sm">Republic 2.0 Project</p>
                        </div>
                        <span className="text-gray-500 text-sm">2023 - Present</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Developing immersive digital art installations reimagining Plato's Republic for modern audiences.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">EDUCATION</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <div>
                      <p className={`font-medium text-gray-900 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                        {isExpanded ? "Master of Arts in Design Innovation" : "MA Design Innovation"}
                      </p>
                      <p className={`text-gray-600 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                        {isExpanded ? "Rhode Island School of Design" : "RISD"}
                      </p>
                    </div>
                    <span className={`text-gray-500 ${isExpanded ? 'text-sm' : 'text-xs'}`}>2021</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Bachelor of Fine Arts in Industrial Design</p>
                        <p className="text-gray-600 text-sm">Massachusetts College of Art and Design</p>
                      </div>
                      <span className="text-gray-500 text-sm">2019</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">SKILLS</h3>
                <p className={`text-gray-600 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                  {isExpanded 
                    ? "AI-Powered Design • Sustainable Architecture • Biomimicry • Creative Direction • Digital Art • Innovation Strategy • 3D Modeling • Material Science"
                    : "AI Design • Sustainability • Biomimicry"
                  }
                </p>
              </div>
              
              {isExpanded && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">CERTIFICATIONS</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Certified Sustainable Design Professional</span>
                      <span className="text-gray-500">2022</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">AI in Creative Industries Certificate</span>
                      <span className="text-gray-500">2021</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Watermark */}
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 opacity-40">
              PDF
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2 iridescent-text">
        Download for complete resume
      </p>
    </Card>
  );
};