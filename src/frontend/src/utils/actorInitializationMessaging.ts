/**
 * Utility for standardizing actor initialization error detection and user-facing messaging.
 */

export const ACTOR_NOT_READY_MESSAGE = 'Please wait while the app initializes...';
export const ACTOR_ERROR_MESSAGE = 'Unable to connect. Please try again.';
export const ACTOR_INIT_FAILED_MESSAGE = 'Connection failed. Please retry or sign in again.';
export const CANISTER_STOPPED_MESSAGE = 'The backend service is currently unavailable. This usually means the canister needs to be restarted by the administrator.';

/**
 * Error classification for actor initialization failures.
 */
export type ErrorClassification = 
  | 'transient-canister-unavailable'  // Cold start, stopped canister, destination invalid
  | 'authorization'                    // Access control, permission errors
  | 'network'                          // Network connectivity issues
  | 'unknown';                         // Other errors

/**
 * Standardized error information for actor initialization.
 */
export interface ClassifiedError {
  classification: ErrorClassification;
  summary: string;
  technicalDetails: string;
  isRetryable: boolean;
}

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
 * Checks if an error is related to a stopped/unavailable canister (transient cold-start error).
 * This is the standardized detector used by both cold-start retry and error UI.
 */
export function isCanisterStoppedError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error instanceof Error ? error.message : String(error);
  const lowerErrorString = errorString.toLowerCase();
  
  // Check for IC0508 error code (canister stopped)
  if (errorString.includes('IC0508') || errorString.includes('ic0508')) {
    return true;
  }
  
  // Check for "is stopped" or "canister stopped" message
  if (lowerErrorString.includes('is stopped') || lowerErrorString.includes('canister stopped')) {
    return true;
  }
  
  // Check for "stopping" state
  if (lowerErrorString.includes('is stopping') || lowerErrorString.includes('canister stopping')) {
    return true;
  }
  
  // Check for reject code 5 (which indicates canister stopped/stopping)
  if (errorString.includes('"reject_code":5') || 
      errorString.includes('"reject_code": 5') ||
      errorString.includes('reject_code: 5')) {
    return true;
  }
  
  // Check for destination invalid (often means canister is stopped or warming up)
  if (lowerErrorString.includes('destination invalid')) {
    return true;
  }
  
  // Check for "unavailable" or "not available"
  if (lowerErrorString.includes('unavailable') || lowerErrorString.includes('not available')) {
    return true;
  }
  
  return false;
}

/**
 * Checks if an error is authorization-related.
 */
export function isAuthorizationError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error instanceof Error ? error.message : String(error);
  const lowerErrorString = errorString.toLowerCase();
  
  return (
    lowerErrorString.includes('unauthorized') ||
    lowerErrorString.includes('permission denied') ||
    lowerErrorString.includes('access denied') ||
    lowerErrorString.includes('forbidden')
  );
}

/**
 * Checks if an error is network-related.
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error instanceof Error ? error.message : String(error);
  const lowerErrorString = errorString.toLowerCase();
  
  return (
    lowerErrorString.includes('network') ||
    lowerErrorString.includes('timeout') ||
    lowerErrorString.includes('connection') ||
    lowerErrorString.includes('fetch failed')
  );
}

/**
 * Extracts technical details from an error for debugging purposes.
 * Preserves reject_code, reject_message, and other structured error fields.
 */
export function serializeErrorDetails(error: unknown): string {
  if (!error) return 'No error details available';
  
  if (error instanceof Error) {
    // Try to extract structured error information
    const errorObj = error as any;
    
    // Build a structured details object
    const details: Record<string, any> = {
      message: error.message,
    };
    
    // Preserve common IC error fields
    if (errorObj.reject_code !== undefined) details.reject_code = errorObj.reject_code;
    if (errorObj.reject_message) details.reject_message = errorObj.reject_message;
    if (errorObj.error_code) details.error_code = errorObj.error_code;
    if (errorObj.canister_id) details.canister_id = errorObj.canister_id;
    if (error.stack) details.stack = error.stack;
    
    // If we have structured fields, return formatted JSON
    if (Object.keys(details).length > 1) {
      try {
        return JSON.stringify(details, null, 2);
      } catch {
        return error.message;
      }
    }
    
    return error.message;
  }
  
  if (typeof error === 'object') {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  
  return String(error);
}

/**
 * Classifies an actor initialization error into a standardized category.
 * This is the single source of truth for error classification used by both
 * cold-start retry logic and error UI rendering.
 */
export function classifyActorInitError(error: unknown): ErrorClassification {
  // Check for transient canister unavailability first (most specific for cold start)
  if (isCanisterStoppedError(error)) {
    return 'transient-canister-unavailable';
  }
  
  // Check for authorization errors
  if (isAuthorizationError(error)) {
    return 'authorization';
  }
  
  // Check for network errors
  if (isNetworkError(error)) {
    return 'network';
  }
  
  // Unknown error type
  return 'unknown';
}

/**
 * Maps an actor initialization error to a user-friendly summary and technical details.
 * Now includes standardized classification for retry logic.
 */
export function mapActorInitError(error: unknown): ClassifiedError {
  const technicalDetails = serializeErrorDetails(error);
  const classification = classifyActorInitError(error);
  
  // Determine if error is retryable based on classification
  const isRetryable = classification === 'transient-canister-unavailable' || classification === 'network';
  
  let summary: string;
  
  switch (classification) {
    case 'transient-canister-unavailable':
      summary = CANISTER_STOPPED_MESSAGE;
      break;
    case 'authorization':
      summary = 'Authorization failed. Please sign in again.';
      break;
    case 'network':
      summary = 'Network connection failed. Please check your internet connection.';
      break;
    case 'unknown':
    default:
      if (isActorNotReadyError(error)) {
        summary = ACTOR_NOT_READY_MESSAGE;
      } else if (isActorInitializationError(error)) {
        summary = ACTOR_INIT_FAILED_MESSAGE;
      } else {
        summary = ACTOR_ERROR_MESSAGE;
      }
      break;
  }
  
  return {
    classification,
    summary,
    technicalDetails,
    isRetryable
  };
}

/**
 * Returns a user-friendly error message for actor-related errors.
 * @deprecated Use mapActorInitError instead for better error handling
 */
export function getActorErrorMessage(error: unknown): string {
  const mapped = mapActorInitError(error);
  return mapped.summary;
}

/**
 * Creates a standardized actor-not-ready error.
 */
export function createActorNotReadyError(): Error {
  return new Error(ACTOR_NOT_READY_MESSAGE);
}
