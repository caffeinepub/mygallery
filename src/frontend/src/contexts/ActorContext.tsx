import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';
import { mapActorInitError, type ErrorClassification } from '@/utils/actorInitializationMessaging';

type ActorStatus = 'idle' | 'initializing' | 'ready' | 'unavailable' | 'error';

interface ActorError {
  summary: string;
  technicalDetails: string;
  classification: ErrorClassification;
}

interface ActorContextValue {
  actor: backendInterface | null;
  status: ActorStatus;
  error: ActorError | null;
  retry: () => void;
  signOut: () => Promise<void>;
}

const ActorContext = createContext<ActorContextValue | undefined>(undefined);

const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 1.5;

/**
 * Helper function to get normalized admin token (treats whitespace-only as absent)
 */
function getNormalizedAdminToken(paramName: string): string | null {
  const token = getSecretParameter(paramName);
  if (!token || token.trim() === '') {
    return null;
  }
  return token.trim();
}

export function ActorProvider({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [status, setStatus] = useState<ActorStatus>('idle');
  const [error, setError] = useState<ActorError | null>(null);
  
  // Track retry state
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef<number>(INITIAL_RETRY_DELAY);
  const isInitializingRef = useRef<boolean>(false);
  const currentIdentityRef = useRef<typeof identity>(null);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const resetRetryState = useCallback(() => {
    retryDelayRef.current = INITIAL_RETRY_DELAY;
    clearRetryTimeout();
  }, [clearRetryTimeout]);

  const initializeActor = useCallback(async (isRetry: boolean = false) => {
    // Don't initialize if not authenticated
    if (!identity) {
      setActor(null);
      setStatus('idle');
      setError(null);
      resetRetryState();
      isInitializingRef.current = false;
      return;
    }

    // Prevent parallel initialization attempts
    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setStatus('initializing');
    if (!isRetry) {
      setError(null);
      resetRetryState();
    }

    try {
      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      const newActor = await createActorWithConfig(actorOptions);
      
      // Only call _initializeAccessControlWithSecret if a normalized non-empty token is present
      const adminToken = getNormalizedAdminToken('caffeineAdminToken');
      if (adminToken) {
        await newActor._initializeAccessControlWithSecret(adminToken);
      }
      
      // Success: reset retry state and set ready
      setActor(newActor);
      setStatus('ready');
      setError(null);
      resetRetryState();
      isInitializingRef.current = false;
    } catch (err) {
      console.error('Actor initialization failed:', err);
      
      // Map the error to user-friendly summary + technical details + classification
      const mappedError = mapActorInitError(err);
      setError(mappedError);
      setActor(null);
      isInitializingRef.current = false;

      // Determine if this is a stopped-canister error (retryable indefinitely)
      if (mappedError.classification.isStoppedCanister) {
        // Keep status as 'unavailable' and continue retrying indefinitely
        setStatus('unavailable');
        
        // Schedule automatic retry with exponential backoff
        const currentDelay = retryDelayRef.current;
        retryTimeoutRef.current = setTimeout(() => {
          // Only retry if identity hasn't changed
          if (currentIdentityRef.current === identity) {
            initializeActor(true);
          }
        }, currentDelay);
        
        // Increase delay for next retry (exponential backoff, capped at MAX_RETRY_DELAY)
        retryDelayRef.current = Math.min(
          currentDelay * BACKOFF_MULTIPLIER,
          MAX_RETRY_DELAY
        );
      } else {
        // Fatal error (e.g., invalid admin token): stop retrying immediately
        setStatus('error');
        resetRetryState();
      }
    }
  }, [identity, resetRetryState]);

  // Track identity changes
  useEffect(() => {
    currentIdentityRef.current = identity;
  }, [identity]);

  // Initialize actor when identity changes
  useEffect(() => {
    // Cancel any pending retries when identity changes
    resetRetryState();
    isInitializingRef.current = false;
    
    initializeActor(false);
    
    // Cleanup on unmount or identity change
    return () => {
      clearRetryTimeout();
      isInitializingRef.current = false;
    };
  }, [initializeActor, resetRetryState, clearRetryTimeout]);

  const retry = useCallback(() => {
    // Reset all retry state on manual retry
    resetRetryState();
    isInitializingRef.current = false;
    initializeActor(false);
  }, [initializeActor, resetRetryState]);

  const signOut = useCallback(async () => {
    // Cancel any pending retries
    resetRetryState();
    isInitializingRef.current = false;
    
    // Clear Internet Identity
    await clear();
    
    // Clear React Query cache
    queryClient.clear();
    
    // Reset actor state
    setActor(null);
    setStatus('idle');
    setError(null);
  }, [clear, queryClient, resetRetryState]);

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
