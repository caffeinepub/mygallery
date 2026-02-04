import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['missions', 'detail'] });
    },
    onError: (err) => {
      console.error('Delete mission failed:', getActorErrorMessage(err));
    },
  });
}
