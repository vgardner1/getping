import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { useToast } from "@/hooks/use-toast";

const AccountSetup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Account creation failed",
          description: error.message
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account created successfully!",
          description: "Welcome to ping! Let's set up your profile."
        });
        
        // Wait a moment for the auth state to update, then navigate
        setTimeout(() => {
          navigate('/profile-setup');
        }, 1000);
      }

    } catch (error) {
      console.error('Account setup error:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again or contact support."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWithoutEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Enter your email above first."
      });
      return;
    }
    if (!password) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Enter your password above first."
      });
      return;
    }

    setLoading(true);
    try {
      const { error: confirmError } = await supabase.functions.invoke('confirm-user', {
        body: { email: normalizedEmail }
      });
      if (confirmError) throw confirmError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      if (signInError) throw signInError;

      toast({
        title: 'Verified successfully',
        description: 'You are now signed in. Redirecting…'
      });
      navigate('/profile-setup');
    } catch (error: any) {
      console.error('Manual verify failed:', error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error?.message || 'Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <StarField />
      
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold iridescent-text">
            Create Your Account
          </CardTitle>
          <CardDescription>
            You've successfully paid! Now let's create your login credentials.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account & Continue"}
            </Button>
          </form>
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              If the email link doesn't open on campus Wi‑Fi, verify here.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={handleVerifyWithoutEmail}
              disabled={loading || !email || !password}
            >
              Verify without email (quick fix)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSetup;