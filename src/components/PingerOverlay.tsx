import React, { useLayoutEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase } from "lucide-react";

export type Pinger = {
  name: string;
  city?: string;
  lat: number;
  lng: number;
  role?: string;
  bio?: string;
  avatarUrl?: string;
};

interface PingerOverlayProps {
  pinger: Pinger;
  position: { x: number; y: number };
  placement?: "top" | "right" | "left";
  containerSize?: { width: number; height: number };
  onClose: () => void;
  onPing: () => void;
}

const PingerOverlay: React.FC<PingerOverlayProps> = ({ 
  pinger, 
  position, 
  placement = "top", 
  containerSize, 
  onClose, 
  onPing 
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [overlaySize, setOverlaySize] = useState<{ width: number; height: number }>({ 
    width: 288, 
    height: 220 
  });

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setOverlaySize({ width: rect.width, height: rect.height });
    }
  }, [pinger, placement]);

  // Calculate position and placement
  const margin = 12;
  let x = position.x;
  let y = position.y;
  let finalPlacement: "top" | "right" | "left" = placement;

  // Enhanced mobile positioning logic
  if (containerSize && overlaySize.height) {
    const isSmallScreen = containerSize.width < 768;
    
    if (isSmallScreen) {
      // Mobile positioning logic
      const spaceAbove = y;
      const spaceBelow = containerSize.height - y;
      const spaceLeft = x;
      const spaceRight = containerSize.width - x;
      
      // Determine best placement based on available space
      if (spaceBelow > overlaySize.height + margin && spaceBelow > spaceAbove) {
        finalPlacement = "top";
        y = Math.min(y, containerSize.height - overlaySize.height - margin);
      } else if (spaceRight > overlaySize.width + margin) {
        finalPlacement = "right";
      } else if (spaceLeft > overlaySize.width + margin) {
        finalPlacement = "left";
      } else {
        // Fallback positioning
        finalPlacement = "top";
        x = containerSize.width / 2;
        y = spaceBelow > spaceAbove 
          ? Math.min(y + 40, containerSize.height - overlaySize.height - margin)
          : Math.max(y - 40, overlaySize.height + margin);
      }
      
      // Ensure horizontal bounds
      const halfW = overlaySize.width / 2;
      x = Math.max(margin + halfW, Math.min(containerSize.width - margin - halfW, x));
      
    } else {
      // Desktop positioning logic
      if (placement === "right" || placement === "left") {
        const halfH = overlaySize.height / 2;
        y = Math.max(margin + halfH, Math.min(containerSize.height - margin - halfH, y));
        const halfW = overlaySize.width / 2;
        x = Math.max(margin + halfW, Math.min(containerSize.width - margin - halfW, x));
      } else {
        const halfW = overlaySize.width / 2;
        x = Math.max(margin + halfW, Math.min(containerSize.width - margin - halfW, x));
      }
      
      // Auto-resolve placement if not enough top space
      const neededTop = overlaySize.height * 1.1 + margin;
      if (placement === "top" && y < neededTop) {
        finalPlacement = x > (containerSize.width / 2) ? "left" : "right";
      }
    }
  }

  // Calculate transform based on final placement
  const getTransform = (placementType: "top" | "right" | "left") => {
    switch (placementType) {
      case "top":
        return "translate(-50%, -110%)";
      case "right":
        return "translate(16px, -50%)";
      case "left":
        return "translate(calc(-100% - 16px), -50%)";
      default:
        return "translate(-50%, -110%)";
    }
  };

  const transform = getTransform(finalPlacement);

  return (
    <div
      ref={wrapperRef}
      className="absolute z-50"
      style={{ left: x, top: y, transform }}
    >
      <Card className="w-72 border-border bg-popover text-popover-foreground shadow-lg rounded-lg p-4 animate-enter">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {pinger.avatarUrl ? (
              <img
                src={pinger.avatarUrl}
                alt={`${pinger.name} profile photo`}
                className="w-10 h-10 rounded-full object-cover border border-border"
                loading="lazy"
              />
            ) : null}
            <div>
              <h3 className="font-semibold leading-none tracking-tight">{pinger.name}</h3>
              {pinger.role && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>{pinger.role}</span>
                </div>
              )}
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ×
          </button>
        </div>
        {pinger.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{pinger.city}</span>
          </div>
        )}
        {pinger.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{pinger.bio}</p>
        )}
        <Button onClick={onPing} className="w-full">
          ping! them
        </Button>
      </Card>
    </div>
  );
};

export default PingerOverlay;