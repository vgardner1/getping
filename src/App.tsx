import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Welcome from "./pages/Welcome";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Index from "./pages/Index";
import ProfileSimple from "./pages/ProfileSimple";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import LearnMore from "./pages/LearnMore";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import DamChair from "./pages/DamChair";
import RootsTable from "./pages/RootsTable";
import Storm from "./pages/Storm";
import Lucid from "./pages/Lucid";
import Auth from "./pages/Auth";
import { ProfileSetup } from "./components/ProfileSetup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import ChatThread from "./pages/ChatThread";
import Search from "./pages/Search";
import GuestView from "./pages/GuestView";
import BottomNav from "./components/BottomNav";
import AIFriend from "./components/AIFriend";
import Feed from "./pages/Feed";
import Globe from "./pages/Globe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup onComplete={() => window.location.href = '/'} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/simple" element={<ProfileSimple />} />
            <Route path="/community" element={<Community />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/globe" element={<Globe />} />
            <Route path="/dam-chair" element={<DamChair />} />
            <Route path="/roots-table" element={<RootsTable />} />
            <Route path="/storm" element={<Storm />} />
            <Route path="/lucid" element={<Lucid />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/thread/:id" element={<ChatThread />} />
            <Route path="/search" element={<Search />} />
            <Route path="/guest/:profileId" element={<GuestView />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <AIFriend />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
