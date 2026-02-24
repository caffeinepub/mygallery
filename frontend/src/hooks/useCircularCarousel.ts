import { useState, useMemo } from 'react';

interface CircularPosition {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  angle: number;
}

interface UseCircularCarouselOptions {
  itemCount: number;
  radius?: number;
  reducedMotion?: boolean;
}

export function useCircularCarousel({
  itemCount,
  radius = 70,
  reducedMotion = false,
}: UseCircularCarouselOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const rotateClockwise = () => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  };

  const rotateCounterClockwise = () => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
  };

  const getItemPosition = useMemo(() => {
    return (itemIndex: number): CircularPosition => {
      // Calculate relative position from current centered item
      const relativePosition = (itemIndex - currentIndex + itemCount) % itemCount;
      
      if (reducedMotion) {
        // Simple horizontal slide for reduced motion
        const offset = (relativePosition - 1) * 120; // 120px spacing
        return {
          x: offset,
          y: 0,
          scale: relativePosition === 0 ? 1.0 : 0.8,
          opacity: relativePosition === 0 ? 1.0 : 0.55,
          angle: 0,
        };
      }

      // Circular arc positioning with 120° separation
      // Map positions to angles: center=0°, left=-120°, right=120°
      let angle: number;
      if (relativePosition === 0) {
        angle = 0; // Center (0°)
      } else if (relativePosition === 1) {
        angle = 120; // Right (120°)
      } else {
        angle = -120; // Left (240° or -120°)
      }

      const radians = (angle * Math.PI) / 180;
      const x = Math.sin(radians) * radius;
      const y = (1 - Math.cos(radians)) * radius * 0.3; // Subtle vertical arc

      return {
        x,
        y,
        scale: relativePosition === 0 ? 1.0 : 0.8,
        opacity: relativePosition === 0 ? 1.0 : 0.55,
        angle,
      };
    };
  }, [currentIndex, itemCount, radius, reducedMotion]);

  return {
    currentIndex,
    rotateClockwise,
    rotateCounterClockwise,
    getItemPosition,
  };
}
