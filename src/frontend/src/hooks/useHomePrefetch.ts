import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { SortDirection } from '@/backend';

export function useHomePrefetch() {
  const queryClient = useQueryClient();
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();
  const hasPrefetchedRef = useRef(false);

  useEffect(() => {
    // Only prefetch once per actor-ready session
    if (!actor || status !== 'ready' || !identity || hasPrefetchedRef.current) {
      return;
    }

    hasPrefetchedRef.current = true;

    // Prefetch core Home data in parallel
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['folders'],
        queryFn: () => actor.getAllFolders(),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['missions'],
        queryFn: async () => {
          const missions = await actor.listMissions();
          return missions.sort((a, b) => Number(b.created - a.created));
        },
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['files', 'not-in-folder'],
        queryFn: async () => {
          const result = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(1000));
          return result.files;
        },
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['notes', 'not-in-folder'],
        queryFn: async () => {
          const result = await actor.getPaginatedNotes(SortDirection.desc, BigInt(0), BigInt(1000));
          return result.notes;
        },
        staleTime: 5 * 60 * 1000,
      }),
    ];

    Promise.all(prefetchPromises).catch((error) => {
      console.warn('[useHomePrefetch] Prefetch failed:', error);
    });
  }, [actor, status, identity, queryClient]);

  // Reset prefetch flag when actor changes (e.g., after logout/login)
  useEffect(() => {
    if (status !== 'ready' || !actor) {
      hasPrefetchedRef.current = false;
    }
  }, [status, actor]);
}
