import type { Task } from '@/backend';

/**
 * BigInt-safe equality check for Task arrays.
 * Compares length and each task's taskId, task text, and completed status
 * without using JSON.stringify (which throws on BigInt).
 */
export function areTaskArraysEqual(a: Task[], b: Task[]): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    const taskA = a[i];
    const taskB = b[i];
    
    // Compare BigInt taskId using toString() or direct comparison
    if (taskA.taskId.toString() !== taskB.taskId.toString()) return false;
    if (taskA.task !== taskB.task) return false;
    if (taskA.completed !== taskB.completed) return false;
  }
  
  return true;
}
