import { useEffect, useState } from 'react';
import AnimatedGalleryIcon from './AnimatedGalleryIcon';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade-out at 700ms
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 700);

    // Complete and call onComplete at 1000ms
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Icon-only splash screen */}
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
