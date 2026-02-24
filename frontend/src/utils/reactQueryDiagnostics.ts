/**
 * React Query diagnostics helper for mission mutations
 * Logs mutation lifecycle phases for debugging
 */

type MutationPhase = 'start' | 'success' | 'error' | 'settled';

export function logMissionMutationPhase(
  mutationName: string,
  phase: MutationPhase,
  metadata?: Record<string, any>
) {
  // Only log in development mode
  if (!import.meta.env.DEV) return;

  const timestamp = new Date().toISOString();
  const prefix = `[RQ-Diag ${timestamp}]`;
  
  switch (phase) {
    case 'start':
      console.log(`${prefix} ${mutationName} started`, metadata || '');
      break;
    case 'success':
      console.log(`${prefix} ${mutationName} succeeded`, metadata || '');
      break;
    case 'error':
      console.error(`${prefix} ${mutationName} failed`, metadata || '');
      break;
    case 'settled':
      console.log(`${prefix} ${mutationName} settled`, metadata || '');
      break;
  }
}
