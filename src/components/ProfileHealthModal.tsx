import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface ProfileHealthModalProps {
  person: any;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  position?: { x: number; y: number }; // Screen position to float near
}

interface HealthData {
  overall: number;
  recency: number;
  frequency: number;
  reciprocity: number;
  sentiment: number;
  tenure: number;
}

export const ProfileHealthModal = ({ person, isOpen, onClose, userId, position }: ProfileHealthModalProps) => {
  const [healthData, setHealthData] = useState<HealthData>({
    overall: 0,
    recency: 0,
    frequency: 0,
    reciprocity: 0,
    sentiment: 0,
    tenure: 0
  });
  const [profileData, setProfileData] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingScore, setHasExistingScore] = useState(false);
  
  // Question answers
  const [lastContactDays, setLastContactDays] = useState('');
  const [monthlyTouchpoints, setMonthlyTouchpoints] = useState('');
  const [initiationBalance, setInitiationBalance] = useState('');
  const [interactionQuality, setInteractionQuality] = useState('');
  const [relationshipMonths, setRelationshipMonths] = useState('');

  useEffect(() => {
    if (person && isOpen) {
      loadHealthData();
      loadProfileData();
      setStep(0);
    }
  }, [person, isOpen]);

  const loadHealthData = async () => {
    if (!person) return;

    const { data } = await supabase
      .from('health_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', person.id)
      .single();

    if (data) {
      setHealthData({
        recency: data.recency_score || 0,
        frequency: data.frequency_score || 0,
        reciprocity: data.reciprocity_score || 0,
        sentiment: data.consistency_score || 0,
        tenure: 50,
        overall: data.score || 0
      });
      // If there's an existing score, skip questionnaire
      setHasExistingScore(data.score > 0);
    } else {
      setHasExistingScore(false);
    }
  };

  const loadProfileData = async () => {
    if (!person?.userId) return;

    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, bio')
      .eq('user_id', person.userId)
      .single();

    setProfileData(data);
  };

  const handleCalculate = async () => {
    setIsSaving(true);
    try {
      // Log interaction with the gathered data
      const days = parseInt(lastContactDays) || 0;
      const touchpoints = parseInt(monthlyTouchpoints) || 0;
      const balance = parseInt(initiationBalance) || 50;
      const quality = parseInt(interactionQuality) || 3;
      const months = parseInt(relationshipMonths) || 0;

      // Create an interaction record with metadata
      await supabase.from('interactions').insert({
        contact_id: person.id,
        type: 'message',
        date: new Date().toISOString().split('T')[0],
        direction: balance > 60 ? 'outgoing' : balance < 40 ? 'incoming' : 'mutual',
        quality_rating: quality,
        metadata: {
          days_since_last: days,
          monthly_touchpoints: touchpoints,
          initiation_balance: balance,
          relationship_months: months
        }
      });

      // Trigger backend health score calculation
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ahksxziueqkacyaqtgeu.supabase.co'}/functions/v1/calculate-health-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ userId, contactId: person.id })
      });

      if (!response.ok) throw new Error('Failed to calculate health score');

      // Reload health data
      await loadHealthData();
      toast('relationship health updated!');
      onClose();
    } catch (error) {
      console.error('Error calculating health scores:', error);
      toast('failed to update', { className: 'bg-destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'thriving', color: 'text-green-500' };
    if (score >= 60) return { label: 'strong', color: 'text-blue-500' };
    if (score >= 40) return { label: 'stable', color: 'text-yellow-500' };
    if (score >= 20) return { label: 'at-risk', color: 'text-orange-500' };
    return { label: 'dormant', color: 'text-red-500' };
  };

  const questions = [
    {
      title: 'when did you last connect?',
      subtitle: 'helps us measure recency (30%)',
      placeholder: 'days ago',
      value: lastContactDays,
      onChange: setLastContactDays,
      type: 'number'
    },
    {
      title: 'how often do you touch base?',
      subtitle: 'helps us measure frequency (25%)',
      placeholder: 'touchpoints per month',
      value: monthlyTouchpoints,
      onChange: setMonthlyTouchpoints,
      type: 'number'
    },
    {
      title: 'who usually reaches out?',
      subtitle: 'helps us measure reciprocity (20%)',
      placeholder: '0 (them) to 100 (you)',
      value: initiationBalance,
      onChange: setInitiationBalance,
      type: 'number'
    },
    {
      title: 'how are your interactions?',
      subtitle: 'helps us measure sentiment (15%)',
      placeholder: '1 (poor) to 5 (great)',
      value: interactionQuality,
      onChange: setInteractionQuality,
      type: 'number'
    },
    {
      title: 'how long have you known them?',
      subtitle: 'helps us measure tenure (10%)',
      placeholder: 'months',
      value: relationshipMonths,
      onChange: setRelationshipMonths,
      type: 'number'
    }
  ];

  const currentQuestion = questions[step];
  const overallStatus = getScoreLabel(healthData.overall);

  if (!isOpen) return null;

  // Show detailed breakdown if score already exists
  if (hasExistingScore && healthData.overall > 0) {
    return (
      <div 
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[380px] md:max-w-[420px] animate-scale-in"
      >
        <div className="relative overflow-hidden border border-primary/30 rounded-2xl bg-gradient-to-br from-background/40 via-primary/5 to-background/40 backdrop-blur-3xl shadow-2xl">
          {/* Glossy 3D effect overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(74,222,128,0.15),transparent_50%)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 hover:bg-primary/20 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative p-6 space-y-5">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/40 shadow-lg shadow-primary/20">
                <AvatarImage src={profileData?.avatar_url} />
                <AvatarFallback className="bg-primary/20 text-xl">
                  {person?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{profileData?.display_name || person?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {healthData.overall}
                  </span>
                  <span className={`text-sm font-semibold ${overallStatus.color}`}>
                    {overallStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Score Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Relationship Health Breakdown</h4>
              
              {/* Recency */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recency</span>
                  <span className="text-sm font-bold text-primary">{healthData.recency}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-primary/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 rounded-full"
                    style={{ width: `${healthData.recency}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">How recently you've connected</p>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Frequency</span>
                  <span className="text-sm font-bold text-primary">{healthData.frequency}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-primary/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 rounded-full"
                    style={{ width: `${healthData.frequency}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">How often you interact</p>
              </div>

              {/* Reciprocity */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reciprocity</span>
                  <span className="text-sm font-bold text-primary">{healthData.reciprocity}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-primary/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 rounded-full"
                    style={{ width: `${healthData.reciprocity}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Balance of give and take</p>
              </div>

              {/* Sentiment/Consistency */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quality</span>
                  <span className="text-sm font-bold text-primary">{healthData.sentiment}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-primary/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 rounded-full"
                    style={{ width: `${healthData.sentiment}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Interaction quality</p>
              </div>

              {/* Tenure */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tenure</span>
                  <span className="text-sm font-bold text-primary">{healthData.tenure}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-primary/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 rounded-full"
                    style={{ width: `${healthData.tenure}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Length of relationship</p>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={onClose}
              className="w-full bg-primary/20 hover:bg-primary/30 backdrop-blur"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show questionnaire for first time
  return (
    <div 
      className="fixed top-[12%] md:top-[15%] left-1/2 -translate-x-1/2 z-50 bg-gradient-to-br from-black/95 via-primary/5 to-black/95 border border-primary/30 rounded-xl p-4 md:p-6 w-[90%] max-w-[400px] shadow-2xl animate-scale-in touch-none"
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2 right-2 h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="h-12 w-12 border-2 border-primary/30">
          <AvatarImage src={profileData?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {person?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold text-base">{profileData?.display_name || person?.name}</h3>
          {healthData.overall > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black iridescent-text">{healthData.overall}</span>
              <span className={`text-xs font-semibold ${overallStatus.color}`}>{overallStatus.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Question Flow */}
      {step < questions.length ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">{currentQuestion.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{currentQuestion.subtitle}</p>
            <Input
              type={currentQuestion.type}
              placeholder={currentQuestion.placeholder}
              value={currentQuestion.value}
              onChange={(e) => currentQuestion.onChange(e.target.value)}
              className="bg-black/40 border-primary/20"
              autoFocus
            />
          </div>
          
          <div className="flex gap-2">
            {step > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                back
              </Button>
            )}
            <Button 
              onClick={() => setStep(step + 1)}
              className="flex-1"
            >
              {step === questions.length - 1 ? 'finish' : 'next'}
            </Button>
          </div>
          
          <div className="flex gap-1 justify-center mt-2">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === step ? 'bg-primary' : idx < step ? 'bg-primary/40' : 'bg-primary/10'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-center">calculating your relationship health...</p>
          <Button 
            onClick={handleCalculate}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'calculating...' : 'calculate score'}
          </Button>
        </div>
      )}
    </div>
  );
};
