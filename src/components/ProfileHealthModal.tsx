import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileHealthModalProps {
  person: any;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface HealthScores {
  recency: number;
  frequency: number;
  reciprocity: number;
  sentiment: number;
  tenure: number;
  overall: number;
}

export const ProfileHealthModal = ({ person, isOpen, onClose, userId }: ProfileHealthModalProps) => {
  const [healthScores, setHealthScores] = useState<HealthScores>({
    recency: 0,
    frequency: 0,
    reciprocity: 0,
    sentiment: 0,
    tenure: 0,
    overall: 0
  });
  const [profileData, setProfileData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (person && isOpen) {
      loadHealthScores();
      loadProfileData();
    }
  }, [person, isOpen]);

  const loadHealthScores = async () => {
    if (!person) return;

    const { data } = await supabase
      .from('health_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', person.id)
      .single();

    if (data) {
      setHealthScores({
        recency: data.recency_score || 0,
        frequency: data.frequency_score || 0,
        reciprocity: data.reciprocity_score || 0,
        sentiment: data.consistency_score || 0, // Using consistency field for sentiment
        tenure: 50, // Default tenure score
        overall: data.score || 0
      });
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

  const handleScoreChange = (factor: keyof Omit<HealthScores, 'overall'>, value: number[]) => {
    setHealthScores(prev => {
      const newScores = { ...prev, [factor]: value[0] };
      
      // Recalculate overall with 5-factor model weights
      newScores.overall = Math.round(
        newScores.recency * 0.30 +
        newScores.frequency * 0.25 +
        newScores.reciprocity * 0.20 +
        newScores.sentiment * 0.15 +
        newScores.tenure * 0.10
      );
      
      return newScores;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase.from('health_scores').upsert({
        user_id: userId,
        contact_id: person.id,
        recency_score: healthScores.recency,
        frequency_score: healthScores.frequency,
        reciprocity_score: healthScores.reciprocity,
        consistency_score: healthScores.sentiment,
        score: healthScores.overall,
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,contact_id'
      });

      toast('Health scores updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving health scores:', error);
      toast('Failed to update health scores', { className: 'bg-destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Thriving', color: 'text-green-500' };
    if (score >= 60) return { label: 'Strong', color: 'text-blue-500' };
    if (score >= 40) return { label: 'Stable', color: 'text-yellow-500' };
    if (score >= 20) return { label: 'At-Risk', color: 'text-orange-500' };
    return { label: 'Dormant', color: 'text-red-500' };
  };

  const overallStatus = getScoreLabel(healthScores.overall);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-black/95 via-primary/5 to-black/95 border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl iridescent-text">relationship health</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4 pb-4 border-b border-primary/20">
            <Avatar className="h-16 w-16 border-2 border-primary/30">
              <AvatarImage src={profileData?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {person?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{profileData?.display_name || person?.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{person?.circle}</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-4xl font-black iridescent-text">{healthScores.overall}</div>
            <div className={`text-sm font-semibold ${overallStatus.color}`}>{overallStatus.label}</div>
          </div>

          {/* Health Factors */}
          <div className="space-y-4">
            {/* Recency (30%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Recency <span className="text-muted-foreground">(30%)</span></span>
                <span className="text-primary">{healthScores.recency}</span>
              </div>
              <Slider
                value={[healthScores.recency]}
                onValueChange={(v) => handleScoreChange('recency', v)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Frequency (25%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Frequency <span className="text-muted-foreground">(25%)</span></span>
                <span className="text-primary">{healthScores.frequency}</span>
              </div>
              <Slider
                value={[healthScores.frequency]}
                onValueChange={(v) => handleScoreChange('frequency', v)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Reciprocity (20%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Reciprocity <span className="text-muted-foreground">(20%)</span></span>
                <span className="text-primary">{healthScores.reciprocity}</span>
              </div>
              <Slider
                value={[healthScores.reciprocity]}
                onValueChange={(v) => handleScoreChange('reciprocity', v)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Sentiment (15%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Sentiment <span className="text-muted-foreground">(15%)</span></span>
                <span className="text-primary">{healthScores.sentiment}</span>
              </div>
              <Slider
                value={[healthScores.sentiment]}
                onValueChange={(v) => handleScoreChange('sentiment', v)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Tenure (10%) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Tenure <span className="text-muted-foreground">(10%)</span></span>
                <span className="text-primary">{healthScores.tenure}</span>
              </div>
              <Slider
                value={[healthScores.tenure]}
                onValueChange={(v) => handleScoreChange('tenure', v)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-primary/20">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
