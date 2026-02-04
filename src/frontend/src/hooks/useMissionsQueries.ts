import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { diagnoseMissionCache, logDeleteMutationLifecycle, formatActorError } from '@/utils/reactQueryDiagnostics';
import type { Mission, Task } from '@/backend';

export function useListMissions() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission[]>({
    queryKey: ['missions', 'list'],
    queryFn: async () => {
      if (!actor) return [];
      const missions = await actor.listMissions();
      // BigInt-safe sorting: compare bigints directly without Number() conversion
      return missions.sort((a, b) => {
        if (a.created > b.created) return -1;
        if (a.created < b.created) return 1;
        return 0;
      });
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  });
}

export function useGetMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission | null>({
    queryKey: ['missions', 'detail', missionId?.toString()],
    queryFn: async () => {
      if (!actor || !missionId) return null;
      return await actor.getMission(missionId);
    },
    enabled: !!actor && status === 'ready' && !!identity && missionId !== null,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  });
}

export function useCreateMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, tasks }: { title: string; tasks: Task[] }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      const missionId = await actor.createMission(title, tasks);
      return missionId;
    },
    onSuccess: async (missionId) => {
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'] });
      await queryClient.prefetchQuery({
        queryKey: ['missions', 'detail', missionId.toString()],
        queryFn: async () => {
          if (!actor) return null;
          return await actor.getMission(missionId);
        },
      });
      return missionId;
    },
    onError: (err) => {
      console.error('Create mission failed:', getActorErrorMessage(err));
    },
  });
}

export function useUpdateMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, title, tasks }: { missionId: bigint; title: string; tasks: Task[] }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.updateMission(missionId, title, tasks);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['missions', 'detail', variables.missionId.toString()] });
    },
    onError: (err) => {
      console.error('Update mission failed:', getActorErrorMessage(err));
    },
  });
}

export function useDeleteMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: bigint) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      await actor.deleteMission(missionId);
      return missionId;
    },
    onMutate: async (missionId) => {
      const missionIdStr = missionId.toString();
      
      // Diagnostics: before mutation
      const diagBefore = diagnoseMissionCache(queryClient, missionId);
      logDeleteMutationLifecycle('onMutate', 'mission', missionIdStr, diagBefore);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['missions', 'list'] });
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionIdStr] });

      // Snapshot the previous value
      const previousMissions = queryClient.getQueryData<Mission[]>(['missions', 'list']);

      // Optimistically update to remove the mission from list
      queryClient.setQueryData<Mission[]>(['missions', 'list'], (old) => {
        if (!old) return [];
        return old.filter((m) => m.id.toString() !== missionIdStr);
      });

      // Remove the mission detail cache
      queryClient.removeQueries({ queryKey: ['missions', 'detail', missionIdStr] });

      // Diagnostics: after optimistic update
      const diagAfter = diagnoseMissionCache(queryClient, missionId);
      logDeleteMutationLifecycle('onMutate', 'mission', missionIdStr, diagAfter);

      // Return context with the snapshot
      return { previousMissions };
    },
    onError: (err, missionId, context) => {
      const missionIdStr = missionId.toString();
      const errorMessage = formatActorError(err);
      
      // Diagnostics: on error
      const diagError = diagnoseMissionCache(queryClient, missionId);
      logDeleteMutationLifecycle('onError', 'mission', missionIdStr, diagError, err);

      // Rollback on error
      if (context?.previousMissions) {
        queryClient.setQueryData(['missions', 'list'], context.previousMissions);
      }
      
      console.error('Delete mission failed:', getActorErrorMessage(err));
      throw new Error(`Failed to delete mission: ${errorMessage}`);
    },
    onSuccess: (missionId) => {
      const missionIdStr = missionId.toString();
      
      // Diagnostics: on success
      const diagSuccess = diagnoseMissionCache(queryClient, missionId);
      logDeleteMutationLifecycle('onSuccess', 'mission', missionIdStr, diagSuccess);
    },
    onSettled: (missionId) => {
      const missionIdStr = missionId?.toString() ?? 'unknown';
      
      // Always refetch after error or success to ensure backend state is reflected
      queryClient.invalidateQueries({ queryKey: ['missions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['missions', 'detail'] });

      // Diagnostics: on settled
      if (missionId) {
        const diagSettled = diagnoseMissionCache(queryClient, missionId);
        logDeleteMutationLifecycle('onSettled', 'mission', missionIdStr, diagSettled);
      }
    },
  });
}
