// src/errors/TransactionError.ts

import { ErrorType, ERROR_MESSAGES } from './ErrorTypes';

/**
 * Retry metadata interface for enhanced error debugging and analysis.
 */
export interface RetryMetadata {
  /** Number of retry attempts made before final failure */
  attempts: number;
  /** Total duration of all retry attempts in milliseconds */
  totalDuration: number;
  /** Recent error history leading to this failure */
  errorHistory: Array<{
    errorType: ErrorType;
    timestamp: number;
    recoveryTime?: number;
  }>;
  /** Recent performance assessment at time of failure */
  recentPerformance: 'good' | 'degraded' | 'poor';
}

/**
 * Custom error class for handling transaction validation errors.
 * Enhanced with retry intelligence and metadata for better debugging.
 */
export class TransactionError extends Error {
  errors: Record<string, string[]>;
  errorType: ErrorType;
  httpStatusCode?: number;
  details?: any;
  retryMetadata?: RetryMetadata;

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
    const customMessage = errorType === ErrorType.VALIDATION_ERROR && errors.message && errors.message.length > 0 
      ? errors.message[0] 
      : undefined;
    super(customMessage || ERROR_MESSAGES[errorType] || 'Transaction validation error');
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

  /**
   * Check if this error has retry metadata attached.
   * @returns {boolean} True if retry metadata is available.
   */
  hasRetryMetadata(): boolean {
    return this.retryMetadata !== undefined;
  }

  /**
   * Get the number of retry attempts made before this final failure.
   * @returns {number} Number of attempts, or 0 if no retry metadata.
   */
  getRetryAttempts(): number {
    return this.retryMetadata?.attempts || 0;
  }

  /**
   * Get the total duration of all retry attempts.
   * @returns {number} Total duration in milliseconds, or 0 if no retry metadata.
   */
  getRetryDuration(): number {
    return this.retryMetadata?.totalDuration || 0;
  }

  /**
   * Get the recent performance assessment at time of failure.
   * @returns {string} Performance level or 'unknown' if no retry metadata.
   */
  getPerformanceLevel(): 'good' | 'degraded' | 'poor' | 'unknown' {
    return this.retryMetadata?.recentPerformance || 'unknown';
  }

  /**
   * Get a summary of the error pattern that led to this failure.
   * @returns {string[]} Array of error types in chronological order.
   */
  getErrorPattern(): ErrorType[] {
    return this.retryMetadata?.errorHistory.map(e => e.errorType) || [];
  }

  /**
   * Check if this error resulted from exhausted retries.
   * @returns {boolean} True if this error is the result of failed retry attempts.
   */
  isRetryExhausted(): boolean {
    return this.hasRetryMetadata() && this.getRetryAttempts() > 1;
  }

  /**
   * Get a human-readable summary of retry information.
   * @returns {string} Formatted summary of retry attempts and performance.
   */
  getRetrySummary(): string {
    if (!this.hasRetryMetadata()) {
      return 'No retry attempts made';
    }

    const attempts = this.getRetryAttempts();
    const duration = this.getRetryDuration();
    const performance = this.getPerformanceLevel();
    const pattern = this.getErrorPattern();

    return `${attempts} retry attempts over ${duration}ms (performance: ${performance}, pattern: ${pattern.join(' → ')})`;
  }
}