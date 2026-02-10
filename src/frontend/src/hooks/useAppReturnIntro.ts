import { useEffect, useRef } from 'react';

interface UseAppReturnIntroOptions {
  isAuthenticated: boolean;
  isInitializing: boolean;
  onAppReturn: () => void;
}

/**
 * Hook that detects when the app returns to foreground (tab visible or window focused)
 * and triggers a callback for authenticated users only.
 */
export function useAppReturnIntro({
  isAuthenticated,
  isInitializing,
  onAppReturn,
}: UseAppReturnIntroOptions) {
  const wasHiddenRef = useRef(false);

  useEffect(() => {
    // Only listen for app return events if authenticated and not initializing
    if (!isAuthenticated || isInitializing) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background
        wasHiddenRef.current = true;
      } else if (wasHiddenRef.current) {
        // App returned to foreground
        wasHiddenRef.current = false;
        onAppReturn();
      }
    };

    const handleFocus = () => {
      // Window regained focus - treat as app return
      if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        onAppReturn();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, isInitializing, onAppReturn]);
}
