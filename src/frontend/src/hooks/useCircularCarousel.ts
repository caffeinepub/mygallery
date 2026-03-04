import { useMemo, useState } from "react";

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
  radius = 130,
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
      const relativePosition =
        (itemIndex - currentIndex + itemCount) % itemCount;

      if (reducedMotion) {
        // Simple horizontal slide for reduced motion — wider spacing for larger icons (50px active)
        const offset = (relativePosition - 1) * 150; // 150px spacing
        return {
          x: offset,
          y: 0,
          scale: relativePosition === 0 ? 1.0 : 0.72,
          opacity: relativePosition === 0 ? 1.0 : 0.55,
          angle: 0,
        };
      }

      // Circular arc positioning with 120° separation
      // Map positions to angles: center=0°, right=+120°, left=-120°
      let angle: number;
      if (relativePosition === 0) {
        angle = 0; // Center
      } else if (relativePosition === 1) {
        angle = 120; // Right (+120°)
      } else {
        angle = -120; // Left (-120°)
      }

      const radians = (angle * Math.PI) / 180;
      const x = Math.sin(radians) * radius;
      // Gentle vertical arc factor: 0.32 gives visible arc without excessive drop
      const y = (1 - Math.cos(radians)) * radius * 0.32;

      return {
        x,
        y,
        // Active = 1.0, inactive = 0.72 (ratio within 0.75–0.8 range for 50px/36px sizes)
        scale: relativePosition === 0 ? 1.0 : 0.72,
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
