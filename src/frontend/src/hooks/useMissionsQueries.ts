import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '@/contexts/ActorContext';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorNotReadyError, getActorErrorMessage } from '@/utils/actorInitializationMessaging';
import { diagnoseMissionCache, logDeleteMutationLifecycle, formatActorError } from '@/utils/reactQueryDiagnostics';
import type { Mission, Task, TaskStatusUpdate } from '@/backend';

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
    staleTime: 1000, // Reduced to 1 second for fresher data on re-entry
    gcTime: 15 * 60 * 1000,
    refetchOnMount: true, // Always refetch when re-entering mission detail
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
      // Fetch the actual persisted mission from the backend to ensure
      // the UI reflects the exact completion state stored in the backend
      if (!actor) {
        console.error('[useCreateMission] Actor not available after mission creation');
        return;
      }

      try {
        const persistedMission = await actor.getMission(missionId);
        
        if (persistedMission) {
          // Update missions list cache with the persisted mission (newest first)
          queryClient.setQueryData<Mission[]>(['missions', 'list'], (old) => {
            if (!old) return [persistedMission];
            // Insert at the beginning to maintain newest-first order
            return [persistedMission, ...old];
          });

          // Set the mission detail cache with the persisted data
          queryClient.setQueryData(['missions', 'detail', missionId.toString()], persistedMission);
        }
      } catch (error) {
        console.error('[useCreateMission] Failed to fetch persisted mission:', error);
        // Don't throw - the mission was created successfully, just log the error
      }

      // Invalidate to ensure consistency with backend
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

export function useAddTaskToMission() {
  const { actor, status } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, taskText }: { missionId: bigint; taskText: string }) => {
      if (!actor || status !== 'ready') {
        throw createActorNotReadyError();
      }
      const newTask = await actor.addTaskToMission(missionId, taskText);
      return { missionId, newTask };
    },
    onMutate: async ({ missionId, taskText }) => {
      const missionIdStr = missionId.toString();
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionIdStr] });
      await queryClient.cancelQueries({ queryKey: ['missions', 'list'] });

      // Snapshot the previous values
      const previousMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionIdStr]);
      const previousMissions = queryClient.getQueryData<Mission[]>(['missions', 'list']);

      // Create optimistic task with collision-resistant temporary ID
      const optimisticTask: Task = {
        taskId: BigInt(`${Date.now()}${Math.random().toString().slice(2, 8)}`),
        task: taskText,
        completed: false,
      };

      // Optimistically update mission detail cache
      queryClient.setQueryData<Mission | null>(
        ['missions', 'detail', missionIdStr],
        (old) => {
          if (!old) return null;
          return {
            ...old,
            tasks: [...old.tasks, optimisticTask],
          };
        }
      );

      // Optimistically update missions list cache
      queryClient.setQueryData<Mission[]>(
        ['missions', 'list'],
        (old) => {
          if (!old) return old;
          return old.map((mission) =>
            mission.id.toString() === missionIdStr
              ? {
                  ...mission,
                  tasks: [...mission.tasks, optimisticTask],
                }
              : mission
          );
        }
      );

      // Return context with snapshots for rollback
      return { previousMission, previousMissions, optimisticTask };
    },
    onSuccess: (data, variables, context) => {
      const missionIdStr = data.missionId.toString();
      const { newTask } = data;

      // Replace optimistic task with real task from backend, preserving any user-toggled completion state
      queryClient.setQueryData<Mission | null>(
        ['missions', 'detail', missionIdStr],
        (old) => {
          if (!old) return null;
          
          // Find the optimistic task to check if user toggled it
          const optimisticTaskInCache = old.tasks.find(
            t => t.taskId.toString() === context?.optimisticTask.taskId.toString()
          );
          
          // Remove the exact optimistic task by its temporary ID
          const tasksWithoutOptimistic = old.tasks.filter(
            t => t.taskId.toString() !== context?.optimisticTask.taskId.toString()
          );
          
          // Add the real task from backend, preserving user's completion state if they toggled it
          const finalTask: Task = {
            ...newTask,
            completed: optimisticTaskInCache ? optimisticTaskInCache.completed : newTask.completed,
          };
          
          return {
            ...old,
            tasks: [...tasksWithoutOptimistic, finalTask],
          };
        }
      );

      // Update missions list cache with real task, preserving completion state
      queryClient.setQueryData<Mission[]>(
        ['missions', 'list'],
        (old) => {
          if (!old) return old;
          return old.map((mission) => {
            if (mission.id.toString() !== missionIdStr) return mission;
            
            // Find the optimistic task to check if user toggled it
            const optimisticTaskInCache = mission.tasks.find(
              t => t.taskId.toString() === context?.optimisticTask.taskId.toString()
            );
            
            // Remove the exact optimistic task by its temporary ID
            const tasksWithoutOptimistic = mission.tasks.filter(
              t => t.taskId.toString() !== context?.optimisticTask.taskId.toString()
            );
            
            // Add the real task from backend, preserving user's completion state if they toggled it
            const finalTask: Task = {
              ...newTask,
              completed: optimisticTaskInCache ? optimisticTaskInCache.completed : newTask.completed,
            };
            
            return {
              ...mission,
              tasks: [...tasksWithoutOptimistic, finalTask],
            };
          });
        }
      );
    },
    onError: (err, variables, context) => {
      const missionIdStr = variables.missionId.toString();
      const errorMessage = getActorErrorMessage(err);
      console.error('[useAddTaskToMission] Add task failed:', errorMessage);

      // Rollback optimistic updates on error
      if (context?.previousMission !== undefined) {
        queryClient.setQueryData(['missions', 'detail', missionIdStr], context.previousMission);
      }
      if (context?.previousMissions !== undefined) {
        queryClient.setQueryData(['missions', 'list'], context.previousMissions);
      }
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
      
      // Check if this is an optimistic task (temporary ID) - if so, skip backend call
      const taskIdStr = taskId.toString();
      
      // Optimistic tasks have very large IDs (timestamp-based)
      // Real backend tasks have sequential small IDs
      const isOptimisticTask = taskId > BigInt(1000000000000);
      
      if (isOptimisticTask) {
        // For optimistic tasks, just update the cache without calling backend
        // The backend call will happen when the add-task mutation settles
        return { missionId, taskId, completed, wasOptimistic: true };
      }
      
      // For real tasks, call the backend
      const taskStatusUpdate: TaskStatusUpdate = {
        taskId,
        completed,
      };
      await actor.toggleTaskCompletionStatus(missionId, taskStatusUpdate);
      return { missionId, taskId, completed, wasOptimistic: false };
    },
    onMutate: async ({ missionId, taskId, completed }) => {
      const missionIdStr = missionId.toString();
      const taskIdStr = taskId.toString();
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['missions', 'detail', missionIdStr] });
      await queryClient.cancelQueries({ queryKey: ['missions', 'list'] });

      // Snapshot the previous values
      const previousMission = queryClient.getQueryData<Mission | null>(['missions', 'detail', missionIdStr]);
      const previousMissions = queryClient.getQueryData<Mission[]>(['missions', 'list']);

      // Optimistically update mission detail cache - only toggle the specific task by exact taskId match
      queryClient.setQueryData<Mission | null>(
        ['missions', 'detail', missionIdStr],
        (old) => {
          if (!old) return null;
          return {
            ...old,
            tasks: old.tasks.map(t =>
              t.taskId.toString() === taskIdStr
                ? { ...t, completed }
                : t
            ),
          };
        }
      );

      // Optimistically update missions list cache - only toggle the specific task by exact taskId match
      queryClient.setQueryData<Mission[]>(
        ['missions', 'list'],
        (old) => {
          if (!old) return old;
          return old.map((mission) =>
            mission.id.toString() === missionIdStr
              ? {
                  ...mission,
                  tasks: mission.tasks.map(t =>
                    t.taskId.toString() === taskIdStr
                      ? { ...t, completed }
                      : t
                  ),
                }
              : mission
          );
        }
      );

      // Return context with snapshots for rollback
      return { previousMission, previousMissions, taskIdStr, intendedCompleted: completed };
    },
    onError: (err, variables, context) => {
      const missionIdStr = variables.missionId.toString();
      const errorMessage = getActorErrorMessage(err);
      console.error('[useToggleTaskCompletion] Toggle task failed:', errorMessage);

      // Rollback optimistic updates on error
      if (context?.previousMission !== undefined) {
        queryClient.setQueryData(['missions', 'detail', missionIdStr], context.previousMission);
      }
      if (context?.previousMissions !== undefined) {
        queryClient.setQueryData(['missions', 'list'], context.previousMissions);
      }
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
