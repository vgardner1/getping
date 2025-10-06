import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToPrivacy) {
      toast({
        variant: 'destructive',
        title: 'Privacy Policy Required',
        description: 'Please agree to our Privacy Policy to continue.'
      });
      return;
    }
    
    setLoading(true);
    
const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          instagram_handle: instagramHandle,
          linkedin_url: linkedinUrl,
          phone_number: phoneNumber
        }
      }
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message
      });
    } else {
      // If user is created and confirmed immediately, update profile with additional data
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link to complete your registration.'
        });
      } else if (data.user) {
        // User is immediately confirmed, update profile
        await supabase
          .from('profiles')
          .update({
            instagram_handle: instagramHandle,
            linkedin_url: linkedinUrl,
            phone_number: phoneNumber
          })
          .eq('user_id', data.user.id);
        
        toast({
          title: 'Account created successfully!',
          description: 'Welcome to ping!!'
        });
        navigate('/');
      }
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (!agreedToPrivacy) {
      toast({
        variant: 'destructive',
        title: 'Privacy Policy Required',
        description: 'Please agree to our Privacy Policy to continue.'
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { redirect_to: window.location.origin }
      });
      
      if (error) throw error;
      
      if (data?.authUrl) {
        // Redirect at top-level to avoid Google X-Frame-Options
        if (window.top) {
          window.top.location.href = data.authUrl;
        } else {
          window.location.href = data.authUrl;
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign Up Error',
        description: error.message || 'Failed to initiate Google sign up'
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold iridescent-text">
            Join Ping
          </CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

            <div className="flex items-start space-x-2 mt-4 p-3 border rounded-lg bg-muted/50">
              <Checkbox
                id="privacy-agreement"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                className="mt-0.5"
              />
              <div className="text-sm leading-relaxed">
                <Label htmlFor="privacy-agreement" className="cursor-pointer">
                  I agree to Ping's{' '}
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  {' '}and understand how my data will be used to enhance my networking experience through AI-powered profile generation and social media integration.
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full shimmer bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={loading || !agreedToPrivacy}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
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
            disabled={loading || !agreedToPrivacy}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center space-y-4">
<Link
              to="/auth"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Already have an account? Sign in
            </Link>
            
            <div className="text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                ← Back to main site
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;