import { useEffect, useState } from 'react';
import AnimatedGalleryIcon from './AnimatedGalleryIcon';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Start animation immediately
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 1000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  // Complete animation and transition to main app
  useEffect(() => {
    if (isAnimating) {
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onComplete, 300);
      }, 2500);
      return () => clearTimeout(animationTimer);
    }
  }, [isAnimating, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        !isAnimating && isAnimating !== null ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Welcome Message */}
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to MyGallery</h1>
        
        {/* Animation Stage */}
        <div
          className={`flex items-center justify-center transition-all duration-1000 ease-in-out ${
            isAnimating
              ? 'scale-100 opacity-100 animate-intro-pulse'
              : 'scale-75 opacity-0'
          }`}
        >
          <div className="scale-[4] flex items-center justify-center">
            <AnimatedGalleryIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
