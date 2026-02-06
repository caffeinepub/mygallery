import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { Mission, Task } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { perfDiag } from '@/utils/performanceDiagnostics';

// Track if initial missions query has completed (for diagnostics)
let initialMissionsCompleted = false;

export function useListMissions() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission[]>({
    queryKey: ['missions'],
    queryFn: async () => {
      if (!actor) return [];
      
      const startTime = performance.now();
      const missions = await actor.listMissions();
      
      if (perfDiag.isEnabled() && !initialMissionsCompleted) {
        const duration = performance.now() - startTime;
        perfDiag.logOperation('Initial missions list query (first completion)', duration, {
          missionCount: missions.length
        });
        initialMissionsCompleted = true;
      }
      
      // Sort by created date descending (newest first)
      return missions.sort((a, b) => {
        if (a.created > b.created) return -1;
        if (a.created < b.created) return 1;
        return 0;
      });
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 2000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission | null>({
    queryKey: ['missions', missionId?.toString()],
    queryFn: async () => {
      if (!actor || missionId === null) return null;
      return actor.getMission(missionId);
    },
    enabled: !!actor && status === 'ready' && !!identity && missionId !== null,
    staleTime: 2000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateMission() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { title: string; tasks: Task[] }) => {
      if (!actor) throw createActorNotReadyError();
      return actor.createMission(params.title, params.tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error) => {
      console.error('Create mission failed:', getActorErrorMessage(error));
    },
  });
}

export function useUpdateMission() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { missionId: bigint; title: string; tasks: Task[] }) => {
      if (!actor) throw createActorNotReadyError();
      await actor.updateMission(params.missionId, params.title, params.tasks);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions', variables.missionId.toString()] });
    },
    onError: (error) => {
      console.error('Update mission failed:', getActorErrorMessage(error));
    },
  });
}

export function useDeleteMission() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: bigint) => {
      if (!actor) throw createActorNotReadyError();
      await actor.deleteMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Delete mission failed:', getActorErrorMessage(error));
    },
  });
}
