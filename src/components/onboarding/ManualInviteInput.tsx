import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePendingInvites } from '@/hooks/usePendingInvites';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface ManualInviteInputProps {
  onBack: () => void;
}

export default function ManualInviteInput({ onBack }: ManualInviteInputProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const { createPendingInvites, loading } = usePendingInvites();

  const handleAddContact = () => {
    if (!currentInput.trim()) return;

    const isEmail = currentInput.includes('@');
    const isPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(currentInput);

    if (!isEmail && !isPhone) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid phone number or email",
        variant: "destructive"
      });
      return;
    }

    const newContact: Contact = {
      id: Math.random().toString(36).substring(7),
      [isEmail ? 'email' : 'phone']: currentInput.trim(),
    };

    setContacts([...contacts, newContact]);
    setCurrentInput('');
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleSendInvites = async () => {
    if (contacts.length === 0) return;

    const success = await createPendingInvites(contacts);
    
    if (success) {
      navigate(`/onboarding/success?method=manual&count=${contacts.length}`);
    } else {
      toast({
        title: "Error",
        description: "Failed to send invites. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-4">
      <button 
        onClick={onBack}
        className="text-primary text-base mb-4"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-foreground mb-6">
        Add to Circle
      </h2>

      <div className="mb-6">
        <Input
          type="text"
          name="contact"
          autoComplete="tel"
          placeholder="Name or phone number"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAddContact();
          }}
          className="mb-3"
        />
        
        {currentInput.trim() && (
          <Button
            onClick={handleAddContact}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Add to List
          </Button>
        )}

        {contacts.length === 0 && !currentInput && (
          <p className="text-muted-foreground text-sm text-center mt-4">
            Tap to add your first contact
          </p>
        )}
      </div>

      {contacts.length > 0 && (
        <>
          <div className="h-px bg-border my-6" />

          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">
              Added ({contacts.length}):
            </p>
            
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between p-3 bg-accent rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      {contact.name && (
                        <div className="font-medium text-foreground">
                          {contact.name}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {contact.phone || contact.email}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-muted-foreground hover:text-destructive text-sm"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            className="text-primary text-sm mb-6 w-full text-center py-2"
          >
            + Add another
          </button>

          <Button
            onClick={handleSendInvites}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Sending...' : `Send ${contacts.length} Invite${contacts.length > 1 ? 's' : ''}`}
          </Button>
        </>
      )}
    </div>
  );
}
