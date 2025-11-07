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
    <div className="flex flex-col items-center gap-2">
      {/* Text Label */}
      <div className="text-xs uppercase tracking-widest text-primary/80 font-semibold">
        Circle Strength
      </div>
      
      {/* Glowing Bar */}
      <div className="relative w-64 h-2 bg-black/50 rounded-full overflow-hidden border border-primary/20">
        {/* Glow Effect Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 blur-sm"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Bar Fill */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(0,255,102,0.6)]"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Additional Glow */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
