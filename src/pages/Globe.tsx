import { useRef } from "react";
import Globe3D, { flyTo, type GlobePin } from "@/components/Globe3D";
import GlobeSearch from "@/components/GlobeSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobePage() {
  const viewerRef = useRef<any>(null);

  const handleSearchPick = ({ lng, lat }: { lng: number; lat: number }) => {
    // Access the viewer instance through the Globe3D component
    // This is a simplified approach - in a production app you might want to use refs or context
    const globeContainer = document.querySelector('.cesium-viewer');
    if (globeContainer && (window as any).Cesium) {
      // Find the viewer instance
      const viewer = (globeContainer as any)?._cesiumWidget?.viewer || 
                     (globeContainer as any)?._viewer;
      if (viewer) {
        flyTo(viewer, lng, lat, 12000, 1.2);
      }
    }
  };

  const handlePinClick = (pin: GlobePin) => {
    console.log("Pin clicked:", pin);
    // Handle pin interactions here - could open profiles, chat, etc.
  };

  const samplePins: GlobePin[] = [
    { lng: -71.094, lat: 42.3601, label: "MIT", id: "mit" },
    { lng: -71.119, lat: 42.377, label: "Harvard", id: "harvard" },
    { lng: -71.089, lat: 42.339, label: "Northeastern", id: "neu" },
    { lng: -122.4194, lat: 37.7749, label: "San Francisco", id: "sf" },
    { lng: -74.0059, lat: 40.7128, label: "New York", id: "nyc" },
    { lng: 2.3522, lat: 48.8566, label: "Paris", id: "paris" },
    { lng: 139.6917, lat: 35.6895, label: "Tokyo", id: "tokyo" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">3D Globe Explorer</CardTitle>
            <p className="text-muted-foreground">
              Interactive 3D globe powered by Google Photorealistic 3D Tiles and Cesium
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <GlobeSearch 
                onPick={handleSearchPick}
                placeholder="Search for places, cities, landmarks..."
                className="max-w-md"
              />
            </div>
            
            <div className="w-full h-[80vh] rounded-lg overflow-hidden border">
              <Globe3D
                start={{ lng: -71.09, lat: 42.36, height: 16000 }}
                showPins={samplePins}
                onPinClick={handlePinClick}
                className="w-full h-full"
                apiKey={(window as any).GOOGLE_MAPS_API_KEY}
              />
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground space-y-2">
              <p>• Drag to rotate the globe</p>
              <p>• Scroll to zoom in/out</p>
              <p>• Click on pins to interact</p>
              <p>• Use search to fly to any location</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}