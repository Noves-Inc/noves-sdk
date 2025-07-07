/**
 * Error types for the Noves SDK
 */

/**
 * Enum for different error types that can occur in the SDK
 */
export enum ErrorType {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Job status errors
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  JOB_PROCESSING = 'JOB_PROCESSING',
  JOB_NOT_READY = 'JOB_NOT_READY',
  
  // Request/Response errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_RESPONSE_FORMAT = 'INVALID_RESPONSE_FORMAT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * Error code to message mapping for consistent error messages
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.UNAUTHORIZED]: 'Unauthorized',
  [ErrorType.INVALID_API_KEY]: 'Invalid API Key',
  [ErrorType.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ErrorType.JOB_NOT_FOUND]: 'Job does not exist',
  [ErrorType.JOB_PROCESSING]: 'Job is still processing. Please try again in a few moments.',
  [ErrorType.JOB_NOT_READY]: 'Job not ready yet',
  [ErrorType.INVALID_REQUEST]: 'Invalid request',
  [ErrorType.INVALID_RESPONSE_FORMAT]: 'Invalid response format from API',
  [ErrorType.NETWORK_ERROR]: 'Network error occurred',
  [ErrorType.UNKNOWN_ERROR]: 'An unknown error occurred',
  [ErrorType.VALIDATION_ERROR]: 'Validation error occurred'
};

/**
 * Error code to HTTP status code mapping
 */
export const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.INVALID_API_KEY]: 401,
  [ErrorType.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorType.JOB_NOT_FOUND]: 404,
  [ErrorType.JOB_PROCESSING]: 425,
  [ErrorType.JOB_NOT_READY]: 425,
  [ErrorType.INVALID_REQUEST]: 400,
  [ErrorType.INVALID_RESPONSE_FORMAT]: 500,
  [ErrorType.NETWORK_ERROR]: 500,
  [ErrorType.UNKNOWN_ERROR]: 500,
  [ErrorType.VALIDATION_ERROR]: 400
}; 