import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function JoinCircle() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [inviter, setInviter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inviteCode) {
      loadInviteData();
    }
  }, [inviteCode]);

  const loadInviteData = async () => {
    try {
      const { data: inviteLink, error: linkError } = await supabase
        .from('invite_links')
        .select('inviter_user_id, expires_at')
        .eq('invite_code', inviteCode)
        .maybeSingle();

      if (linkError || !inviteLink) {
        setError('Invalid invite link');
        return;
      }

      if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
        setError('This invite link has expired');
        return;
      }

      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .eq('user_id', inviteLink.inviter_user_id)
        .maybeSingle();

      setInviter(inviterProfile);
    } catch (err) {
      console.error('Error loading invite:', err);
      setError('Failed to load invite');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && inviter) {
      await createConnection(user.id);
    } else {
      localStorage.setItem('pending_invite', inviteCode || '');
      navigate(`/signin?invite=${inviteCode}`);
    }
  };

  const createConnection = async (userId: string) => {
    try {
      await supabase.from('connections').insert([
        {
          user_id: userId,
          target_user_id: inviter.user_id,
          status: 'active',
          source: 'invite'
        },
        {
          user_id: inviter.user_id,
          target_user_id: userId,
          status: 'active',
          source: 'invite'
        }
      ]);

      await supabase
        .from('pending_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('inviter_user_id', inviter.user_id)
        .eq('status', 'pending');

      navigate('/dashboard?welcomed=true');
    } catch (err) {
      console.error('Error creating connection:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error}
          </h1>
          <Button onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        You're Invited!
      </h1>

      <div className="bg-card rounded-2xl shadow-lg p-8 mb-8 max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 mx-auto mb-4 flex items-center justify-center text-primary-foreground text-3xl font-bold">
          {inviter?.avatar_url ? (
            <img src={inviter.avatar_url} alt={inviter.display_name} className="w-full h-full rounded-full object-cover" />
          ) : (
            inviter?.display_name?.[0]?.toUpperCase() || '?'
          )}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          {inviter?.display_name || 'Someone'}
        </h2>

        <p className="text-muted-foreground mb-6">
          invited you to join their Ping circle
        </p>

        <Button
          onClick={handleJoin}
          className="w-full"
          size="lg"
        >
          Join Circle
        </Button>
      </div>

      <a
        href="/"
        className="text-primary text-sm"
      >
        Learn more about Ping
      </a>
    </div>
  );
}
