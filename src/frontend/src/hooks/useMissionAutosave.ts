import { useRef, useEffect, useCallback } from 'react';
import { useUpdateMission } from './useMissionsQueries';
import type { Task } from '@/backend';

interface AutosaveOptions {
  missionId: bigint;
  title: string;
  tasks: Task[];
  debounceMs?: number;
  enabled?: boolean; // New: allow parent to control when autosave is active
}

export function useMissionAutosave({ 
  missionId, 
  title, 
  tasks, 
  debounceMs = 1000,
  enabled = true 
}: AutosaveOptions) {
  const updateMutation = useUpdateMission();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<{ title: string; tasks: Task[] } | null>(null);
  const isSavingRef = useRef(false);
  
  // Track the last hydrated state to detect actual user changes
  const lastHydratedStateRef = useRef<{ title: string; tasks: Task[]; missionId: string } | null>(null);
  
  // Track current mission ID to detect mission switches
  const currentMissionIdRef = useRef<string>(missionId.toString());

  // Reset state when mission changes
  useEffect(() => {
    const newMissionId = missionId.toString();
    if (currentMissionIdRef.current !== newMissionId) {
      // Clear any pending saves for the previous mission
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      pendingUpdateRef.current = null;
      isSavingRef.current = false;
      lastHydratedStateRef.current = null;
      currentMissionIdRef.current = newMissionId;
    }
  }, [missionId]);

  const performSave = useCallback(async (saveTitle: string, saveTasks: Task[]) => {
    if (isSavingRef.current) {
      // If already saving, queue the update
      pendingUpdateRef.current = { title: saveTitle, tasks: saveTasks };
      return;
    }

    isSavingRef.current = true;
    pendingUpdateRef.current = null;

    try {
      await updateMutation.mutateAsync({
        missionId,
        title: saveTitle,
        tasks: saveTasks,
      });

      // Update the last hydrated state to reflect what was just saved
      lastHydratedStateRef.current = {
        title: saveTitle,
        tasks: saveTasks,
        missionId: missionId.toString(),
      };

      // If there's a pending update, perform it now
      if (pendingUpdateRef.current) {
        const { title: nextTitle, tasks: nextTasks } = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        isSavingRef.current = false;
        await performSave(nextTitle, nextTasks);
      } else {
        isSavingRef.current = false;
      }
    } catch (error) {
      isSavingRef.current = false;
      // Error is already handled by the mutation hook
      throw error;
    }
  }, [missionId, updateMutation]);

  const triggerSave = useCallback(() => {
    // Don't save if autosave is disabled
    if (!enabled) {
      return;
    }

    // Don't save if we haven't hydrated yet (no baseline to compare against)
    if (!lastHydratedStateRef.current) {
      return;
    }

    // Don't save if nothing has changed from the last hydrated state
    const hasChanges = 
      lastHydratedStateRef.current.title !== title ||
      JSON.stringify(lastHydratedStateRef.current.tasks) !== JSON.stringify(tasks);

    if (!hasChanges) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new debounced save
    timeoutRef.current = setTimeout(() => {
      performSave(title, tasks);
    }, debounceMs);
  }, [title, tasks, debounceMs, performSave, enabled]);

  // Trigger save when title or tasks change
  useEffect(() => {
    triggerSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [triggerSave]);

  // Cleanup on unmount - cancel any pending saves
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Public method to mark state as hydrated (called by parent after loading mission data)
  const markAsHydrated = useCallback((hydratedTitle: string, hydratedTasks: Task[]) => {
    lastHydratedStateRef.current = {
      title: hydratedTitle,
      tasks: hydratedTasks,
      missionId: missionId.toString(),
    };
  }, [missionId]);

  return {
    isSaving: updateMutation.isPending || isSavingRef.current,
    error: updateMutation.error,
    markAsHydrated,
  };
}
