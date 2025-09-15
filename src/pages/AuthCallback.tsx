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

    // Listen for session updates (supabase-js parses tokens from URL automatically)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/profile-setup", { replace: true });
      }
    });

    unsub = () => listener.subscription.unsubscribe();

    // Initial check in case session is already set
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError(error.message);
      }
      if (data.session) {
        navigate("/profile-setup", { replace: true });
      } else {
        setChecking(false);
      }
    });

    return () => {
      unsub?.();
    };
  }, [navigate]);

  const retry = async () => {
    setChecking(true);
    setError(null);
    const { data, error } = await supabase.auth.getSession();
    if (error) setError(error.message);
    if (data.session) {
      navigate("/profile-setup", { replace: true });
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
                <Button variant="outline" onClick={() => navigate('/account-setup')} className="w-full">
                  I already paid – create account
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
