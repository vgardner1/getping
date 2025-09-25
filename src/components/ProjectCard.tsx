import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ProjectCardProps {
  title: string;
  image: string;
  link: string;
}

export const ProjectCard = ({ title, image, link }: ProjectCardProps) => {
  return (
    <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer shimmer hover:scale-105">
      <div className="aspect-square overflow-hidden">
        <OptimizedImage
          src={image}
          alt={title}
          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold iridescent-text">{title}</h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <a 
          href={link} 
          className="inline-block w-full"
        >
          <Button 
            size="sm" 
            className="w-full shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200"
          >
            Learn More
          </Button>
        </a>
      </div>
    </Card>
  );
};