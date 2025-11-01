import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances';
  angle: number;
}

const CIRCLES = [
  { id: 'family', label: 'Family', radius: 80, color: '#22c55e' },
  { id: 'friends', label: 'Close Friends', radius: 140, color: '#22c55e' },
  { id: 'business', label: 'Business Partners', radius: 200, color: '#22c55e' },
  { id: 'acquaintances', label: 'Acquaintances', radius: 260, color: '#22c55e' },
];

export default function NetworkVisualization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Initialize with sample data for demonstration
    initializeSampleNetwork();
  }, [user, navigate]);

  const initializeSampleNetwork = () => {
    // Sample network for visualization
    const samplePeople: NetworkPerson[] = [
      { id: '1', name: 'Mom', circle: 'family', angle: 45 },
      { id: '2', name: 'Dad', circle: 'family', angle: 135 },
      { id: '3', name: 'Sister', circle: 'family', angle: 225 },
      { id: '4', name: 'Best Friend', circle: 'friends', angle: 30 },
      { id: '5', name: 'College Friend', circle: 'friends', angle: 120 },
      { id: '6', name: 'Gym Buddy', circle: 'friends', angle: 210 },
      { id: '7', name: 'Co-founder', circle: 'business', angle: 60 },
      { id: '8', name: 'Investor', circle: 'business', angle: 150 },
      { id: '9', name: 'Mentor', circle: 'business', angle: 240 },
      { id: '10', name: 'Neighbor', circle: 'acquaintances', angle: 90 },
      { id: '11', name: 'Old Classmate', circle: 'acquaintances', angle: 180 },
    ];
    setPeople(samplePeople);
  };

  const handleCircleClick = (circleId: string, event: React.MouseEvent<SVGCircleElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setSelectedCircle(circleId);
    setClickPosition({ x, y });
  };

  const handleAddPerson = (circleName: string) => {
    if (!selectedCircle) return;

    const newPerson: NetworkPerson = {
      id: Date.now().toString(),
      name: circleName,
      circle: selectedCircle as NetworkPerson['circle'],
      angle: Math.random() * 360,
    };

    setPeople([...people, newPerson]);
    setSelectedCircle(null);
    setClickPosition(null);
  };

  const getPersonPosition = (person: NetworkPerson) => {
    const circle = CIRCLES.find(c => c.id === person.circle);
    if (!circle) return { x: 0, y: 0 };
    
    const radius = circle.radius;
    const angle = (person.angle * Math.PI) / 180;
    const x = 300 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);
    
    return { x, y };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-primary text-xl">Loading your network...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold iridescent-text">Your Network</h1>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 overflow-x-auto">
          <svg
            viewBox="0 0 600 600"
            className="w-full max-w-3xl mx-auto"
            style={{ minHeight: '600px' }}
          >
            {/* Concentric circles */}
            {CIRCLES.map((circle) => (
              <g key={circle.id}>
                <circle
                  cx="300"
                  cy="300"
                  r={circle.radius}
                  fill="none"
                  stroke={circle.color}
                  strokeWidth="2"
                  opacity="0.3"
                  className="cursor-pointer hover:opacity-60 transition-opacity"
                  onClick={(e) => handleCircleClick(circle.id, e)}
                />
                <text
                  x="300"
                  y={300 - circle.radius - 10}
                  textAnchor="middle"
                  fill={circle.color}
                  fontSize="12"
                  fontWeight="600"
                  opacity="0.8"
                >
                  {circle.label}
                </text>
              </g>
            ))}

            {/* Center dot (user) with glow effect */}
            <g>
              <circle
                cx="300"
                cy="300"
                r="12"
                fill="#22c55e"
                filter="url(#glow)"
              />
              <circle
                cx="300"
                cy="300"
                r="8"
                fill="#15803d"
              />
              <text
                x="300"
                y="335"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="14"
                fontWeight="700"
              >
                You
              </text>
            </g>

            {/* Network people */}
            {people.map((person) => {
              const pos = getPersonPosition(person);
              return (
                <g key={person.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="6"
                    fill="#22c55e"
                    className="cursor-pointer transition-all"
                    filter="url(#glow)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 20}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="10"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {person.name}
                  </text>
                </g>
              );
            })}

            {/* Add buttons on circles */}
            {CIRCLES.map((circle) => (
              <g
                key={`add-${circle.id}`}
                className="cursor-pointer"
                onClick={(e) => handleCircleClick(circle.id, e as any)}
              >
                <circle
                  cx={300 + circle.radius}
                  cy="300"
                  r="12"
                  fill="#22c55e"
                  opacity="0.6"
                  className="hover:opacity-100 transition-opacity"
                />
                <text
                  x={300 + circle.radius}
                  y="305"
                  textAnchor="middle"
                  fill="#000"
                  fontSize="16"
                  fontWeight="700"
                  className="pointer-events-none"
                >
                  +
                </text>
              </g>
            ))}

            {/* Glow filter */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Tap any circle or the + button to add a person to that relationship level</p>
            <p className="mt-1">Green dots represent people in your network</p>
            <p className="mt-1 text-primary font-semibold">Total connections: {people.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
