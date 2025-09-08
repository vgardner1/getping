import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: any;
        };
      };
    };
  }
}

interface SearchResult {
  lng: number;
  lat: number;
  name: string;
}

interface GlobeSearchProps {
  onPick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Simple search box using Google Places Autocomplete (Maps JS API).
 * Requires adding this script in Global Head, AFTER setting window.GOOGLE_MAPS_API_KEY:
 *
 * <script async
 *   src="https://maps.googleapis.com/maps/api/js?key={{ secrets.GOOGLE_MAPS_API_KEY }}&libraries=places"></script>
 */
export default function GlobeSearch({ 
  onPick, 
  placeholder = "Search a place or campus…", 
  className = "" 
}: GlobeSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const g = window.google;
    if (!g || !g.maps || !g.maps.places || !inputRef.current) {
      console.warn("Google Maps Places API not loaded");
      return;
    }

    const ac = new g.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name"]
    });
    
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place?.geometry?.location;
      if (loc) {
        const lng = loc.lng();
        const lat = loc.lat();
        onPick?.({ lng, lat, name: place.name || "Unknown location" });
      }
    });

    return () => {
      // Cleanup autocomplete listeners if needed
      // Note: Google Maps API cleanup is handled automatically
    };
  }, [onPick]);

  if (!window.google?.maps?.places) {
    return (
      <Input
        placeholder="Google Places API loading..."
        disabled
        className={className}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      className={className}
    />
  );
}