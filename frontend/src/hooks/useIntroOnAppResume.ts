import { useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Hook that detects when the app returns to the foreground (tab visibility or window focus)
 * and invokes a callback only when the user is authenticated and Internet Identity has finished initializing.
 */
export function useIntroOnAppResume(onResume: () => void) {
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    // Only set up listeners if user is authenticated and initialization is complete
    if (!identity || isInitializing) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && identity && !isInitializing) {
        onResume();
      }
    };

    const handleFocus = () => {
      if (identity && !isInitializing) {
        onResume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [identity, isInitializing, onResume]);
}
