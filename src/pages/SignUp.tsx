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