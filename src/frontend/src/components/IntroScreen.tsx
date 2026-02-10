import { useEffect, useState } from 'react';
import AnimatedGalleryIcon from './AnimatedGalleryIcon';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Delay before starting fade-out (~1000ms)
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    // Complete and call onComplete at ~2000ms (1s delay + 1s fade)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-1000 pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Icon-only splash screen - non-blocking overlay */}
      <div className="text-center">
        {/* Animation Stage */}
        <div className="flex items-center justify-center animate-intro-pulse">
          <div className="scale-[4] flex items-center justify-center">
            <AnimatedGalleryIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
