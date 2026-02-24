import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import type { Mission, Task, TaskStatusUpdate } from '@/backend';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { logMissionMutationPhase } from '@/utils/reactQueryDiagnostics';

export function useListMissions() {
  const { actor, status } = useBackendActor();
  const { identity } = useInternetIdentity();

  return useQuery<Mission[]>({
    queryKey: ['missions', 'list'],
    queryFn: async () => {
      if (!actor) return [];
      const missions = await actor.listMissions();
      // Sort by created date descending (newest first) - BigInt-safe comparison
      return missions.sort((a, b) => {
        if (a.created > b.created) return -1;
        if (a.created < b.created) return 1;
        return 0;
      });
    },
    enabled: !!actor && status === 'ready' && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
      return actor.getMission(missionId);
    },
    enabled: !!actor && status === 'ready' && missionId !== null && !!identity,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Refetch on mount for mission detail
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

      logMissionMutationPhase('createMission', 'start', { title, taskCount: tasks.length });
      const missionId = await actor.createMission(title, tasks);
      logMissionMutationPhase('createMission', 'success', { missionId: missionId.toString() });
      
      return missionId;
    },
    onSuccess: async (missionId) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions', 'detail', missionId.toString()], exact: true });
    },
    onError: (error) => {
      logMissionMutationPhase('createMission', 'error', { error: String(error) });
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

      logMissionMutationPhase('updateMission', 'start', { missionId: missionId.toString(), title, taskCount: tasks.length });
      await actor.updateMission(missionId, title, tasks);
      logMissionMutationPhase('updateMission', 'success', { missionId: missionId.toString() });
      
      return { missionId, title, tasks };
    },
    onMutate: async ({ missionId, title, tasks }) => {
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionId.toString()] });
      
      const previousMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
      
      if (previousMission) {
        queryClient.setQueryData<Mission | null>(['missions', 'detail', missionId.toString()], {
          ...previousMission,
          title,
          tasks,
        });
      }
      
      return { previousMission };
    },
    onError: (err, { missionId }, context) => {
      logMissionMutationPhase('updateMission', 'error', { missionId: missionId.toString(), error: String(err) });
      const errorMessage = getActorErrorMessage(err);
      console.error('Mission update failed:', errorMessage);
      
      if (context?.previousMission) {
        queryClient.setQueryData(['missions', 'detail', missionId.toString()], context.previousMission);
      }
      
      throw new Error(`Failed to update mission: ${errorMessage}`);
    },
    onSuccess: async ({ missionId }) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['missions', 'detail', missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
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

      logMissionMutationPhase('addTaskToMission', 'start', { missionId: missionId.toString(), task });
      const newTask = await actor.addTaskToMission(missionId, task);
      logMissionMutationPhase('addTaskToMission', 'success', { missionId: missionId.toString(), taskId: newTask.taskId.toString() });
      
      return { missionId, newTask };
    },
    onMutate: async ({ missionId, task }) => {
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionId.toString()] });
      
      const previousMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
      
      if (previousMission) {
        // Generate collision-resistant temporary ID (timestamp + random component)
        const tempTaskId = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
        const optimisticTask: Task = {
          taskId: tempTaskId,
          task,
          completed: false,
        };
        
        queryClient.setQueryData<Mission | null>(['missions', 'detail', missionId.toString()], {
          ...previousMission,
          tasks: [...previousMission.tasks, optimisticTask],
        });
      }
      
      return { previousMission };
    },
    onError: (err, { missionId }, context) => {
      logMissionMutationPhase('addTaskToMission', 'error', { missionId: missionId.toString(), error: String(err) });
      const errorMessage = getActorErrorMessage(err);
      console.error('Add task failed:', errorMessage);
      
      if (context?.previousMission) {
        queryClient.setQueryData(['missions', 'detail', missionId.toString()], context.previousMission);
      }
      
      throw new Error(`Failed to add task: ${errorMessage}`);
    },
    onSuccess: async ({ missionId, newTask }) => {
      // Replace optimistic task with real task from backend
      const currentMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
      
      if (currentMission) {
        // Remove optimistic task and add real task
        const tasksWithoutOptimistic = currentMission.tasks.filter(t => t.taskId < BigInt(Date.now() * 1000));
        queryClient.setQueryData<Mission | null>(['missions', 'detail', missionId.toString()], {
          ...currentMission,
          tasks: [...tasksWithoutOptimistic, newTask],
        });
      }
      
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['missions', 'detail', missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
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

      logMissionMutationPhase('toggleTaskCompletion', 'start', { missionId: missionId.toString(), taskId: taskId.toString(), completed });
      
      const taskStatusUpdate: TaskStatusUpdate = {
        taskId,
        completed,
      };
      
      await actor.toggleTaskCompletionStatus(missionId, taskStatusUpdate);
      logMissionMutationPhase('toggleTaskCompletion', 'success', { missionId: missionId.toString(), taskId: taskId.toString() });
      
      return { missionId, taskId, completed };
    },
    onMutate: async ({ missionId, taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionId.toString()] });
      
      const previousMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
      
      if (previousMission) {
        // Optimistically update the task completion state
        queryClient.setQueryData<Mission | null>(['missions', 'detail', missionId.toString()], {
          ...previousMission,
          tasks: previousMission.tasks.map(t => 
            t.taskId === taskId ? { ...t, completed } : t
          ),
        });

        // Also update the missions list cache to keep progress in sync
        const missionsList = queryClient.getQueryData<Mission[]>(['missions', 'list']);
        if (missionsList) {
          queryClient.setQueryData<Mission[]>(['missions', 'list'], 
            missionsList.map(m => 
              m.id === missionId 
                ? { ...m, tasks: m.tasks.map(t => t.taskId === taskId ? { ...t, completed } : t) }
                : m
            )
          );
        }
      }
      
      return { previousMission, missionId, taskId, completed };
    },
    onError: (err, variables, context) => {
      logMissionMutationPhase('toggleTaskCompletion', 'error', { missionId: variables.missionId.toString(), error: String(err) });
      const errorMessage = getActorErrorMessage(err);
      console.error('Toggle task completion failed:', errorMessage);
      
      // Rollback only if the cache still reflects this specific optimistic update
      if (context?.previousMission) {
        const currentMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', context.missionId.toString()]);
        const currentTask = currentMission?.tasks.find(t => t.taskId === context.taskId);
        
        // Only rollback if the current state matches what we optimistically set
        if (currentTask && currentTask.completed === context.completed) {
          queryClient.setQueryData(['missions', 'detail', context.missionId.toString()], context.previousMission);
          
          // Also rollback missions list
          const missionsList = queryClient.getQueryData<Mission[]>(['missions', 'list']);
          if (missionsList) {
            queryClient.setQueryData<Mission[]>(['missions', 'list'], 
              missionsList.map(m => 
                m.id === context.missionId && context.previousMission
                  ? { ...m, tasks: context.previousMission.tasks }
                  : m
              )
            );
          }
        }
      }
      
      throw new Error(`Failed to toggle task completion: ${errorMessage}`);
    },
    onSuccess: async (data) => {
      // Mark queries as stale without forcing immediate refetch
      // This prevents snap-back while ensuring eventual consistency
      queryClient.invalidateQueries({ 
        queryKey: ['missions', 'detail', data.missionId.toString()], 
        exact: true,
        refetchType: 'none' // Don't refetch immediately, just mark stale
      });
      queryClient.invalidateQueries({ 
        queryKey: ['missions', 'list'], 
        exact: true,
        refetchType: 'none' // Don't refetch immediately, just mark stale
      });
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

      logMissionMutationPhase('deleteMission', 'start', { missionId: missionId.toString() });
      await actor.deleteMission(missionId);
      logMissionMutationPhase('deleteMission', 'success', { missionId: missionId.toString() });
      
      return missionId;
    },
    onMutate: async (missionId) => {
      await queryClient.cancelQueries({ queryKey: ['missions', 'list'] });
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionId.toString()] });
      
      const previousMissions = queryClient.getQueryData<Mission[]>(['missions', 'list']);
      const previousMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionId.toString()]);
      
      queryClient.setQueryData<Mission[]>(['missions', 'list'], (old = []) => 
        old.filter(m => m.id !== missionId)
      );
      
      queryClient.removeQueries({ queryKey: ['missions', 'detail', missionId.toString()], exact: true });
      
      return { previousMissions, previousMission };
    },
    onError: (err, missionId, context) => {
      logMissionMutationPhase('deleteMission', 'error', { missionId: missionId.toString(), error: String(err) });
      const errorMessage = getActorErrorMessage(err);
      console.error('Mission deletion failed:', errorMessage);
      
      if (context?.previousMissions) {
        queryClient.setQueryData(['missions', 'list'], context.previousMissions);
      }
      if (context?.previousMission) {
        queryClient.setQueryData(['missions', 'detail', missionId.toString()], context.previousMission);
      }
      
      throw new Error(`Failed to delete mission: ${errorMessage}`);
    },
    onSuccess: async (missionId) => {
      // Targeted invalidations
      await queryClient.invalidateQueries({ queryKey: ['missions', 'list'], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['missions', 'detail', missionId.toString()], exact: true });
      
      // Also invalidate files/notes that might have been attached to this mission
      await queryClient.invalidateQueries({ queryKey: ['files', 'mission', missionId.toString()], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['notes', 'mission', missionId.toString()], exact: true });
    },
  });
}
