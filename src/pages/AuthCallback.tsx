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

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let redirectTimeout: ReturnType<typeof setTimeout> | undefined;
    let pollInterval: ReturnType<typeof setInterval> | undefined;

    const tryParseHashAndSetSession = async () => {
      try {
        const hash = window.location.hash || '';
        if (hash.startsWith('#')) {
          const params = new URLSearchParams(hash.slice(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (!error && data.session) {
              navigate('/profile', { replace: true });
              return true;
            }
          }
        }
      } catch (e) {
        console.warn('Could not parse auth hash:', e);
      }
      return false;
    };

    // Listen for session updates (supabase-js parses tokens from URL automatically)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (redirectTimeout) clearTimeout(redirectTimeout);
        if (pollInterval) clearInterval(pollInterval);
        navigate('/profile', { replace: true });
      }
    });
    unsub = () => listener.subscription.unsubscribe();

    // Initial check or parse hash
    (async () => {
      const parsed = await tryParseHashAndSetSession();
      if (parsed) return;

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        setError(error.message);
        setChecking(false);
        return;
      }
      if (data.session) {
        navigate('/profile', { replace: true });
        return;
      }

      // Start a short poll (10s) to wait for Supabase to finish parsing URL hash
      let attempts = 0;
      pollInterval = setInterval(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          clearInterval(pollInterval!);
          navigate('/profile', { replace: true });
        } else if (++attempts >= 20) {
          clearInterval(pollInterval!);
          setChecking(false);
        }
      }, 500);

      // Safety timeout in case polling never resolves
      redirectTimeout = setTimeout(() => {
        setChecking(false);
      }, 12000);
    })();

    return () => {
      unsub?.();
      if (redirectTimeout) clearTimeout(redirectTimeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [navigate]);

  const retry = async () => {
    setChecking(true);
    setError(null);
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Retry session error:", error);
      setError(error.message);
      setChecking(false);
    } else if (data.session) {
      navigate("/profile", { replace: true });
    } else {
      setChecking(false);
    }
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
