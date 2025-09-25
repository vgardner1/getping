import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";

interface Pinger {
  id: number;
  name: string;
  title: string;
  location: string;
  image: string;
  bio: string;
  mutualConnections: number;
}

const mockPingers: Pinger[] = [
  {
    id: 1,
    name: "Alex Chen",
    title: "UX Designer",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Creating beautiful digital experiences",
    mutualConnections: 12
  },
  {
    id: 2,
    name: "Maya Patel",
    title: "Product Manager", 
    location: "Boston, MA",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Building products that matter",
    mutualConnections: 8
  },
  {
    id: 3,
    name: "Jordan Kim",
    title: "Full Stack Developer",
    location: "Seattle, WA", 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Code enthusiast & coffee lover",
    mutualConnections: 15
  },
  {
    id: 4,
    name: "Taylor Swift",
    title: "Marketing Director",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "Telling stories through brands", 
    mutualConnections: 6
  },
  {
    id: 5,
    name: "Sam Rivera",
    title: "Data Scientist",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "Turning data into insights",
    mutualConnections: 20
  }
];

export const PingerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      nextPinger();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextPinger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % mockPingers.length);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const prevPinger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + mockPingers.length) % mockPingers.length);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  // Remove the getVisiblePingers function as we're now rendering all pingers continuously

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="flex items-center justify-center">
        {/* Show exactly 5 pingers with the current one in center */}
        {[-2, -1, 0, 1, 2].map((offset) => {
          const pingerIndex = (currentIndex + offset + mockPingers.length) % mockPingers.length;
          const pinger = mockPingers[pingerIndex];
          const isCenter = offset === 0;
          const isAdjacent = Math.abs(offset) === 1;
          const isEdge = Math.abs(offset) === 2;
          
          return (
            <div
              key={`${pinger.id}-${offset}`}
              className={`
                transition-all duration-700 ease-in-out cursor-pointer
                ${isCenter ? 'z-20 mx-4' : ''}
                ${isAdjacent ? 'z-10 mx-2' : ''}
                ${isEdge ? 'z-0 mx-1' : ''}
              `}
              onClick={() => !isCenter && goToSlide(pingerIndex)}
            >
              <Card 
                className={`
                  bg-card border-border text-center transition-all duration-700
                  ${isCenter ? 'scale-110 p-6 shadow-2xl border-primary/50' : ''}
                  ${isAdjacent ? 'scale-90 p-4 opacity-80' : ''}
                  ${isEdge ? 'scale-70 p-3 opacity-40' : ''}
                  ${!isCenter ? 'hover:scale-105' : ''}
                `}
              >
                <div className={`${isCenter ? 'w-28 h-28' : isAdjacent ? 'w-20 h-20' : 'w-16 h-16'} mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary transition-all duration-700`}>
                  <OptimizedImage
                    src={pinger.image}
                    alt={pinger.name}
                    className="w-full h-full"
                    priority={isCenter}
                  />
                </div>
                
                <h3 className={`font-bold text-green-500 mb-1 ${isCenter ? 'text-xl' : isAdjacent ? 'text-lg' : 'text-base'}`}>
                  {pinger.name}
                </h3>
                
                {(isCenter || isAdjacent) && (
                  <>
                    <p className="text-primary mb-2 text-sm">
                      {pinger.title}
                    </p>
                    
                    <div className="flex items-center justify-center gap-1 mb-3 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span>{pinger.location}</span>
                    </div>
                  </>
                )}
                
                {isCenter && (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {pinger.bio}
                    </p>
                    
                    <div className="flex items-center justify-center gap-1 mb-4 text-xs text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{pinger.mutualConnections} mutual connections</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="shimmer bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200"
                      onClick={() => {
                        // For now, just show a toast - in a real app this would add to tribe
                        window.dispatchEvent(new CustomEvent('ping-user', {
                          detail: { name: pinger.name, id: pinger.id }
                        }));
                      }}
                    >
                      Add to Tribe
                    </Button>
                  </>
                )}
              </Card>
            </div>
          );
        })}
      </div>
      
      {/* Navigation buttons */}
      <button
        onClick={prevPinger}
        disabled={isAnimating}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/20 hover:bg-primary/40 rounded-full flex items-center justify-center transition-colors z-20 disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5 text-primary" />
      </button>
      
      <button
        onClick={nextPinger}
        disabled={isAnimating}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/20 hover:bg-primary/40 rounded-full flex items-center justify-center transition-colors z-20 disabled:opacity-50"
      >
        <ChevronRight className="w-5 h-5 text-primary" />
      </button>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {mockPingers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};