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
    staleTime: 2000, // 2 seconds - reduce redundant refetches
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useGetMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission | null>({
    queryKey: ['missions', 'detail', missionId?.toString()],
    queryFn: async () => {
      if (!actor || missionId === null) return null;
      return await actor.getMission(missionId);
    },
    enabled: !!actor && status === 'ready' && !!identity && missionId !== null,
    staleTime: 2000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateMission() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, tasks }: { title: string; tasks: Task[] }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      const missionId = await actor.createMission(title, tasks);
      return missionId;
    },
    onSuccess: async (missionId, variables) => {
      // Synchronously update the cache with the new mission
      const newMission: Mission = {
        id: missionId,
        title: variables.title,
        tasks: variables.tasks,
        created: BigInt(Date.now()) * BigInt(1000000), // Approximate timestamp in nanoseconds
        owner: identity?.getPrincipal() ?? (() => { throw new Error('Identity not available'); })(),
      };

      // Update missions list cache
      queryClient.setQueryData<Mission[]>(['missions', 'list'], (old) => {
        if (!old) return [newMission];
        return [newMission, ...old];
      });

      // Set the mission detail cache
      queryClient.setQueryData(['missions', 'detail', missionId.toString()], newMission);

      // Also invalidate to ensure consistency with backend
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
      
      return missionId;
    },
    onError: (err) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('[useCreateMission] Create mission failed:', errorMessage);
      throw new Error(`Failed to create mission: ${errorMessage}`);
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
      return { missionId, title, tasks };
    },
    onSuccess: async (variables) => {
      const missionIdStr = variables.missionId.toString();

      // Synchronously update the mission detail cache
      queryClient.setQueryData<Mission | null>(
        ['missions', 'detail', missionIdStr],
        (old) => {
          if (!old) return null;
          return {
            ...old,
            title: variables.title,
            tasks: variables.tasks,
          };
        }
      );

      // Synchronously update the missions list cache
      queryClient.setQueryData<Mission[]>(
        ['missions', 'list'],
        (old) => {
          if (!old) return old;
          return old.map((mission) =>
            mission.id.toString() === missionIdStr
              ? { ...mission, title: variables.title, tasks: variables.tasks }
              : mission
          );
        }
      );

      // Also invalidate to ensure consistency with backend
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions', 'detail', missionIdStr], exact: true });
    },
    onError: (err) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Update mission failed:', errorMessage);
      throw new Error(`Failed to update mission: ${errorMessage}`);
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
      
      // Targeted invalidations
      queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
      if (missionId) {
        queryClient.invalidateQueries({ queryKey: ['missions', 'detail', missionIdStr], exact: true });
      }

      // Diagnostics: on settled
      if (missionId) {
        const diagSettled = diagnoseMissionCache(queryClient, missionId);
        logDeleteMutationLifecycle('onSettled', 'mission', missionIdStr, diagSettled);
      }
    },
  });
}
