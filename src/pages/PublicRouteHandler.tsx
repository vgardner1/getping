import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicPing from "./PublicPing";
import PublicProfileDetails from "./PublicProfileDetails";
import { supabase } from "@/integrations/supabase/client";

const PublicRouteHandler = () => {
  const { userId, view } = useParams<{ userId: string; view?: string }>();
  const navigate = useNavigate();
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

  useEffect(() => {
    const validateUser = async () => {
      if (!userId) {
        setIsValidUser(false);
        return;
      }

      try {
        console.log('Validating user:', userId);
        console.log('Network info:', {
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType || 'unknown'
        });

        // Check if user exists by trying to fetch their public profile
        const { data, error } = await supabase.rpc(
          'get_public_profile_secure',
          { target_user_id: userId }
        );

        if (error) {
          console.error('Error validating user:', error);
          setIsValidUser(false);
          return;
        }

        if (data && data.length > 0) {
          setIsValidUser(true);
        } else {
          setIsValidUser(false);
        }
      } catch (error) {
        console.error('Network error validating user:', error);
        setIsValidUser(false);
      }
    };

    validateUser();
  }, [userId]);

  if (isValidUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isValidUser === false) {
    navigate('/404', { replace: true });
    return null;
  }

  // Route to appropriate component based on view parameter
  if (view === 'details') {
    return <PublicProfileDetails />;
  }

  return <PublicPing />;
};

export default PublicRouteHandler;