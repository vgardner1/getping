import { NavLink } from "react-router-dom";
import { Users, PlaySquare, Search, MessageCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const BottomNav = () => {
  const { user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadMessageCount();
    }
  }, [user]);

  const fetchUnreadMessageCount = async () => {
    if (!user) return;
    try {
      // Get last read timestamps from localStorage
      const lastReadKey = `lastRead_${user.id}`;
      const lastReadStr = localStorage.getItem(lastReadKey);
      const lastRead = lastReadStr ? new Date(lastReadStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get all conversations for the user
      const { data: conversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      
      if (conversations && conversations.length > 0) {
        // Count unread messages since last read
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversations.map(c => c.conversation_id))
          .neq('sender_id', user.id)
          .gte('created_at', lastRead.toISOString());
        
        setUnreadMessageCount(count || 0);
      }
    } catch (error) {
      console.warn('Could not fetch unread message count:', error);
    }
  };

  const items = [
    { to: "/feed", label: "feed", icon: PlaySquare },
    { to: "/network", label: "tribe", icon: Users },
    { to: "/network/visualize", label: "network", icon: Search },
    { to: "/chat", label: "chat", icon: MessageCircle, hasNotification: unreadMessageCount > 0 },
    { to: "/profile", label: "profile", icon: User },
  ];

  const getCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center p-3 rounded-md transition-colors ${
      isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 w-[min(480px,88%)] bg-card/90 backdrop-blur border border-border rounded-2xl shadow-lg px-2 py-1.5">
      <ul className="flex items-center justify-between">
        {items.map(({ to, label, icon: Icon, hasNotification }) => (
          <li key={to} className="flex-1">
            <NavLink 
              to={to} 
              className={getCls} 
              aria-label={label}
              onClick={() => {
                if (to === '/chat' && user) {
                  // Mark messages as read when clicking chat
                  const lastReadKey = `lastRead_${user.id}`;
                  localStorage.setItem(lastReadKey, new Date().toISOString());
                  setUnreadMessageCount(0);
                }
              }}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />

                {hasNotification && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
