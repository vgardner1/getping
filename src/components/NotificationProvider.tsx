import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setupContactRequestNotifications, setupMessageNotifications } from "@/lib/notifications";
import { useAuth } from "@/hooks/useAuth";

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time notifications
    const contactChannel = setupContactRequestNotifications(user.id, supabase);
    const messageChannel = setupMessageNotifications(user.id, supabase);

    return () => {
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id]);

  return <>{children}</>;
};
