import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

function generateInviteCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
  return phone;
}

export function usePendingInvites() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPendingInvites = async (contacts: Contact[]) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const inviteCode = generateInviteCode();
      
      const { data: inviteLink } = await supabase
        .from('invite_links')
        .insert({
          inviter_user_id: user.id,
          invite_code: inviteCode,
          invite_method: 'manual'
        })
        .select()
        .single();

      if (!inviteLink) throw new Error('Failed to create invite link');

      const invites = contacts.map(contact => ({
        inviter_user_id: user.id,
        invite_link_id: inviteLink.id,
        invitee_name: contact.name,
        invitee_phone: contact.phone ? formatPhone(contact.phone) : null,
        invitee_email: contact.email,
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('pending_invites')
        .insert(invites);

      if (insertError) throw insertError;

      await sendInvites(contacts, inviteCode);

      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          invite_method: 'manual',
          invites_sent: contacts.length
        });

      return true;

    } catch (err: any) {
      console.error('Error creating pending invites:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendInvites = async (contacts: Contact[], inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

    for (const contact of contacts) {
      if (contact.phone) {
        const smsBody = `Join my circle on Ping! ${inviteUrl}`;
        window.location.href = `sms:${contact.phone}&body=${encodeURIComponent(smsBody)}`;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (contact.email) {
        const subject = 'Join my Ping circle';
        const body = `Hi! I'd like to add you to my circle on Ping.\n\nJoin here: ${inviteUrl}`;
        window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  return {
    createPendingInvites,
    loading,
    error
  };
}
