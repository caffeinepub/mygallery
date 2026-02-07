import { useRef, useEffect, useCallback } from 'react';
import { useUpdateMission } from './useMissionsQueries';
import { areTaskArraysEqual } from '@/utils/missionTaskCompare';
import type { Task } from '@/backend';

interface AutosaveOptions {
  missionId: bigint;
  title: string;
  tasks: Task[];
  debounceMs?: number;
  enabled?: boolean;
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
  // Store a deep copy to prevent mutation issues
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

    try {
      await updateMutation.mutateAsync({
        missionId,
        title: saveTitle,
        tasks: saveTasks,
      });

      // Update the hydrated state after successful save with a deep copy
      lastHydratedStateRef.current = {
        title: saveTitle,
        tasks: saveTasks.map(t => ({ ...t })),
        missionId: missionId.toString(),
      };

      // If there's a pending update, process it
      if (pendingUpdateRef.current) {
        const pending = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        isSavingRef.current = false;
        await performSave(pending.title, pending.tasks);
      } else {
        isSavingRef.current = false;
      }
    } catch (error) {
      console.error('[useMissionAutosave] Save failed:', error);
      isSavingRef.current = false;
      pendingUpdateRef.current = null;
    }
  }, [missionId, updateMutation]);

  // Debounced autosave effect
  useEffect(() => {
    if (!enabled) return;

    // Check if this is the initial hydration (no changes yet)
    if (!lastHydratedStateRef.current) {
      return;
    }

    // Check if data has actually changed from the hydrated state
    // Use BigInt-safe comparison instead of JSON.stringify
    const hasChanged = 
      lastHydratedStateRef.current.title !== title ||
      !areTaskArraysEqual(lastHydratedStateRef.current.tasks, tasks);

    if (!hasChanged) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      performSave(title, tasks);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [title, tasks, enabled, debounceMs, performSave]);

  // Method to mark the mission as hydrated with initial data
  const markAsHydrated = useCallback((initialTitle: string, initialTasks: Task[]) => {
    // Store a deep copy to prevent mutation issues
    lastHydratedStateRef.current = {
      title: initialTitle,
      tasks: initialTasks.map(t => ({ ...t })),
      missionId: missionId.toString(),
    };
  }, [missionId]);

  // Method to immediately flush any pending save
  const flushPendingSave = useCallback(async (currentTitle: string, currentTasks: Task[]) => {
    // Cancel any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If not enabled or not hydrated, skip
    if (!enabled || !lastHydratedStateRef.current) {
      return;
    }

    // Check if data has actually changed from the hydrated state
    // Use BigInt-safe comparison instead of JSON.stringify
    const hasChanged = 
      lastHydratedStateRef.current.title !== currentTitle ||
      !areTaskArraysEqual(lastHydratedStateRef.current.tasks, currentTasks);

    if (!hasChanged) {
      return;
    }

    // Perform immediate save
    await performSave(currentTitle, currentTasks);
  }, [enabled, performSave]);

  return {
    isSaving: isSavingRef.current || updateMutation.isPending,
    markAsHydrated,
    flushPendingSave,
  };
}
