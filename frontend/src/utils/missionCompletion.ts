import type { Mission, Task } from '@/backend';

/**
 * Calculate mission progress percentage
 */
export function calculateMissionProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.completed).length;
  return (completed / tasks.length) * 100;
}

/**
 * Determine if a mission is completed
 * A mission is completed only when it has at least 1 task and 100% progress
 */
export function isMissionCompleted(mission: Mission): boolean {
  if (mission.tasks.length === 0) return false;
  const progress = calculateMissionProgress(mission.tasks);
  return progress === 100;
}

/**
 * Split missions into incomplete and completed lists
 */
export function splitMissionsByCompletion(missions: Mission[]): {
  incomplete: Mission[];
  completed: Mission[];
} {
  const incomplete: Mission[] = [];
  const completed: Mission[] = [];

  for (const mission of missions) {
    if (isMissionCompleted(mission)) {
      completed.push(mission);
    } else {
      incomplete.push(mission);
    }
  }

  return { incomplete, completed };
}
