import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  lat: number;
  lng: number;
  userId?: string;
}

interface HealthMetrics {
  lastInteractionAt?: Date;
  msgsSent30d?: number;
  msgsRecv30d?: number;
  calls30d?: number;
  callMinutes30d?: number;
  meetings30d?: number;
  streakDays?: number;
  sentiment30d?: number;
}

interface RelationshipHealthPanelProps {
  person: NetworkPerson | null;
  onClose: () => void;
  onHealthChange?: (personId: string, score: number) => void;
}

function calculateHealthScore(circle: string, metrics: HealthMetrics) {
  const daysSinceLast = metrics.lastInteractionAt 
    ? Math.floor((Date.now() - metrics.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  
  const recencyScore = Math.max(0, 100 - (daysSinceLast * 3));
  const frequencyScore = Math.min(100, ((metrics.msgsSent30d || 0) + (metrics.msgsRecv30d || 0)) * 2);
  const depthScore = Math.min(100, ((metrics.calls30d || 0) * 15) + ((metrics.meetings30d || 0) * 20));
  const consistencyScore = Math.min(100, (metrics.streakDays || 0) * 3.33);
  
  const weights = { recency: 0.35, frequency: 0.25, depth: 0.25, consistency: 0.15 };
  const healthScore = 
    recencyScore * weights.recency +
    frequencyScore * weights.frequency +
    depthScore * weights.depth +
    consistencyScore * weights.consistency;

  return { healthScore, subMetrics: { recencyScore, frequencyScore, depthScore, consistencyScore } };
}

export function RelationshipHealthPanel({ person, onClose, onHealthChange }: RelationshipHealthPanelProps) {
  const [metricsCache, setMetricsCache] = useState<Map<string, HealthMetrics>>(new Map());
  const [editableMetrics, setEditableMetrics] = useState<HealthMetrics>({
    lastInteractionAt: new Date(),
    msgsSent30d: 0,
    msgsRecv30d: 0,
    calls30d: 0,
    callMinutes30d: 0,
    meetings30d: 0,
    streakDays: 0,
    sentiment30d: 0.5,
  });

  useEffect(() => {
    if (!person) return;

    const cached = metricsCache.get(person.id);
    if (cached) {
      setEditableMetrics(cached);
    } else {
      const newMetrics: HealthMetrics = {
        lastInteractionAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        msgsSent30d: Math.floor(Math.random() * 50),
        msgsRecv30d: Math.floor(Math.random() * 50),
        calls30d: Math.floor(Math.random() * 10),
        callMinutes30d: Math.floor(Math.random() * 200),
        meetings30d: Math.floor(Math.random() * 8),
        streakDays: Math.floor(Math.random() * 30),
        sentiment30d: 0.5 + Math.random() * 0.5,
      };
      setEditableMetrics(newMetrics);
      setMetricsCache(prev => new Map(prev).set(person.id, newMetrics));
    }
  }, [person?.id]);

  if (!person) return null;

  const { healthScore } = calculateHealthScore(person.circle, editableMetrics);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'hsl(var(--primary))';
    if (score >= 40) return 'hsl(45, 93%, 55%)';
    return 'hsl(0, 84%, 60%)';
  };

  return (
    <Card className="p-3 bg-black/90 backdrop-blur-xl border-primary/30 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-foreground truncate flex-1">{person.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 hover:bg-primary/10 flex-shrink-0 ml-2"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Compact Health Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Relationship Health</span>
          <span className="font-bold text-sm" style={{ color: getScoreColor(healthScore) }}>
            {Math.round(healthScore)}
          </span>
        </div>
        <div className="relative">
          <Progress value={healthScore} className="h-2" />
          <div 
            className="absolute top-0 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${healthScore}%`,
              backgroundColor: getScoreColor(healthScore),
              boxShadow: `0 0 8px ${getScoreColor(healthScore)}`,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
