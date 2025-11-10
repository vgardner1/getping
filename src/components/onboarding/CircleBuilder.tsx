import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MessagesInvite from './MessagesInvite';
import ManualInviteInput from './ManualInviteInput';

export default function CircleBuilder() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<'messages' | 'manual' | null>(null);

  const handleMessagesRoute = () => {
    setSelectedMethod('messages');
  };

  const handleManualRoute = () => {
    setSelectedMethod('manual');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (selectedMethod === 'messages') {
    return <MessagesInvite onBack={() => setSelectedMethod(null)} />;
  }
  
  if (selectedMethod === 'manual') {
    return <ManualInviteInput onBack={() => setSelectedMethod(null)} />;
  }

  return (
    <div className="min-h-screen bg-background px-6 py-4">
      <button 
        onClick={() => navigate(-1)}
        className="text-primary text-base mb-4"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-foreground mb-6">
        Build Your Circle
      </h2>

      <button
        onClick={handleMessagesRoute}
        className="w-full bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 mb-6 shadow-lg active:scale-[0.98] transition-transform"
      >
        <div className="text-5xl mb-3">💬</div>
        <div className="text-primary-foreground text-xl font-semibold mb-2">
          Text Your Circle
        </div>
        <div className="text-primary-foreground/80 text-sm">
          Invite multiple people at once
        </div>
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-sm">Or choose</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        onClick={handleManualRoute}
        className="w-full text-left p-4 border border-border rounded-xl mb-6 active:bg-accent"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <div className="text-foreground font-medium">Add Individually</div>
            <div className="text-muted-foreground text-sm">Enter names/phones</div>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg mb-6">
        <span className="text-xl">💡</span>
        <span className="text-sm text-primary">
          Best with 3-5 people in your circle
        </span>
      </div>

      <button
        onClick={handleSkip}
        className="text-muted-foreground text-sm w-full text-center py-3"
      >
        Skip for now →
      </button>
    </div>
  );
}
