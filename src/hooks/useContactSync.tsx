import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ContactData {
  name: string;
  phone?: string;
  email?: string;
  selected?: boolean;
}

export const useContactSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const parseVCard = (vCardText: string) => {
    const contacts: Array<{ name: string; phone?: string; email?: string }> = [];
    const vCards = vCardText.split('BEGIN:VCARD');
    
    for (const vCard of vCards) {
      if (!vCard.trim()) continue;
      
      let name = '';
      let phone = '';
      let email = '';
      
      const lines = vCard.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('FN:')) {
          name = trimmed.substring(3);
        } else if (trimmed.startsWith('TEL')) {
          const phoneMatch = trimmed.match(/:([\d\s\-\+\(\)]+)/);
          if (phoneMatch) phone = phoneMatch[1].replace(/\s/g, '');
        } else if (trimmed.startsWith('EMAIL')) {
          const emailMatch = trimmed.match(/:(.+@.+)/);
          if (emailMatch) email = emailMatch[1];
        }
      }
      
      if (name && (phone || email)) {
        contacts.push({ name, phone: phone || undefined, email: email || undefined });
      }
    }
    
    return contacts;
  };

  const syncFromFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to sync contacts.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSyncing(true);

      const text = await file.text();
      const contacts = parseVCard(text);

      if (contacts.length === 0) {
        toast({
          title: "No Contacts Found",
          description: "The file doesn't contain valid contact information.",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const contact of contacts) {
        try {
          const { error } = await (supabase as any)
            .from('contacts')
            .insert({
              user_id: user.id,
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              source: 'file_import',
              first_contact_date: new Date().toISOString().split('T')[0],
            });

          if (error) {
            console.error('Error inserting contact:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error processing contact:', err);
          errorCount++;
        }
      }

      toast({
        title: "Contacts Imported!",
        description: `Successfully imported ${successCount} contact${successCount !== 1 ? 's' : ''}${errorCount > 0 ? `. ${errorCount} failed.` : '.'}`,
      });

    } catch (error: any) {
      console.error('Contact import error:', error);
      
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const pickContacts = useCallback(async () => {
    try {
      // Check if the Contact Picker API is available
      if (!('contacts' in navigator)) {
        toast({
          title: "Not Supported",
          description: "Contact Picker API is not available on this device.",
          variant: "destructive"
        });
        return;
      }

      const props = ['name', 'tel', 'email'];
      const opts = { multiple: true };
      
      // @ts-ignore - ContactsManager API types
      const selectedContacts = await navigator.contacts.select(props, opts);
      
      if (!selectedContacts || selectedContacts.length === 0) {
        toast({
          title: "No Contacts Selected",
          description: "Please select at least one contact to import.",
        });
        return;
      }

      const formattedContacts: ContactData[] = selectedContacts.map((contact: any) => ({
        name: contact.name?.[0] || 'Unknown',
        phone: contact.tel?.[0] || '',
        email: contact.email?.[0] || '',
        selected: true
      }));

      setContacts(formattedContacts);
      setShowContactPicker(true);
      
      toast({
        title: "Contacts Selected",
        description: `${formattedContacts.length} contact(s) ready to import.`,
      });
    } catch (error: any) {
      console.error('Error picking contacts:', error);
      
      if (error.name === 'AbortError') {
        // User cancelled the picker
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to access contacts. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const triggerFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vcf,.vcard';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const parsedContacts = parseVCard(text);
        const formattedContacts = parsedContacts.map(c => ({ ...c, selected: true }));
        setContacts(formattedContacts);
        setShowContactPicker(true);
      }
    };
    input.click();
  }, []);

  const importSelectedContacts = useCallback(async (selectedContacts: ContactData[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to sync contacts.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSyncing(true);

      let successCount = 0;
      let errorCount = 0;

      for (const contact of selectedContacts) {
        if (!contact.selected) continue;

        try {
          const { error } = await (supabase as any)
            .from('contacts')
            .insert({
              user_id: user.id,
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              source: 'phone_import',
              first_contact_date: new Date().toISOString().split('T')[0],
            });

          if (error) {
            console.error('Error inserting contact:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error processing contact:', err);
          errorCount++;
        }
      }

      toast({
        title: "Contacts Imported!",
        description: `Successfully imported ${successCount} contact${successCount !== 1 ? 's' : ''}${errorCount > 0 ? `. ${errorCount} failed.` : '.'}`,
      });

      setShowContactPicker(false);
      setContacts([]);

    } catch (error: any) {
      console.error('Contact import error:', error);
      
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  }, [user, toast]);

  const toggleContact = useCallback((index: number) => {
    setContacts(prev => prev.map((c, i) => 
      i === index ? { ...c, selected: !c.selected } : c
    ));
  }, []);

  const toggleAll = useCallback((selected: boolean) => {
    setContacts(prev => prev.map(c => ({ ...c, selected })));
  }, []);

  return { 
    pickContacts, 
    syncing, 
    contacts, 
    showContactPicker, 
    setShowContactPicker,
    importSelectedContacts,
    toggleContact,
    toggleAll
  };
};
