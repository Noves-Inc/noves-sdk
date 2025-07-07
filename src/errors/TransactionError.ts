// src/errors/TransactionError.ts

import { ErrorType, ERROR_MESSAGES } from './ErrorTypes';

/**
 * Custom error class for handling transaction validation errors.
 */
export class TransactionError extends Error {
  errors: Record<string, string[]>;
  errorType: ErrorType;
  httpStatusCode?: number;
  details?: any;

  /**
   * Creates an instance of TransactionError.
   * @param {Record<string, string[]>} errors - The validation errors.
   * @param {ErrorType} [errorType=ErrorType.UNKNOWN_ERROR] - The type of error.
   * @param {number} [httpStatusCode] - The HTTP status code associated with the error.
   * @param {any} [details] - Additional error details.
   */
  constructor(
    errors: Record<string, string[]>,
    errorType: ErrorType = ErrorType.UNKNOWN_ERROR,
    httpStatusCode?: number,
    details?: any
  ) {
    super(ERROR_MESSAGES[errorType] || 'Transaction validation error');
    this.name = 'TransactionError';
    this.errors = errors;
    this.errorType = errorType;
    this.httpStatusCode = httpStatusCode;
    this.details = details;
  }

  /**
   * Check if this error is of a specific type.
   * @param {ErrorType} type - The error type to check.
   * @returns {boolean} True if the error matches the specified type.
   */
  isErrorType(type: ErrorType): boolean {
    return this.errorType === type;
  }

  /**
   * Check if this error indicates a job not found.
   * @returns {boolean} True if the error indicates a job not found.
   */
  isJobNotFound(): boolean {
    return this.errorType === ErrorType.JOB_NOT_FOUND;
  }

  /**
   * Check if this error indicates a job is still processing.
   * @returns {boolean} True if the error indicates a job is processing.
   */
  isJobProcessing(): boolean {
    return this.errorType === ErrorType.JOB_PROCESSING || this.errorType === ErrorType.JOB_NOT_READY;
  }

  /**
   * Check if this error indicates rate limiting.
   * @returns {boolean} True if the error indicates rate limiting.
   */
  isRateLimited(): boolean {
    return this.errorType === ErrorType.RATE_LIMIT_EXCEEDED;
  }

  /**
   * Check if this error indicates authorization issues.
   * @returns {boolean} True if the error indicates authorization issues.
   */
  isUnauthorized(): boolean {
    return this.errorType === ErrorType.UNAUTHORIZED || this.errorType === ErrorType.INVALID_API_KEY;
  }
}