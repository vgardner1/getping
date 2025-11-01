import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Network3D } from '@/components/Network3D';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances';
  angle: number;
  userId?: string;
}

export default function NetworkVisualization() {
  const navigate = useNavigate();
  const [people, setPeople] = useState<NetworkPerson[]>([]);

  useEffect(() => {
    // Initialize with sample data for demonstration
    initializeSampleNetwork();
  }, []);

  const initializeSampleNetwork = () => {
    // Sample network for visualization with more connections
    const samplePeople: NetworkPerson[] = [
      // Family circle
      { id: '1', name: 'Mom', circle: 'family', angle: 0 },
      { id: '2', name: 'Dad', circle: 'family', angle: 90 },
      { id: '3', name: 'Sister', circle: 'family', angle: 180 },
      { id: '4', name: 'Brother', circle: 'family', angle: 270 },
      
      // Friends circle
      { id: '5', name: 'Best Friend', circle: 'friends', angle: 30 },
      { id: '6', name: 'College Friend', circle: 'friends', angle: 90 },
      { id: '7', name: 'Gym Buddy', circle: 'friends', angle: 150 },
      { id: '8', name: 'Roommate', circle: 'friends', angle: 210 },
      { id: '9', name: 'Childhood Friend', circle: 'friends', angle: 270 },
      { id: '10', name: 'Travel Buddy', circle: 'friends', angle: 330 },
      
      // Business circle
      { id: '11', name: 'Co-founder', circle: 'business', angle: 45 },
      { id: '12', name: 'Investor', circle: 'business', angle: 135 },
      { id: '13', name: 'Mentor', circle: 'business', angle: 225 },
      { id: '14', name: 'Business Partner', circle: 'business', angle: 315 },
      { id: '15', name: 'Client', circle: 'business', angle: 90 },
      
      // Acquaintances circle
      { id: '16', name: 'Neighbor', circle: 'acquaintances', angle: 60 },
      { id: '17', name: 'Old Classmate', circle: 'acquaintances', angle: 120 },
      { id: '18', name: 'Coffee Shop Regular', circle: 'acquaintances', angle: 180 },
      { id: '19', name: 'Book Club Member', circle: 'acquaintances', angle: 240 },
      { id: '20', name: 'Dog Park Friend', circle: 'acquaintances', angle: 300 },
    ];
    setPeople(samplePeople);
  };

  const handlePersonClick = (person: NetworkPerson) => {
    console.log('Person clicked:', person);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold iridescent-text">Your Network</h1>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Network3D people={people} onPersonClick={handlePersonClick} />
        </div>
      </div>
    </div>
  );
}
