import { useMemo } from 'react';

interface CircleStrengthBarProps {
  people: any[];
  personHealth: Record<string, number>;
}

export const CircleStrengthBar = ({ people, personHealth }: CircleStrengthBarProps) => {
  const overallScore = useMemo(() => {
    if (people.length === 0) return 0;
    
    const totalScore = people.reduce((sum, person) => {
      return sum + (personHealth[person.id] || 70);
    }, 0);
    
    return Math.round(totalScore / people.length);
  }, [people, personHealth]);

  const percentage = overallScore;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Iridescent Shimmering Text */}
      <div className="relative text-2xl uppercase tracking-wider font-bold">
        <div 
          className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-pulse"
          style={{
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        >
          how strong is your circle?
        </div>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent blur-sm opacity-50"
          style={{
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        >
          how strong is your circle?
        </div>
      </div>
      
      {/* Glowing Bar - Bigger */}
      <div className="relative w-80 h-3 bg-black/50 rounded-full overflow-hidden border border-primary/30">
        {/* Glow Effect Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-primary/60 to-yellow-400/0 blur-md"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Bar Fill with Gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary transition-all duration-700 ease-out shadow-[0_0_30px_rgba(0,255,102,0.8)]"
          style={{ 
            width: `${percentage}%`,
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        
        {/* Additional Shimmer */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{ 
            width: `${percentage}%`,
            animation: 'slide 2s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes slide {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
