/**
 * Utility for standardizing actor initialization error detection and user-facing messaging.
 */

export const ACTOR_NOT_READY_MESSAGE = 'Please wait while the app initializes...';
export const ACTOR_ERROR_MESSAGE = 'Unable to connect. Please try again.';
export const ACTOR_INIT_FAILED_MESSAGE = 'Connection failed. Please retry or sign in again.';
export const CANISTER_STOPPED_MESSAGE = 'The backend service is temporarily unavailable. Reconnecting automatically...';
export const INVALID_ADMIN_TOKEN_MESSAGE = 'Invalid or expired admin token. Please sign out, remove the token from the URL, and try again.';

export interface ErrorClassification {
  isStoppedCanister: boolean;
  isActorNotReady: boolean;
  isInitializationError: boolean;
  isInvalidAdminToken: boolean;
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
    errorMessage.includes('Failed to initialize')
  );
}

/**
 * Checks if an error is related to invalid admin token/secret.
 * Note: Stopped-canister errors take precedence over this classification.
 */
export function isInvalidAdminTokenError(error: unknown): boolean {
  if (!error) return false;
  
  // First check if it's a stopped canister - that takes precedence
  if (isCanisterStoppedError(error)) {
    return false;
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerErrorMessage = errorMessage.toLowerCase();
  
  return (
    lowerErrorMessage.includes('unauthorized') ||
    lowerErrorMessage.includes('access control') ||
    lowerErrorMessage.includes('invalid secret') ||
    lowerErrorMessage.includes('invalid token') ||
    lowerErrorMessage.includes('authentication failed')
  );
}

/**
 * Checks if an error is related to a stopped canister (IC0508).
 * This is the highest priority classification for recoverability.
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
  
  // Check for reject code 5 (which indicates canister stopped/stopping)
  if (errorString.includes('"reject_code":5') || 
      errorString.includes('"reject_code": 5') ||
      errorString.includes('reject_code: 5') ||
      errorString.includes('Reject code: 5')) {
    return true;
  }
  
  // Check for destination invalid (often means canister is stopped)
  if (lowerErrorString.includes('destination invalid')) {
    return true;
  }
  
  return false;
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
 * Classifies an error into categories for UI decision-making.
 * Stopped-canister classification takes precedence over invalid-admin-token.
 */
export function classifyError(error: unknown): ErrorClassification {
  const isStoppedCanister = isCanisterStoppedError(error);
  
  return {
    isStoppedCanister,
    isActorNotReady: isActorNotReadyError(error),
    isInitializationError: isActorInitializationError(error),
    // Invalid admin token is only true if NOT a stopped canister
    isInvalidAdminToken: !isStoppedCanister && isInvalidAdminTokenError(error),
  };
}

/**
 * Maps an actor initialization error to a user-friendly summary, technical details, and classification.
 */
export function mapActorInitError(error: unknown): { 
  summary: string; 
  technicalDetails: string;
  classification: ErrorClassification;
} {
  const technicalDetails = serializeErrorDetails(error);
  const classification = classifyError(error);
  
  // Check for stopped canister first (most specific and highest priority)
  if (classification.isStoppedCanister) {
    return {
      summary: CANISTER_STOPPED_MESSAGE,
      technicalDetails,
      classification,
    };
  }
  
  // Check for invalid admin token
  if (classification.isInvalidAdminToken) {
    return {
      summary: INVALID_ADMIN_TOKEN_MESSAGE,
      technicalDetails,
      classification,
    };
  }
  
  // Check for actor not ready
  if (classification.isActorNotReady) {
    return {
      summary: ACTOR_NOT_READY_MESSAGE,
      technicalDetails,
      classification,
    };
  }
  
  // Check for initialization errors
  if (classification.isInitializationError) {
    return {
      summary: ACTOR_INIT_FAILED_MESSAGE,
      technicalDetails,
      classification,
    };
  }
  
  // Generic error
  return {
    summary: ACTOR_ERROR_MESSAGE,
    technicalDetails,
    classification,
  };
}

/**
 * Returns a user-friendly error message for actor-related errors.
 * @deprecated Use mapActorInitError instead for better error handling
 */
export function getActorErrorMessage(error: unknown): string {
  if (isCanisterStoppedError(error)) {
    return CANISTER_STOPPED_MESSAGE;
  }
  
  if (isInvalidAdminTokenError(error)) {
    return INVALID_ADMIN_TOKEN_MESSAGE;
  }
  
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
