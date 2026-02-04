import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device has a coarse pointer (touch device).
 * Returns true for mobile/touch devices, false for desktop/mouse devices.
 */
export function useIsCoarsePointer(): boolean {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    // Check if the device has a coarse pointer (touch)
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    
    const updatePointerType = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    // Initial check
    updatePointerType();

    // Listen for changes (e.g., connecting/disconnecting external mouse)
    mediaQuery.addEventListener('change', updatePointerType);

    return () => {
      mediaQuery.removeEventListener('change', updatePointerType);
    };
  }, []);

  return isCoarsePointer;
}
