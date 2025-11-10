import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method');
  const count = searchParams.get('count');

  useEffect(() => {
    markOnboardingComplete();
  }, []);

  const markOnboardingComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: user.id,
        onboarding_completed: true,
        circle_built: true,
        invite_method: method,
        invites_sent: method === 'messages' ? 0 : parseInt(count || '0'),
        completed_at: new Date().toISOString()
      });
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleAddMore = () => {
    navigate('/onboarding/circle');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-6 animate-bounce">
        ✓
      </div>

      <h1 className="text-3xl font-bold text-foreground text-center mb-4">
        Invites Sent!
      </h1>

      <p className="text-base text-muted-foreground text-center max-w-sm mb-8">
        We'll notify you when people join your circle
      </p>

      <div className="bg-primary/10 rounded-lg p-4 mb-8 w-full max-w-sm">
        <div className="text-sm text-foreground mb-1">
          <span className="font-medium">Sent via:</span> {method === 'messages' ? 'Messages' : 'Manual Entry'}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Estimated:</span> {method === 'messages' ? '3-5 people' : `${count} people`}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full max-w-sm mb-4"
        size="lg"
      >
        Continue to App
      </Button>

      <button
        onClick={handleAddMore}
        className="text-primary text-sm py-3"
      >
        + Add more people
      </button>
    </div>
  );
}
