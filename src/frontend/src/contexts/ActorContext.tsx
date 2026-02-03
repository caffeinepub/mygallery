import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

type ActorStatus = 'idle' | 'initializing' | 'ready' | 'error';

interface ActorContextValue {
  actor: backendInterface | null;
  status: ActorStatus;
  error: Error | null;
  retry: () => void;
  signOut: () => Promise<void>;
}

const ActorContext = createContext<ActorContextValue | undefined>(undefined);

export function ActorProvider({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [status, setStatus] = useState<ActorStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const initializeActor = useCallback(async () => {
    // Don't initialize if not authenticated
    if (!identity) {
      setActor(null);
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('initializing');
    setError(null);

    try {
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
    } catch (err) {
      console.error('Actor initialization failed:', err);
      setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      setStatus('error');
      setActor(null);
    }
  }, [identity]);

  // Initialize actor when identity changes
  useEffect(() => {
    initializeActor();
  }, [initializeActor]);

  const retry = useCallback(() => {
    initializeActor();
  }, [initializeActor]);

  const signOut = useCallback(async () => {
    await clear();
    setActor(null);
    setStatus('idle');
    setError(null);
  }, [clear]);

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
