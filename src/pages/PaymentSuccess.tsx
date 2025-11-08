import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Add user to waitlist after successful payment
    const addToWaitlist = async () => {
      const userData = sessionStorage.getItem('waitlist_user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          await fetch(
            "https://ahksxziueqkacyaqtgeu.supabase.co/functions/v1/join-waitlist",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsed),
            }
          );
          sessionStorage.removeItem('waitlist_user');
        } catch (error) {
          console.error("Failed to add to waitlist:", error);
        }
      }
    };

    addToWaitlist();

    // Start explosion animation immediately
    // Show welcome after explosion
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);

    // Show profile text after welcome
    const profileTimer = setTimeout(() => {
      setShowProfile(true);
    }, 3000);

    // Navigate to profile setup after animations
    const navTimer = setTimeout(() => {
      navigate('/profile-setup');
    }, 5000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(profileTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background relative overflow-y-auto overflow-x-hidden flex items-center justify-center">
      <StarField />
      
      {/* Explosion Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="explosion-container">
          {/* Central explosion point */}
          <div className="absolute w-4 h-4 bg-primary rounded-full animate-ping"></div>
          
          {/* Explosion particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full explosion-particle"
              style={{
                '--angle': `${i * 30}deg`,
                animation: `explode-${i} 1s ease-out forwards`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Welcome Text Animation */}
      <div 
        className={`relative z-10 text-center transition-all duration-1000 ${
          showWelcome 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-full opacity-0 scale-90'
        }`}
      >
        <h1 className="text-6xl font-bold iridescent-text mb-8">
          Welcome to ping!
        </h1>
        
        {/* Profile Setup Text */}
        <div 
          className={`transition-all duration-1000 delay-500 ${
            showProfile 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="text-2xl iridescent-text">
            Let's create your profile
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .explosion-container {
            position: relative;
            width: 100px;
            height: 100px;
          }
          
          .explosion-particle {
            animation-fill-mode: forwards;
          }

          @keyframes explode-0 { to { transform: rotate(0deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-1 { to { transform: rotate(30deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-2 { to { transform: rotate(60deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-3 { to { transform: rotate(90deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-4 { to { transform: rotate(120deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-5 { to { transform: rotate(150deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-6 { to { transform: rotate(180deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-7 { to { transform: rotate(210deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-8 { to { transform: rotate(240deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-9 { to { transform: rotate(270deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-10 { to { transform: rotate(300deg) translateX(200px) scale(0); opacity: 0; } }
          @keyframes explode-11 { to { transform: rotate(330deg) translateX(200px) scale(0); opacity: 0; } }
        `
      }} />
    </div>
  );
};

export default PaymentSuccess;