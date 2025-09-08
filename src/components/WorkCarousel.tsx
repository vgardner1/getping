import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkItem {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

interface WorkCarouselProps {
  className?: string;
}

export const WorkCarousel = ({ className = "" }: WorkCarouselProps) => {
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  
  // Work portfolio data - aligned with project images
  const workItems: WorkItem[] = [
    {
      id: 1,
      title: "Dam Chair",
      description: "AI-designed sustainable furniture piece",
      image: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png",
      category: "Furniture Design"
    },
    {
      id: 2,
      title: "Roots Table",
      description: "Biomimetic table design inspired by root systems",
      image: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png",
      category: "Furniture Design"
    },
    {
      id: 3,
      title: "Storm Collection",
      description: "Weather-inspired architectural elements",
      image: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png",
      category: "Architecture"
    },
    {
      id: 4,
      title: "Lucid Series",
      description: "Transparent design exploration project",
      image: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png",
      category: "Conceptual Design"
    }
  ];

  // Auto-rotate carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWorkIndex((prevIndex) => (prevIndex + 1) % workItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [workItems.length]);

  const nextWork = () => {
    setCurrentWorkIndex((prevIndex) => (prevIndex + 1) % workItems.length);
  };

  const prevWork = () => {
    setCurrentWorkIndex((prevIndex) => (prevIndex - 1 + workItems.length) % workItems.length);
  };

  const getWorkItemAtIndex = (index: number) => {
    return workItems[(index + workItems.length) % workItems.length];
  };

  const navigate = useNavigate();
  const routeMap: Record<string, string> = {
    "Dam Chair": "/dam-chair",
    "Roots Table": "/roots-table",
    "Storm Collection": "/storm",
    "Lucid Series": "/lucid",
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Mobile Carousel */}
      <div className="flex items-center justify-center relative">
        {/* Left Arrow */}
        <button
          onClick={prevWork}
          className="absolute left-2 z-10 p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>

        {/* Carousel Container */}
        <div className="w-full px-16">
          <div className="flex items-center justify-center space-x-6">
            {/* Left Side Item */}
            <div className="w-20 h-24 opacity-60 transform scale-90 transition-all duration-500 overflow-hidden rounded-lg border border-border/50 shadow-md">
              <img
                src={getWorkItemAtIndex(currentWorkIndex - 1).image}
                alt={getWorkItemAtIndex(currentWorkIndex - 1).title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Main Item */}
            <div
              className="w-44 h-56 flex-shrink-0 transform transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => {
                const title = getWorkItemAtIndex(currentWorkIndex).title;
                const to = routeMap[title] || "/";
                navigate(to);
              }}
              role="button"
              aria-label={`Open ${getWorkItemAtIndex(currentWorkIndex).title} details`}
            >
              <div className="w-full h-full bg-card border-2 border-primary/30 rounded-xl overflow-hidden shimmer shadow-lg">
                <div className="h-3/4 overflow-hidden">
                  <img
                    src={getWorkItemAtIndex(currentWorkIndex).image}
                    alt={getWorkItemAtIndex(currentWorkIndex).title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-3 h-1/4 flex flex-col justify-center bg-gradient-to-t from-background/80 to-transparent">
                  <h3 className="font-semibold text-sm iridescent-text truncate">
                    {getWorkItemAtIndex(currentWorkIndex).title}
                  </h3>
                  <p className="text-xs text-muted-foreground iridescent-text">
                    {getWorkItemAtIndex(currentWorkIndex).category}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Item */}
            <div className="w-20 h-24 opacity-60 transform scale-90 transition-all duration-500 overflow-hidden rounded-lg border border-border/50 shadow-md">
              <img
                src={getWorkItemAtIndex(currentWorkIndex + 1).image}
                alt={getWorkItemAtIndex(currentWorkIndex + 1).title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextWork}
          className="absolute right-2 z-10 p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {workItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentWorkIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentWorkIndex
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Work Description */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold iridescent-text mb-2">
          {getWorkItemAtIndex(currentWorkIndex).title}
        </h3>
        <p className="text-muted-foreground iridescent-text text-sm">
          {getWorkItemAtIndex(currentWorkIndex).description}
        </p>
      </div>
    </div>
  );
};