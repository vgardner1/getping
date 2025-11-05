import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Model3DUpload from "./pages/Model3DUpload";
import Onboarding from "./pages/Onboarding";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import AccountSetup from "./pages/AccountSetup";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileView from "./pages/ProfileView";
import Profile from "./pages/Profile";
import ProfileDetails from "./pages/ProfileDetails";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import Network from "./pages/Network";
import NetworkVisualization from "./pages/NetworkVisualization";
import PublicProfile from "./pages/PublicProfile";
import PublicPing from "./pages/PublicPing";
import PublicProfileDetails from "./pages/PublicProfileDetails";
import PublicRouteHandler from "./pages/PublicRouteHandler";
import Chat from "./pages/Chat";
import ResumePreview from "./pages/ResumePreview";
import Contacts from "./pages/Contacts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/account-setup" element={<AccountSetup />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/details" element={<ProfileDetails />} />
            <Route path="/profile/analytics" element={<ProfileView />} />
            <Route path="/u/:userId" element={<PublicProfile />} />
            <Route path="/ping/:userId" element={<PublicRouteHandler />} />
            <Route path="/ping/:userId/:view" element={<PublicRouteHandler />} />
            <Route path="/network" element={<Network />} />
            <Route path="/network/visualize" element={<NetworkVisualization />} />
            <Route path="/tribe" element={<Network />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/3d-upload" element={<Model3DUpload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
