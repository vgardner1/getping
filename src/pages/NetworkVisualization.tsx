import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Circle } from 'lucide-react';
import { Network3D } from '@/components/Network3D';
import { NetworkGlobe } from '@/components/NetworkGlobe';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChatList } from '@/components/ChatList';
import { MessageCircle } from 'lucide-react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances';
  angle: number;
  lat: number;
  lng: number;
  userId?: string;
}

export default function NetworkVisualization() {
  const navigate = useNavigate();
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [viewMode, setViewMode] = useState<'chats' | 'circles' | 'globe'>('chats');

  useEffect(() => {
    // Initialize with sample data for demonstration
    initializeSampleNetwork();
  }, []);

  const initializeSampleNetwork = () => {
    // Sample network for visualization - dots evenly distributed globally
    const samplePeople: NetworkPerson[] = [
      // Northern Hemisphere - spread across different longitudes
      { id: '1', name: 'Mom', circle: 'family', angle: 0, lat: 40.7128, lng: -74.0060 }, // New York
      { id: '2', name: 'Dad', circle: 'family', angle: 90, lat: 51.5074, lng: -0.1278 }, // London
      { id: '3', name: 'Sister', circle: 'family', angle: 180, lat: 48.8566, lng: 2.3522 }, // Paris
      { id: '4', name: 'Brother', circle: 'family', angle: 270, lat: 35.6762, lng: 139.6503 }, // Tokyo
      
      // Mid-latitude spread
      { id: '5', name: 'Best Friend', circle: 'friends', angle: 30, lat: 37.7749, lng: -122.4194 }, // San Francisco
      { id: '6', name: 'College Friend', circle: 'friends', angle: 90, lat: 55.7558, lng: 37.6173 }, // Moscow
      { id: '7', name: 'Gym Buddy', circle: 'friends', angle: 150, lat: 52.5200, lng: 13.4050 }, // Berlin
      { id: '8', name: 'Roommate', circle: 'friends', angle: 210, lat: 25.2048, lng: 55.2708 }, // Dubai
      { id: '9', name: 'Childhood Friend', circle: 'friends', angle: 270, lat: 1.3521, lng: 103.8198 }, // Singapore
      { id: '10', name: 'Travel Buddy', circle: 'friends', angle: 330, lat: 19.4326, lng: -99.1332 }, // Mexico City
      
      // Southern Hemisphere - balanced distribution
      { id: '11', name: 'Co-founder', circle: 'business', angle: 45, lat: -23.5505, lng: -46.6333 }, // São Paulo
      { id: '12', name: 'Investor', circle: 'business', angle: 135, lat: -33.8688, lng: 151.2093 }, // Sydney
      { id: '13', name: 'Mentor', circle: 'business', angle: 225, lat: -34.6037, lng: -58.3816 }, // Buenos Aires
      { id: '14', name: 'Business Partner', circle: 'business', angle: 315, lat: -26.2041, lng: 28.0473 }, // Johannesburg
      
      // Arctic/tropical mix for global coverage
      { id: '15', name: 'Client', circle: 'business', angle: 90, lat: 59.3293, lng: 18.0686 }, // Stockholm
      { id: '16', name: 'Neighbor', circle: 'acquaintances', angle: 60, lat: -41.2865, lng: 174.7762 }, // Wellington
      { id: '17', name: 'Old Classmate', circle: 'acquaintances', angle: 120, lat: 13.7563, lng: 100.5018 }, // Bangkok
      { id: '18', name: 'Coffee Shop Regular', circle: 'acquaintances', angle: 180, lat: 30.0444, lng: 31.2357 }, // Cairo
      { id: '19', name: 'Book Club Member', circle: 'acquaintances', angle: 240, lat: 39.9042, lng: 116.4074 }, // Beijing
      { id: '20', name: 'Dog Park Friend', circle: 'acquaintances', angle: 300, lat: 37.5665, lng: 126.9780 }, // Seoul
    ];
    setPeople(samplePeople);
  };

  const handlePersonClick = (person: NetworkPerson) => {
    console.log('Person clicked:', person);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-primary/10 bg-card/90 backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-4xl font-bold iridescent-text">visualize your circle</h1>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'chats' | 'circles' | 'globe')} className="flex-1 flex flex-col w-full h-full pt-20">
        <TabsContent value="chats" className="flex-1 m-0 h-full">
          <ChatList />
        </TabsContent>
        
        <TabsContent value="circles" className="flex-1 m-0 h-full">
          <Network3D people={people} onPersonClick={handlePersonClick} />
        </TabsContent>
        
        <TabsContent value="globe" className="flex-1 m-0 h-full">
          <NetworkGlobe people={people} onPersonClick={handlePersonClick} />
        </TabsContent>

        {/* View toggle at bottom */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <TabsList className="bg-card/95 backdrop-blur border border-border">
            <TabsTrigger value="chats" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="circles" className="gap-2">
              <Circle className="h-4 w-4" />
              Circles
            </TabsTrigger>
            <TabsTrigger value="globe" className="gap-2">
              <Globe className="h-4 w-4" />
              Globe
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
