import { NavLink } from "react-router-dom";
import { Users, PlaySquare, Search, MessageCircle, User } from "lucide-react";

export const BottomNav = () => {
  const items = [
    { to: "/feed", label: "Feed", icon: PlaySquare },
    { to: "/network", label: "Tribe", icon: Users },
    { to: "/chat", label: "Chat", icon: MessageCircle },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const getCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center p-3 rounded-md transition-colors ${
      isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 w-[min(640px,92%)] bg-card/90 backdrop-blur border border-border rounded-2xl shadow-lg px-2 py-2">
      <ul className="flex items-center justify-between">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} className={getCls} aria-label={label}>
              <Icon className="h-6 w-6" />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
