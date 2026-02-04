import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';
import { mapActorInitError, type ClassifiedError } from '@/utils/actorInitializationMessaging';

type ActorStatus = 'idle' | 'initializing' | 'ready' | 'error';

interface ActorError {
  summary: string;
  technicalDetails: string;
  classification?: string;
}

interface ActorContextValue {
  actor: backendInterface | null;
  status: ActorStatus;
  error: ActorError | null;
  retry: () => void;
  signOut: () => Promise<void>;
}

const ActorContext = createContext<ActorContextValue | undefined>(undefined);

// Session storage key for tracking successful initialization
const SESSION_INIT_KEY = 'actor_initialized_successfully';

// Retry configuration for cold-start silent retry
const RETRY_CONFIG = {
  maxRetries: 8,                    // Maximum number of retry attempts
  initialDelayMs: 500,              // Initial delay before first retry
  maxDelayMs: 8000,                 // Maximum delay between retries
  backoffMultiplier: 1.5,           // Exponential backoff multiplier
  maxRetryWindowMs: 45000,          // Maximum total time to spend retrying (45 seconds)
};

/**
 * Calculates the next retry delay using capped exponential backoff with jitter.
 */
function calculateRetryDelay(attemptNumber: number): number {
  const exponentialDelay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attemptNumber);
  const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelayMs);
  // Add jitter (±20%)
  const jitter = cappedDelay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(cappedDelay + jitter);
}

/**
 * Checks if this is the first initialization attempt in the current session.
 */
function isFirstSessionInit(): boolean {
  try {
    return sessionStorage.getItem(SESSION_INIT_KEY) !== 'true';
  } catch {
    // If sessionStorage is unavailable, treat as first init
    return true;
  }
}

/**
 * Marks that a successful initialization has occurred in this session.
 */
function markSessionInitSuccess(): void {
  try {
    sessionStorage.setItem(SESSION_INIT_KEY, 'true');
  } catch {
    // Ignore if sessionStorage is unavailable
  }
}

/**
 * Clears the session initialization flag (e.g., on sign-out).
 */
function clearSessionInitFlag(): void {
  try {
    sessionStorage.removeItem(SESSION_INIT_KEY);
  } catch {
    // Ignore if sessionStorage is unavailable
  }
}

export function ActorProvider({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [status, setStatus] = useState<ActorStatus>('idle');
  const [error, setError] = useState<ActorError | null>(null);
  
  // Refs for retry state management
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryStartTimeRef = useRef<number | null>(null);
  const retryAttemptRef = useRef<number>(0);
  const isRetryingRef = useRef<boolean>(false);

  /**
   * Clears any pending retry timeout.
   */
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  /**
   * Resets retry state.
   */
  const resetRetryState = useCallback(() => {
    clearRetryTimeout();
    retryStartTimeRef.current = null;
    retryAttemptRef.current = 0;
    isRetryingRef.current = false;
  }, [clearRetryTimeout]);

  /**
   * Core actor initialization logic.
   */
  const performActorInit = useCallback(async (): Promise<{ success: boolean; error?: ClassifiedError }> => {
    try {
      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      const newActor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter('caffeineAdminToken') || '';
      await newActor._initializeAccessControlWithSecret(adminToken);
      
      return { success: true };
    } catch (err) {
      const mappedError = mapActorInitError(err);
      return { success: false, error: mappedError };
    }
  }, [identity]);

  /**
   * Logs structured diagnostic information about initialization attempts.
   */
  const logInitDiagnostics = useCallback((
    attemptNumber: number,
    elapsedMs: number,
    classification: string,
    errorDetails: string,
    willRetry: boolean
  ) => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      attemptNumber,
      elapsedMs,
      classification,
      willRetry,
      errorDetails,
    };
    
    console.log(
      `[Actor Init] Attempt ${attemptNumber} failed after ${elapsedMs}ms | ` +
      `Classification: ${classification} | Will retry: ${willRetry}`,
      diagnostics
    );
  }, []);

  /**
   * Recursive retry function with bounded exponential backoff.
   */
  const retryWithBackoff = useCallback(async () => {
    if (!identity) {
      resetRetryState();
      return;
    }

    const attemptNumber = retryAttemptRef.current;
    const startTime = retryStartTimeRef.current || Date.now();
    const elapsedMs = Date.now() - startTime;

    // Check if we've exceeded the retry window
    if (elapsedMs >= RETRY_CONFIG.maxRetryWindowMs) {
      console.log(`[Actor Init] Retry window exceeded (${elapsedMs}ms). Showing error state.`);
      resetRetryState();
      setStatus('error');
      return;
    }

    // Check if we've exceeded max retries
    if (attemptNumber >= RETRY_CONFIG.maxRetries) {
      console.log(`[Actor Init] Max retries (${RETRY_CONFIG.maxRetries}) exceeded. Showing error state.`);
      resetRetryState();
      setStatus('error');
      return;
    }

    // Perform initialization attempt
    const result = await performActorInit();

    if (result.success) {
      console.log(`[Actor Init] Success on attempt ${attemptNumber + 1} after ${elapsedMs}ms`);
      resetRetryState();
      // Success will be handled by the main initialization flow
      return;
    }

    // Initialization failed
    const { error: classifiedError } = result;
    if (!classifiedError) {
      resetRetryState();
      setStatus('error');
      return;
    }

    // Determine if we should retry based on error classification
    const shouldRetry = classifiedError.classification === 'transient-canister-unavailable';

    logInitDiagnostics(
      attemptNumber + 1,
      elapsedMs,
      classifiedError.classification,
      classifiedError.technicalDetails,
      shouldRetry
    );

    if (!shouldRetry) {
      console.log(`[Actor Init] Non-retryable error (${classifiedError.classification}). Showing error state.`);
      resetRetryState();
      setError({
        summary: classifiedError.summary,
        technicalDetails: classifiedError.technicalDetails,
        classification: classifiedError.classification,
      });
      setStatus('error');
      return;
    }

    // Schedule next retry with exponential backoff
    const delayMs = calculateRetryDelay(attemptNumber);
    console.log(`[Actor Init] Scheduling retry ${attemptNumber + 2} in ${delayMs}ms`);
    
    retryAttemptRef.current += 1;
    retryTimeoutRef.current = setTimeout(() => {
      retryWithBackoff();
    }, delayMs);
  }, [identity, performActorInit, resetRetryState, logInitDiagnostics]);

  /**
   * Main initialization function with cold-start silent retry logic.
   */
  const initializeActor = useCallback(async () => {
    // Don't initialize if not authenticated
    if (!identity) {
      setActor(null);
      setStatus('idle');
      setError(null);
      resetRetryState();
      return;
    }

    // Clear any pending retries
    clearRetryTimeout();

    setStatus('initializing');
    setError(null);

    // Perform initial attempt
    const result = await performActorInit();

    if (result.success) {
      // Success on first attempt
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const newActor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter('caffeineAdminToken') || '';
      await newActor._initializeAccessControlWithSecret(adminToken);
      
      setActor(newActor);
      setStatus('ready');
      markSessionInitSuccess();
      resetRetryState();
      console.log('[Actor Init] Success on first attempt');
      return;
    }

    // First attempt failed
    const { error: classifiedError } = result;
    if (!classifiedError) {
      setStatus('error');
      setError({ summary: 'Unknown error', technicalDetails: 'No error details available' });
      return;
    }

    // Check if this is the first initialization in the session
    const isFirstInit = isFirstSessionInit();
    
    // Check if error is retryable (transient canister unavailability)
    const isRetryable = classifiedError.classification === 'transient-canister-unavailable';

    logInitDiagnostics(
      1,
      0,
      classifiedError.classification,
      classifiedError.technicalDetails,
      isFirstInit && isRetryable
    );

    // If this is the first init and error is retryable, start silent retry
    if (isFirstInit && isRetryable) {
      console.log('[Actor Init] First session init with transient error. Starting silent retry...');
      isRetryingRef.current = true;
      retryStartTimeRef.current = Date.now();
      retryAttemptRef.current = 1;
      
      // Stay in initializing state and start retry loop
      const delayMs = calculateRetryDelay(0);
      retryTimeoutRef.current = setTimeout(() => {
        retryWithBackoff();
      }, delayMs);
      return;
    }

    // Not first init or not retryable - show error immediately
    console.log('[Actor Init] Showing error state immediately (not first init or not retryable)');
    setError({
      summary: classifiedError.summary,
      technicalDetails: classifiedError.technicalDetails,
      classification: classifiedError.classification,
    });
    setStatus('error');
    setActor(null);
  }, [identity, performActorInit, resetRetryState, clearRetryTimeout, retryWithBackoff, logInitDiagnostics]);

  // Initialize actor when identity changes
  useEffect(() => {
    initializeActor();
    
    // Cleanup on unmount or identity change
    return () => {
      clearRetryTimeout();
    };
  }, [initializeActor, clearRetryTimeout]);

  const retry = useCallback(() => {
    console.log('[Actor Init] Manual retry triggered');
    resetRetryState();
    initializeActor();
  }, [initializeActor, resetRetryState]);

  const signOut = useCallback(async () => {
    console.log('[Actor Init] Sign out - clearing session flag');
    await clear();
    setActor(null);
    setStatus('idle');
    setError(null);
    resetRetryState();
    clearSessionInitFlag();
  }, [clear, resetRetryState]);

  return (
    <ActorContext.Provider value={{ actor, status, error, retry, signOut }}>
      {children}
    </ActorContext.Provider>
  );
}

export function useBackendActor() {
  const context = useContext(ActorContext);
  if (context === undefined) {
    throw new Error('useBackendActor must be used within ActorProvider');
  }
  return context;
}
