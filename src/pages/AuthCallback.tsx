import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StarField } from "@/components/StarField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let redirectTimeout: ReturnType<typeof setTimeout> | undefined;

    const handleRedirect = () => {
      const hash = window.location.hash || '';
      const profileUrl = new URL('/profile', window.location.origin);
      // Preserve auth hash if present so Supabase can parse tokens on next page
      if (hash && /access_token|refresh_token/.test(hash)) {
        profileUrl.hash = hash.startsWith('#') ? hash.slice(1) : hash;
      }

      const target = profileUrl.toString();

      // Try to exit iframe and redirect top-level (important for iOS Safari storage restrictions)
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = target;
          return;
        }
      } catch {}

      // Fallbacks
      try {
        window.location.replace(target);
      } catch {
        navigate('/profile', { replace: true });
      }
    };

    const processAuth = async () => {
      try {
        // Parse hash parameters - critical for mobile Safari
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.slice(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            
            if (!error) {
              setSignedIn(true);
              setChecking(false);
              return;
            }
          }
        }

        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setChecking(false);
          return;
        }

        if (session) {
          setSignedIn(true);
          setChecking(false);
        } else {
          // Wait for auth to complete
          redirectTimeout = setTimeout(() => {
            setChecking(false);
          }, 8000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed');
        setChecking(false);
      }
    };

    // Listen for session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (redirectTimeout) clearTimeout(redirectTimeout);
        handleRedirect();
      }
    });
    unsub = () => listener.subscription.unsubscribe();

    // Start processing
    processAuth();

    return () => {
      unsub?.();
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  const retry = () => {
    const hash = window.location.hash || '';
    const url = new URL('/profile', window.location.origin);
    if (hash && /access_token|refresh_token/.test(hash)) {
      url.hash = hash.startsWith('#') ? hash.slice(1) : hash;
    }
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = url.toString();
        return;
      }
    } catch {}
    window.location.replace(url.toString());
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <StarField />
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold iridescent-text">
            {checking ? "Verifying your email…" : error ? "Verification issue" : "Almost there"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {checking ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-primary rounded-full border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {error
                  ? "We couldn't complete verification automatically. Please try again."
                  : "Click continue if you aren't redirected automatically."}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={retry} className="w-full">Continue</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
