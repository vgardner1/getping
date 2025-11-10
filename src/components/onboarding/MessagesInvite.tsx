import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useInviteLink } from '@/hooks/useInviteLink';

interface MessagesInviteProps {
  onBack: () => void;
  skipSuccessNavigation?: boolean;
}

export default function MessagesInvite({ onBack, skipSuccessNavigation = false }: MessagesInviteProps) {
  const navigate = useNavigate();
  const { generateInviteLink, inviteLink, loading } = useInviteLink();
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    generateInviteLink('sms');
  }, []);

  useEffect(() => {
    if (skipSuccessNavigation) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasOpened) {
        setTimeout(() => {
          navigate('/onboarding/success?method=messages');
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasOpened, navigate, skipSuccessNavigation]);

  const handleOpenMessages = () => {
    if (!inviteLink) return;

    const inviteUrl = inviteLink.url;
    const messageText = `Join my circle on Ping! ${inviteUrl}`;
    
    const smsUrl = `sms:&body=${encodeURIComponent(messageText)}`;
    window.location.href = smsUrl;

    setHasOpened(true);
  };

  const handleManualFallback = () => {
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Preparing your invite link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] bg-transparent px-6 py-6">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        Text Your Circle
      </h2>

      <div className="text-7xl text-center mb-8">💬</div>

      <p className="text-base text-muted-foreground text-center mb-8 max-w-sm mx-auto">
        We'll open Messages with a link ready to send to your circle
      </p>

      <Button
        onClick={handleOpenMessages}
        disabled={!inviteLink}
        className="w-full mb-6"
        size="lg"
      >
        Open Messages
      </Button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-sm">After sending</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-xl">↩️</span>
          <span className="text-muted-foreground text-sm">Return to Ping</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">🔔</span>
          <span className="text-muted-foreground text-sm">
            We'll notify you when they join
          </span>
        </div>
      </div>

      <button
        onClick={handleManualFallback}
        className="w-full text-center text-primary text-sm py-3"
      >
        Try Manual Entry Instead
      </button>
    </div>
  );
}
