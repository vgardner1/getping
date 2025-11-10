import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InviteLink {
  invite_code: string;
  url: string;
}

export function useInviteLink() {
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInviteCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const generateInviteLink = async (method: 'sms' | 'manual' | 'qr') => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let inviteCode = generateInviteCode();
      let attempts = 0;

      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('invite_links')
          .select('id')
          .eq('invite_code', inviteCode)
          .maybeSingle();

        if (!existing) break;
        
        inviteCode = generateInviteCode();
        attempts++;
      }

      const { data, error: insertError } = await supabase
        .from('invite_links')
        .insert({
          inviter_user_id: user.id,
          invite_code: inviteCode,
          invite_method: method,
          expires_at: null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const link: InviteLink = {
        invite_code: inviteCode,
        url: `${window.location.origin}/join/${inviteCode}`
      };

      setInviteLink(link);
      return link;

    } catch (err: any) {
      console.error('Error generating invite link:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteLink,
    loading,
    error,
    generateInviteLink
  };
}
