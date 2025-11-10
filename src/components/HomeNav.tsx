import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Plus, Circle } from 'lucide-react';

export const HomeNav = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <header className="border-b border-border/30 backdrop-blur z-50 bg-black/80">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Title */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent animate-shimmer">
          visualize your circle
        </h1>

        {/* Right: Circle Visualization Button and Profile Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/network/visualize')}
            className="h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all relative"
            title="Visualize your circle"
          >
            <Circle className="h-5 w-5 text-primary" />
            <Plus className="h-3 w-3 text-primary absolute inset-0 m-auto" />
          </Button>
          
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
