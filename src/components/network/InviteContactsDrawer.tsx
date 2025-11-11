import { useState } from 'react';
import { MessageCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessagesInvite from '@/components/onboarding/MessagesInvite';
import ManualInviteInput from '@/components/onboarding/ManualInviteInput';

type InviteMethod = 'messages' | 'manual' | null;

export const InviteContactsDrawer = () => {
  const [selectedMethod, setSelectedMethod] = useState<InviteMethod>(null);

  if (selectedMethod === 'messages') {
    return (
      <MessagesInvite 
        onBack={() => setSelectedMethod(null)} 
        skipSuccessNavigation 
      />
    );
  }

  if (selectedMethod === 'manual') {
    return (
      <ManualInviteInput 
        onBack={() => setSelectedMethod(null)}
        skipSuccessNavigation
      />
    );
  }

  return (
    <div className="min-h-[400px] bg-transparent px-6 py-6">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        Invite Contacts
      </h2>

      {/* Primary Option: Messages */}
      <button
        onClick={() => setSelectedMethod('messages')}
        className="w-full bg-gradient-to-br from-primary/90 to-primary rounded-2xl p-6 mb-4 shadow-lg active:scale-98 transition-transform hover:from-primary hover:to-primary/90"
      >
        <div className="text-4xl mb-3">💬</div>
        <div className="text-white text-lg font-semibold mb-2">
          Text Your Circle
        </div>
        <div className="text-primary-foreground/80 text-sm">
          Open Messages to invite multiple people
        </div>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-sm">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Secondary Option: Manual Entry */}
      <button
        onClick={() => setSelectedMethod('manual')}
        className="w-full text-left p-4 border border-border rounded-xl active:bg-accent transition-colors hover:bg-accent/50"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-foreground font-medium">Add Individually</div>
            <div className="text-muted-foreground text-sm">Enter contacts manually</div>
          </div>
        </div>
      </button>

      {/* Hint */}
      <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-lg mt-6">
        <span className="text-xl">💡</span>
        <span className="text-sm text-muted-foreground">
          Invite 3-5 people to build your circle
        </span>
      </div>
    </div>
  );
};
