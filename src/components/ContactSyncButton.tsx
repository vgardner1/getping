import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useContactSync } from '@/hooks/useContactSync';
import { ContactPickerModal } from '@/components/ContactPickerModal';

export function ContactSyncButton() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(true);
  const { 
    pickContacts, 
    syncing, 
    contacts, 
    showContactPicker, 
    setShowContactPicker,
    importSelectedContacts,
    toggleContact,
    toggleAll
  } = useContactSync();

  // Check if Contact Picker API is supported
  useEffect(() => {
    if (!('contacts' in navigator)) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    const error = searchParams?.get('error');
    const synced = searchParams?.get('synced');
    const imported = searchParams?.get('imported');

    if (imported) {
      const count = parseInt(imported);
      toast({
        title: "Contacts Imported!",
        description: `Successfully imported ${count} contact${count !== 1 ? 's' : ''} from Google.`,
      });
      navigate('/contacts', { replace: true });
    } else if (synced) {
      const count = parseInt(synced);
      toast({
        title: "Contacts Synced!",
        description: `Successfully synced ${count} contact${count !== 1 ? 's' : ''}.`,
      });
      navigate('/contacts', { replace: true });
    } else if (error) {
      let errorMessage = 'Failed to sync contacts. Please try again.';
      if (error === 'no-file') errorMessage = 'No contacts file received.';
      if (error === 'no-contacts') errorMessage = 'No valid contacts found in file.';
      if (error === 'oauth_cancelled') errorMessage = 'Google import was cancelled.';
      if (error === 'contacts_fetch_failed') errorMessage = 'Failed to fetch contacts from Google.';
      if (error === 'user_not_found') errorMessage = 'Please sign in again to import contacts.';
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive"
      });
      navigate('/contacts', { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const handleImport = async () => {
    const selectedContacts = contacts.filter(c => c.selected);
    await importSelectedContacts(selectedContacts);
  };

  return (
    <>
      <div className="space-y-4">
        {!isSupported && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <p className="text-sm text-destructive">
              ⚠️ Contact Picker API not available on this device.
              {navigator.userAgent.includes('iPhone') && (
                <span className="block mt-2">
                  On iOS: Settings → Safari → Advanced → Feature Flags → Enable "Contact Picker API"
                </span>
              )}
            </p>
          </div>
        )}

        <Button
          onClick={pickContacts}
          disabled={syncing || !isSupported}
          variant="default"
          size="lg"
          className="w-full rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          {syncing ? 'Importing...' : '📱 Import from Contacts'}
        </Button>

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold block mb-2">Supported on:</span>
            <span className="block">✅ Android (Chrome, Samsung Internet, Opera)</span>
            <span className="block">⚠️ iOS (Safari - requires manual flag enable)</span>
            <span className="block">❌ Desktop browsers</span>
          </p>
        </div>
      </div>

      <ContactPickerModal
        open={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        contacts={contacts}
        onToggle={toggleContact}
        onToggleAll={toggleAll}
        onImport={handleImport}
        syncing={syncing}
      />
    </>
  );
}
