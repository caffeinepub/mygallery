import { useState, useEffect, useCallback } from 'react';

const INITIALIZATION_TIMEOUT_MS = 10000; // 10 seconds

interface UseInitializationTimeoutOptions {
  isInitializing: boolean;
  timeoutMs?: number;
}

interface UseInitializationTimeoutResult {
  hasTimedOut: boolean;
  resetTimeout: () => void;
}

/**
 * Hook that tracks whether an initialization process has exceeded a timeout threshold.
 * Returns true if the initialization flag remains true longer than the specified timeout.
 */
export function useInitializationTimeout({
  isInitializing,
  timeoutMs = INITIALIZATION_TIMEOUT_MS,
}: UseInitializationTimeoutOptions): UseInitializationTimeoutResult {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const resetTimeout = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      // Reset timeout when initialization completes
      setHasTimedOut(false);
      return;
    }

    // Start timeout timer
    const timeoutId = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isInitializing, timeoutMs]);

  return { hasTimedOut, resetTimeout };
}
