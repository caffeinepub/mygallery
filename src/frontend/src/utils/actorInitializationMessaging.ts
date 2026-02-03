/**
 * Utility for standardizing actor initialization error detection and user-facing messaging.
 */

export const ACTOR_NOT_READY_MESSAGE = 'Please wait while the app initializes...';
export const ACTOR_ERROR_MESSAGE = 'Unable to connect. Please try again.';
export const ACTOR_INIT_FAILED_MESSAGE = 'Connection failed. Please retry or sign in again.';

/**
 * Checks if an error is related to actor not being initialized/ready.
 */
export function isActorNotReadyError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    errorMessage.includes('Actor not initialized') ||
    errorMessage.includes('actor not initialized') ||
    errorMessage.includes('Actor is not ready') ||
    errorMessage.includes('actor is not ready') ||
    errorMessage.includes('Cannot initialize actor')
  );
}

/**
 * Checks if an error is related to actor initialization failure.
 */
export function isActorInitializationError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    errorMessage.includes('initialization failed') ||
    errorMessage.includes('Failed to initialize') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('access control')
  );
}

/**
 * Returns a user-friendly error message for actor-related errors.
 */
export function getActorErrorMessage(error: unknown): string {
  if (isActorNotReadyError(error)) {
    return ACTOR_NOT_READY_MESSAGE;
  }
  
  if (isActorInitializationError(error)) {
    return ACTOR_INIT_FAILED_MESSAGE;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ACTOR_ERROR_MESSAGE;
}

/**
 * Creates a standardized actor-not-ready error.
 */
export function createActorNotReadyError(): Error {
  return new Error(ACTOR_NOT_READY_MESSAGE);
}
