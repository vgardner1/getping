import { useState, useEffect } from 'react';
import { X, Pin, PinOff, Phone, MessageCircle, Calendar, TrendingUp, Activity, Clock, Heart, Target, Sliders as SlidersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

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
  sentiment30d?: number; // 0-1 scale
}

interface RelationshipHealthPanelProps {
  person: NetworkPerson | null;
  onClose: () => void;
}

export function RelationshipHealthPanel({ person, onClose }: RelationshipHealthPanelProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showMetricSliders, setShowMetricSliders] = useState(false);
  const [contactGoal, setContactGoal] = useState(14); // Days between contacts
  const [callGoal, setCallGoal] = useState(60); // Minutes per month
  const [messageGoal, setMessageGoal] = useState(20); // Messages per month
  const { toast } = useToast();

  // Store metrics per person so they persist
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

  // Initialize or load metrics for the current person
  useEffect(() => {
    if (!person) return;

    // Check if we already have metrics for this person
    if (metricsCache.has(person.id)) {
      setEditableMetrics(metricsCache.get(person.id)!);
    } else {
      // Generate new metrics only once for this person
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
  }, [person?.id, metricsCache]);

  // Update cache whenever metrics change via sliders
  useEffect(() => {
    if (person && editableMetrics.msgsSent30d !== 0) {
      setMetricsCache(prev => new Map(prev).set(person.id, editableMetrics));
    }
  }, [editableMetrics, person?.id]);

  if (!person) return null;


  // Use editable metrics for calculations
  const { healthScore, subMetrics, nextStep } = calculateHealthScore(person.circle, editableMetrics);

  // Mock trend data for sparkline
  const trendData = Array.from({ length: 12 }, (_, i) => 
    Math.max(20, Math.min(100, healthScore + (Math.random() - 0.5) * 30))
  );

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'hsl(142, 76%, 50%)'; // vibrant green
    if (score >= 40) return 'hsl(45, 93%, 55%)'; // vibrant yellow
    return 'hsl(0, 84%, 60%)'; // vibrant red
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'from-green-500 via-green-400 to-emerald-500';
    if (score >= 40) return 'from-yellow-500 via-yellow-400 to-amber-500';
    return 'from-red-500 via-red-400 to-rose-500';
  };

  const getMetricColor = (value: number) => {
    if (value >= 70) return 'text-green-500';
    if (value >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMetricBg = (value: number) => {
    if (value >= 70) return 'bg-green-500/10 border-green-500/30';
    if (value >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const handleGoalUpdate = () => {
    toast({
      title: "Goals Updated",
      description: "Your relationship goals have been saved.",
    });
  };

  const updateMetric = (key: keyof HealthMetrics, value: number | Date) => {
    setEditableMetrics(prev => ({ ...prev, [key]: value }));
  };

  const getDaysSinceLastInteraction = () => {
    if (!editableMetrics.lastInteractionAt) return 0;
    return Math.floor((Date.now() - editableMetrics.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ${
        person ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Relationship Health</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPinned(!isPinned)}
              className="hover:bg-primary/10"
            >
              {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-primary/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Person Info */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">{person.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{person.circle}</p>
        </div>

        {/* Health Score Ring */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-40 h-40">
              {/* Gradient Ring */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={getScoreColor(healthScore)}
                  strokeWidth="12"
                  strokeDasharray={`${(healthScore / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  style={{
                    filter: 'drop-shadow(0 0 8px currentColor)',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold bg-gradient-to-br ${getScoreGradient(healthScore)} bg-clip-text text-transparent`}>
                    {Math.round(healthScore)}
                  </div>
                  <div className="text-xs text-muted-foreground">Health Score</div>
                </div>
              </div>
            </div>

            {/* Sparkline Trend */}
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>12-month trend</span>
                <TrendingUp className="h-3 w-3" />
              </div>
              <div className="h-12 w-full">
                <svg className="w-full h-full" viewBox="0 0 240 48" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke={getScoreColor(healthScore)}
                    strokeWidth="2"
                    points={trendData
                      .map((value, index) => `${(index / (trendData.length - 1)) * 240},${48 - (value / 100) * 48}`)
                      .join(' ')}
                  />
                  <polyline
                    fill={`url(#gradient-${person.id})`}
                    points={`0,48 ${trendData
                      .map((value, index) => `${(index / (trendData.length - 1)) * 240},${48 - (value / 100) * 48}`)
                      .join(' ')} 240,48`}
                    opacity="0.2"
                  />
                  <defs>
                    <linearGradient id={`gradient-${person.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={getScoreColor(healthScore)} />
                      <stop offset="100%" stopColor={getScoreColor(healthScore)} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* Goal Setting Sliders */}
        {showGoals && (
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur border-primary/20 space-y-4 animate-in slide-in-from-top">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <SlidersIcon className="h-4 w-4" />
              Set Your Goals
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Contact Frequency</label>
                  <span className="font-semibold text-foreground">Every {contactGoal} days</span>
                </div>
                <Slider
                  value={[contactGoal]}
                  onValueChange={(value) => setContactGoal(value[0])}
                  min={1}
                  max={90}
                  step={1}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">How often you want to stay in touch</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Monthly Call Time</label>
                  <span className="font-semibold text-foreground">{callGoal} minutes</span>
                </div>
                <Slider
                  value={[callGoal]}
                  onValueChange={(value) => setCallGoal(value[0])}
                  min={0}
                  max={300}
                  step={15}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">Target call minutes per month</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Monthly Messages</label>
                  <span className="font-semibold text-foreground">{messageGoal} messages</span>
                </div>
                <Slider
                  value={[messageGoal]}
                  onValueChange={(value) => setMessageGoal(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">Target messages per month</p>
              </div>

              <Button 
                onClick={handleGoalUpdate}
                className="w-full"
                size="sm"
              >
                Save Goals
              </Button>
            </div>
          </Card>
        )}

        {/* Sub-Metrics */}
        <Card className="p-4 bg-card/50 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Key Metrics
            </h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMetricSliders(!showMetricSliders)}
                className="h-7 text-xs"
              >
                <SlidersIcon className="h-3 w-3 mr-1" />
                {showMetricSliders ? 'Hide' : 'Adjust'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGoals(!showGoals)}
                className="h-7 text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                {showGoals ? 'Hide' : 'Goals'}
              </Button>
            </div>
          </div>
          
          {Object.entries(subMetrics).map(([key, metric]) => (
            <div key={key} className={`space-y-2 p-3 rounded-lg border transition-all ${getMetricBg(metric.value)}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize font-medium">{key}</span>
                <span className={`font-bold text-lg ${getMetricColor(metric.value)}`}>
                  {Math.round(metric.value)}
                </span>
              </div>
              <div className="relative">
                <Progress value={metric.value} className="h-2" />
                <div 
                  className="absolute top-0 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${metric.value}%`,
                    background: metric.value >= 70 
                      ? 'linear-gradient(90deg, rgb(34, 197, 94), rgb(16, 185, 129))'
                      : metric.value >= 40
                      ? 'linear-gradient(90deg, rgb(234, 179, 8), rgb(245, 158, 11))'
                      : 'linear-gradient(90deg, rgb(239, 68, 68), rgb(244, 63, 94))',
                    boxShadow: metric.value >= 70
                      ? '0 0 10px rgba(34, 197, 94, 0.5)'
                      : metric.value >= 40
                      ? '0 0 10px rgba(234, 179, 8, 0.5)'
                      : '0 0 10px rgba(239, 68, 68, 0.5)',
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground italic">{metric.description}</p>
            </div>
          ))}
        </Card>

        {/* Metric Adjustment Sliders */}
        {showMetricSliders && (
          <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-blue-500/10 backdrop-blur border-purple-500/20 space-y-4 animate-in slide-in-from-top">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <SlidersIcon className="h-4 w-4" />
              Adjust Metrics
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Days Since Last Contact</label>
                  <span className="font-semibold text-foreground">{getDaysSinceLastInteraction()} days</span>
                </div>
                <Slider
                  value={[getDaysSinceLastInteraction()]}
                  onValueChange={(value) => {
                    const newDate = new Date(Date.now() - value[0] * 24 * 60 * 60 * 1000);
                    updateMetric('lastInteractionAt', newDate);
                  }}
                  min={0}
                  max={90}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Messages Sent (30d)</label>
                  <span className="font-semibold text-foreground">{editableMetrics.msgsSent30d || 0}</span>
                </div>
                <Slider
                  value={[editableMetrics.msgsSent30d || 0]}
                  onValueChange={(value) => updateMetric('msgsSent30d', value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Messages Received (30d)</label>
                  <span className="font-semibold text-foreground">{editableMetrics.msgsRecv30d || 0}</span>
                </div>
                <Slider
                  value={[editableMetrics.msgsRecv30d || 0]}
                  onValueChange={(value) => updateMetric('msgsRecv30d', value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Calls (30d)</label>
                  <span className="font-semibold text-foreground">{editableMetrics.calls30d || 0}</span>
                </div>
                <Slider
                  value={[editableMetrics.calls30d || 0]}
                  onValueChange={(value) => updateMetric('calls30d', value[0])}
                  min={0}
                  max={30}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Call Minutes (30d)</label>
                  <span className="font-semibold text-foreground">{editableMetrics.callMinutes30d || 0}</span>
                </div>
                <Slider
                  value={[editableMetrics.callMinutes30d || 0]}
                  onValueChange={(value) => updateMetric('callMinutes30d', value[0])}
                  min={0}
                  max={500}
                  step={15}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Meetings (30d)</label>
                  <span className="font-semibold text-foreground">{editableMetrics.meetings30d || 0}</span>
                </div>
                <Slider
                  value={[editableMetrics.meetings30d || 0]}
                  onValueChange={(value) => updateMetric('meetings30d', value[0])}
                  min={0}
                  max={20}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Streak Days</label>
                  <span className="font-semibold text-foreground">{editableMetrics.streakDays || 0}</span>
                </div>
                <Slider
                  value={[editableMetrics.streakDays || 0]}
                  onValueChange={(value) => updateMetric('streakDays', value[0])}
                  min={0}
                  max={365}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Next Step Suggestion */}
        <Card className={`p-4 bg-gradient-to-br ${getScoreGradient(healthScore)} border-2 relative overflow-hidden ${
          healthScore >= 70 ? 'border-green-500/50' : healthScore >= 40 ? 'border-yellow-500/50' : 'border-red-500/50'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm" />
          <div className="relative z-10">
            <h4 className={`font-semibold text-sm flex items-center gap-2 mb-3 ${
              healthScore >= 70 ? 'text-green-500' : healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              <Heart className="h-4 w-4" />
              Next Step
            </h4>
            <p className="text-sm text-foreground mb-4 font-medium">{nextStep}</p>
            <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <MessageCircle className="h-3 w-3 mr-1" />
              Message
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Calendar className="h-3 w-3 mr-1" />
              Meet
            </Button>
            </div>
          </div>
        </Card>

        {/* Interaction Stats */}
        <Card className="p-4 bg-card/50 backdrop-blur space-y-3">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1 p-2 rounded bg-card/30">
              <div className="text-muted-foreground">Messages sent</div>
              <div className="text-lg font-bold text-foreground">{editableMetrics.msgsSent30d}</div>
            </div>
            <div className="space-y-1 p-2 rounded bg-card/30">
              <div className="text-muted-foreground">Messages received</div>
              <div className="text-lg font-bold text-foreground">{editableMetrics.msgsRecv30d}</div>
            </div>
            <div className="space-y-1 p-2 rounded bg-card/30">
              <div className="text-muted-foreground">Calls (30d)</div>
              <div className="text-lg font-bold text-foreground">{editableMetrics.calls30d}</div>
            </div>
            <div className="space-y-1 p-2 rounded bg-card/30">
              <div className="text-muted-foreground">Call minutes</div>
              <div className="text-lg font-bold text-foreground">{editableMetrics.callMinutes30d}</div>
            </div>
            <div className="space-y-1 p-2 rounded bg-card/30">
              <div className="text-muted-foreground">Meetings (30d)</div>
              <div className="text-lg font-bold text-foreground">{editableMetrics.meetings30d}</div>
            </div>
            <div className="space-y-1 p-2 rounded bg-card/30">
              <div className="text-muted-foreground">Streak days</div>
              <div className="text-lg font-bold text-foreground">{editableMetrics.streakDays}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function calculateHealthScore(
  circle: string,
  metrics: HealthMetrics
): {
  healthScore: number;
  subMetrics: Record<string, { value: number; description: string }>;
  nextStep: string;
} {
  const now = Date.now();
  const daysSinceLastInteraction = metrics.lastInteractionAt
    ? (now - metrics.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24)
    : 30;

  // Normalize metrics to 0-100
  const recency = Math.max(0, 100 - daysSinceLastInteraction * 3.33); // 0 days = 100, 30 days = 0
  const frequency = Math.min(100, ((metrics.msgsSent30d || 0) + (metrics.msgsRecv30d || 0)) * 2);
  const reciprocity = (metrics.msgsSent30d && metrics.msgsRecv30d)
    ? Math.min(100, (Math.min(metrics.msgsSent30d, metrics.msgsRecv30d) / Math.max(metrics.msgsSent30d, metrics.msgsRecv30d)) * 100)
    : 50;
  const depth = Math.min(100, ((metrics.callMinutes30d || 0) / 2) + ((metrics.meetings30d || 0) * 10));
  const consistency = Math.min(100, (metrics.streakDays || 0) * 3.33);
  const responsiveness = Math.min(100, (metrics.msgsRecv30d || 0) * 2.5);
  const meetings = Math.min(100, (metrics.meetings30d || 0) * 12.5);

  let weights: Record<string, number>;
  let subMetrics: Record<string, { value: number; description: string }>;

  // Different weights by circle
  switch (circle) {
    case 'family':
      weights = {
        recency: 0.35,
        depth: 0.30,
        consistency: 0.25,
        frequency: 0.10,
      };
      subMetrics = {
        recency: { value: recency, description: `Last contact ${Math.round(daysSinceLastInteraction)} days ago` },
        depth: { value: depth, description: `${metrics.callMinutes30d || 0} call minutes this month` },
        consistency: { value: consistency, description: `${metrics.streakDays || 0}-day interaction streak` },
        frequency: { value: frequency, description: `${(metrics.msgsSent30d || 0) + (metrics.msgsRecv30d || 0)} messages exchanged` },
      };
      break;

    case 'friends':
      weights = {
        frequency: 0.35,
        reciprocity: 0.30,
        recency: 0.20,
        depth: 0.15,
      };
      subMetrics = {
        frequency: { value: frequency, description: `${(metrics.msgsSent30d || 0) + (metrics.msgsRecv30d || 0)} messages exchanged` },
        reciprocity: { value: reciprocity, description: 'Balanced back-and-forth communication' },
        recency: { value: recency, description: `Last contact ${Math.round(daysSinceLastInteraction)} days ago` },
        depth: { value: depth, description: `${metrics.callMinutes30d || 0} minutes in calls/meetings` },
      };
      break;

    case 'business':
      weights = {
        meetings: 0.35,
        responsiveness: 0.30,
        recency: 0.20,
        frequency: 0.15,
      };
      subMetrics = {
        meetings: { value: meetings, description: `${metrics.meetings30d || 0} meetings this month` },
        responsiveness: { value: responsiveness, description: 'Quick response rate' },
        recency: { value: recency, description: `Last contact ${Math.round(daysSinceLastInteraction)} days ago` },
        frequency: { value: frequency, description: `${(metrics.msgsSent30d || 0) + (metrics.msgsRecv30d || 0)} messages exchanged` },
      };
      break;

    default: // acquaintances, network, extended
      weights = {
        frequency: 0.40,
        recency: 0.35,
        reciprocity: 0.15,
        consistency: 0.10,
      };
      subMetrics = {
        frequency: { value: frequency, description: `${(metrics.msgsSent30d || 0) + (metrics.msgsRecv30d || 0)} messages exchanged` },
        recency: { value: recency, description: `Last contact ${Math.round(daysSinceLastInteraction)} days ago` },
        reciprocity: { value: reciprocity, description: 'Mutual engagement level' },
        consistency: { value: consistency, description: `${metrics.streakDays || 0}-day interaction streak` },
      };
  }

  // Calculate weighted score
  const healthScore = Object.entries(weights).reduce((sum, [key, weight]) => {
    const metricValue = key === 'recency' ? recency :
                       key === 'frequency' ? frequency :
                       key === 'reciprocity' ? reciprocity :
                       key === 'depth' ? depth :
                       key === 'consistency' ? consistency :
                       key === 'responsiveness' ? responsiveness :
                       key === 'meetings' ? meetings : 0;
    return sum + metricValue * weight;
  }, 0);

  // Generate next step suggestion
  let nextStep: string;
  if (daysSinceLastInteraction > 14) {
    nextStep = `It's been ${Math.round(daysSinceLastInteraction)} days—reach out today to reconnect!`;
  } else if (metrics.streakDays && metrics.streakDays > 0) {
    nextStep = `Keep your ${metrics.streakDays}-day streak alive! Send a quick message.`;
  } else if (circle === 'family' && (metrics.callMinutes30d || 0) < 60) {
    nextStep = 'Schedule a call this week to catch up properly.';
  } else if (circle === 'business' && (metrics.meetings30d || 0) === 0) {
    nextStep = 'Book a meeting to discuss ongoing projects.';
  } else if (reciprocity < 50) {
    nextStep = "They've been reaching out more—make sure to respond!";
  } else {
    nextStep = 'Relationship is healthy! Keep up the great communication.';
  }

  return { healthScore, subMetrics, nextStep };
}
