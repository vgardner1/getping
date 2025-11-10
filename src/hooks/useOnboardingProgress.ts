import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingProgress {
  onboarding_completed: boolean;
  circle_built: boolean;
  invite_method: string | null;
  invites_sent: number;
}

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProgress(data);
    } catch (err) {
      console.error('Error loading onboarding progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          ...updates
        });

      await loadProgress();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  return {
    progress,
    loading,
    updateProgress,
    refresh: loadProgress
  };
}
