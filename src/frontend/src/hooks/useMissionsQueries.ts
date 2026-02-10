import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { Mission, Task, TaskStatusUpdate } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';

export function useListMissions() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission[]>({
    queryKey: ['missions'],
    queryFn: async () => {
      if (!actor) return [];
      const missions = await actor.listMissions();
      // Sort by created timestamp descending (newest first)
      return missions.sort((a, b) => Number(b.created - a.created));
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
}

export function useGetMission(missionId: bigint | null) {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission | null>({
    queryKey: ['mission', missionId?.toString()],
    queryFn: async () => {
      if (!actor || missionId === null) return null;
      return actor.getMission(missionId);
    },
    enabled: !!actor && status === 'ready' && missionId !== null && !!identity,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Refetch on mount for mission detail view
    retry: 1,
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
      return { missionId, title, tasks };
    },
    onSuccess: async () => {
      // Targeted invalidation
      await queryClient.invalidateQueries({ queryKey: ['missions'], exact: true });
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Mission creation failed:', errorMessage);
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
    onSuccess: async (_, variables) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['mission', variables.missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions'], exact: true });
    },
    onError: (error) => {
      const errorMessage = getActorErrorMessage(error);
      console.error('Mission update failed:', errorMessage);
      throw new Error(`Failed to update mission: ${errorMessage}`);
    },
  });
}

export function useAddTaskToMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, task }: { missionId: bigint; task: string }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      const newTask = await actor.addTaskToMission(missionId, task);
      return { missionId, newTask };
    },
    onMutate: async ({ missionId, task }) => {
      await queryClient.cancelQueries({ queryKey: ['mission', missionId.toString()] });
      
      const previousMission = queryClient.getQueryData<Mission>(['mission', missionId.toString()]);
      
      if (previousMission) {
        const optimisticTaskId = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
        const optimisticTask: Task = {
          taskId: optimisticTaskId,
          task,
          completed: false,
        };
        
        const updatedMission: Mission = {
          ...previousMission,
          tasks: [...previousMission.tasks, optimisticTask],
        };
        
        queryClient.setQueryData(['mission', missionId.toString()], updatedMission);
      }
      
      return { previousMission };
    },
    onError: (err, variables, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Add task failed:', errorMessage);
      if (context?.previousMission) {
        queryClient.setQueryData(['mission', variables.missionId.toString()], context.previousMission);
      }
      throw new Error(`Failed to add task: ${errorMessage}`);
    },
    onSuccess: async (data) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['mission', data.missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions'], exact: true });
    },
  });
}

export function useToggleTaskCompletion() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, taskId, completed }: { missionId: bigint; taskId: bigint; completed: boolean }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      
      const taskStatusUpdate: TaskStatusUpdate = { taskId, completed };
      await actor.toggleTaskCompletionStatus(missionId, taskStatusUpdate);
      
      return { missionId, taskId, completed };
    },
    onMutate: async ({ missionId, taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['mission', missionId.toString()] });
      
      const previousMission = queryClient.getQueryData<Mission>(['mission', missionId.toString()]);
      
      if (previousMission) {
        const updatedMission: Mission = {
          ...previousMission,
          tasks: previousMission.tasks.map(task =>
            task.taskId === taskId ? { ...task, completed } : task
          ),
        };
        
        queryClient.setQueryData(['mission', missionId.toString()], updatedMission);
      }
      
      return { previousMission };
    },
    onError: (err, variables, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Toggle task completion failed:', errorMessage);
      if (context?.previousMission) {
        queryClient.setQueryData(['mission', variables.missionId.toString()], context.previousMission);
      }
      throw new Error(`Failed to toggle task: ${errorMessage}`);
    },
    onSuccess: async (data) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['mission', data.missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions'], exact: true });
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
      await queryClient.cancelQueries({ queryKey: ['missions'] });
      
      const previousMissions = queryClient.getQueryData<Mission[]>(['missions']);
      
      queryClient.setQueryData<Mission[]>(['missions'], (old = []) =>
        old.filter(m => m.id !== missionId)
      );
      
      return { previousMissions };
    },
    onError: (err, missionId, context) => {
      const errorMessage = getActorErrorMessage(err);
      console.error('Mission deletion failed:', errorMessage);
      if (context?.previousMissions) {
        queryClient.setQueryData(['missions'], context.previousMissions);
      }
      throw new Error(`Failed to delete mission: ${errorMessage}`);
    },
    onSuccess: async (missionId) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['missions'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['mission', missionId.toString()], exact: true });
      // Also invalidate mission files/notes
      await queryClient.invalidateQueries({ queryKey: ['files', 'mission', missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'mission', missionId.toString()], exact: true });
    },
  });
}
