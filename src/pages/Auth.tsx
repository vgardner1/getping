import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/profile');
      }
    };
    checkUser();
  }, [navigate]);

const handleSignUp = async () => {
  setLoading(true);

  const redirectUrl = `${window.location.origin}/profile-setup`;
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        display_name: displayName,
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
    toast({
      title: 'Confirm your email',
      description:
        'We sent a confirmation link. After confirming, you’ll be redirected to profile setup.',
    });
    setIsLogin(true);
    setShowResend(true);
  }
  setLoading(false);
};

const handleSignIn = async () => {
  setLoading(true);
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    const msg = error.message || 'Sign in failed';
    const unconfirmed = msg.toLowerCase().includes('email not confirmed');
    if (unconfirmed) {
      setShowResend(true);
      toast({
        title: 'Please confirm your email',
        description: 'Check your inbox for the confirmation link or resend it below.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: msg,
      });
    }
  } else {
    navigate('/profile');
  }
  setLoading(false);
};

  const handleGoogleAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile-setup`
      }
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In Error',
        description: error.message
      });
      setLoading(false);
    }
    // Note: loading state will be managed by redirect
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
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
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
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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