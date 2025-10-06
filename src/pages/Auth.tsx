import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createChatWithUser } from '@/utils/chatUtils';
import { safeRedirect } from '@/lib/utils';
import { z } from 'zod';

// Input validation schemas
const emailSchema = z.string().email('Invalid email address').max(255, 'Email too long');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long');
const nameSchema = z.string().trim().min(1, 'Name is required').max(100, 'Name too long');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional().or(z.literal(''));
const urlSchema = z.string().url('Invalid URL').max(500, 'URL too long').optional().or(z.literal(''));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Process post-login intents (e.g., ping -> create conversation and redirect)
  const processPostLoginIntent = async (uid: string): Promise<boolean> => {
    try {
      const raw = localStorage.getItem('postLoginIntent');
      if (!raw) return false;
      const intent = JSON.parse(raw);
      if (intent?.type === 'ping' && intent.targetUserId) {
        const conversationId = await createChatWithUser(intent.targetUserId, uid);
        localStorage.removeItem('postLoginIntent');
        navigate(`/chat/${conversationId}?to=${intent.targetUserId}`);
        return true;
      }
    } catch {}
    return false;
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const processed = await processPostLoginIntent(session.user.id);
        if (!processed) {
          navigate('/profile');
        }
      }
    };
    checkUser();
  }, [navigate]);

const handleSignUp = async () => {
  setLoading(true);

  // Validate inputs
  try {
    emailSchema.parse(email);
    passwordSchema.parse(password);
    nameSchema.parse(displayName);
    if (phoneNumber) phoneSchema.parse(phoneNumber);
    if (linkedinUrl) urlSchema.parse(linkedinUrl);
  } catch (error) {
    if (error instanceof z.ZodError) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: error.errors[0].message,
      });
      setLoading(false);
      return;
    }
  }

  const redirectUrl = `${window.location.origin}/auth/callback`;
  const normalizedEmail = email.trim().toLowerCase();

  const nameParts = displayName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: displayName.trim(),
        name: displayName.trim(),
        display_name: displayName.trim(),
        instagram_handle: instagramHandle.trim(),
        linkedin_url: linkedinUrl.trim(),
        phone_number: phoneNumber.trim(),
      },
    },
  });

  if (error) {
    toast({
      variant: 'destructive',
      title: 'Sign Up Error',
      description: error.message,
    });
  } else {
    if (data.user && data.user.email_confirmed_at) {
      // Immediately confirmed accounts: ensure profile row has latest metadata
      await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          instagram_handle: instagramHandle,
          linkedin_url: linkedinUrl,
          phone_number: phoneNumber,
        })
        .eq('user_id', data.user.id);

      toast({ title: 'Account created!', description: 'Redirecting to setup…' });
      navigate('/profile-setup');
    } else {
      toast({
        title: 'Confirm your email',
        description:
          'We sent a confirmation link. After confirming, you’ll be redirected to profile setup.',
      });
      setIsLogin(true);
      setShowResend(true);
    }
  }
  setLoading(false);
};

const handleSignIn = async () => {
  setLoading(true);
  
  // Validate inputs
  try {
    emailSchema.parse(email);
    passwordSchema.parse(password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: error.errors[0].message,
      });
      setLoading(false);
      return;
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    const msg = error.message || 'Sign in failed';
    const unconfirmed = msg.toLowerCase().includes('email not confirmed');
    if (unconfirmed) {
      toast({
        title: 'Verifying your account…',
        description: 'Finishing verification and signing you in.',
      });
      try {
        const { error: confirmError } = await supabase.functions.invoke('confirm-user', {
          body: { email: normalizedEmail },
        });
        if (confirmError) {
          throw confirmError;
        }
        // retry sign-in immediately
        const retry = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (retry.error) {
          setShowResend(true);
          toast({
            variant: 'destructive',
            title: 'Email not confirmed',
            description: 'Please click the link we sent or resend below.',
          });
        } else {
          const processed = await processPostLoginIntent(retry.data.user!.id);
          if (!processed) navigate('/profile');
        }
      } catch (e) {
        setShowResend(true);
        toast({
          variant: 'destructive',
          title: 'Verification failed',
          description: 'Please use the email link or resend below.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: msg,
      });
    }
  } else {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (user) {
      // Backfill auth display name if missing
      const hasFullName = typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim().length > 0;
      if (!hasFullName) {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('display_name, first_name, last_name')
          .eq('user_id', user.id)
          .single();
        const computedFullName = (profileRow?.display_name && profileRow.display_name.trim().length > 0)
          ? profileRow.display_name
          : [profileRow?.first_name, profileRow?.last_name].filter(Boolean).join(' ').trim();
        if (computedFullName) {
          await supabase.auth.updateUser({ data: { full_name: computedFullName } });
        }
      }
      const processed = await processPostLoginIntent(user.id);
      if (!processed) navigate('/profile');
    } else {
      navigate('/profile');
    }
  }
  setLoading(false);
};

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Call our custom Google OAuth edge function
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { redirect_to: window.location.origin }
      });
      
      if (error) throw error;
      
      if (data?.authUrl) {
        safeRedirect(data.authUrl);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In Error',
        description: error.message || 'Failed to initiate Google sign in'
      });
      setLoading(false);
    }
};

const handleResend = async () => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    toast({
      variant: 'destructive',
      title: 'Email required',
      description: 'Enter your email above to resend the confirmation link.',
    });
    return;
  }
  setResending(true);
  const { error } = await supabase.auth.resend({ type: 'signup', email: normalizedEmail });
  if (error) {
    toast({
      variant: 'destructive',
      title: 'Resend failed',
      description: error.message,
    });
  } else {
    toast({
      title: 'Confirmation email sent',
      description: 'Check your inbox (and spam) for the new link.',
    });
  }
  setResending(false);
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (isLogin) {
    handleSignIn();
  } else {
    handleSignUp();
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Sign up to get started'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramHandle">Instagram Handle</Label>
                  <Input
                    id="instagramHandle"
                    type="text"
                    placeholder="@yourusername"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? (isLogin ? 'Signing In...' : 'Signing Up...') 
                : (isLogin ? 'Sign In' : 'Sign Up')
              }
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

{showResend && (
  <div className="mt-4 text-center">
    <p className="text-sm text-muted-foreground mb-2">
      Didn't get the email? Resend the confirmation link.
    </p>
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={handleResend}
      disabled={resending || !email}
    >
      {resending ? 'Resending...' : 'Resend confirmation email'}
    </Button>
  </div>
)}

<div className="mt-6 text-center">
  <button
    type="button"
    onClick={() => setIsLogin(!isLogin)}
    className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
  >
    {isLogin 
      ? "Don't have an account? Sign up" 
      : 'Already have an account? Sign in'
    }
  </button>
</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;