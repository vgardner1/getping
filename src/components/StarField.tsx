import { useEffect, useState } from 'react';

export const StarField = () => {
  const [stars, setStars] = useState<Array<{ id: number; left: number; animationDelay: number; color: 'pink' | 'green' }>>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 20,
          color: Math.random() > 0.5 ? 'pink' : 'green'
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.color === 'pink' ? 'star-pink' : 'star-green'}`}
          style={{
            left: `${star.left}%`,
            animationDelay: `${star.animationDelay}s`
          }}
        />
      ))}
    </div>
  );
};