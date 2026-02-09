import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { SortDirection } from '@/backend';
import type { FileMetadata, Folder, Mission } from '@/backend';

/**
 * Home-specific prefetch hook that triggers core data fetching
 * as soon as actor becomes ready, without introducing refetch loops.
 * Runs once per actor-ready session.
 */
export function useHomePrefetch() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const hasPrefetchedRef = useRef(false);

  useEffect(() => {
    // Only prefetch once when actor becomes ready and user is authenticated
    if (actor && status === 'ready' && identity && !hasPrefetchedRef.current) {
      hasPrefetchedRef.current = true;

      // Prefetch folders
      queryClient.prefetchQuery<Folder[]>({
        queryKey: ['folders'],
        queryFn: async () => {
          return actor.getAllFolders();
        },
        staleTime: 3000,
      });

      // Prefetch main gallery files (not in folder)
      queryClient.prefetchQuery<FileMetadata[]>({
        queryKey: ['files', 'not-in-folder'],
        queryFn: async () => {
          const result = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(1000));
          return result.files;
        },
        staleTime: 2000,
      });

      // Prefetch missions list
      queryClient.prefetchQuery<Mission[]>({
        queryKey: ['missions', 'list'],
        queryFn: async () => {
          const missions = await actor.listMissions();
          return missions.sort((a, b) => {
            if (a.created > b.created) return -1;
            if (a.created < b.created) return 1;
            return 0;
          });
        },
        staleTime: 2000,
      });

      // Prefetch notes (not in folder)
      queryClient.prefetchQuery({
        queryKey: ['notes', 'root'],
        queryFn: async () => {
          const result = await actor.getPaginatedNotes(SortDirection.desc, BigInt(0), BigInt(1000));
          return result.notes;
        },
        staleTime: 2000,
      });
    }
  }, [actor, status, identity, queryClient]);

  // Reset prefetch flag when identity is cleared (logout)
  useEffect(() => {
    if (!identity) {
      hasPrefetchedRef.current = false;
    }
  }, [identity]);
}
