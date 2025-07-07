import { createTranslateClient } from '../utils/apiUtils';
import { ApiResponse } from '../types/common';
import { TransactionError } from '../errors/TransactionError';
import { ErrorType } from '../errors/ErrorTypes';

/**
 * Base class for all translate implementations.
 * Provides common functionality and structure for all blockchain translation modules.
 */
export abstract class BaseTranslate {
  protected readonly ecosystem: string;
  private readonly client: ReturnType<typeof createTranslateClient>;

  /**
   * Create a BaseTranslate instance.
   * @param {string} ecosystem - The blockchain ecosystem identifier.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(ecosystem: string, apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.ecosystem = ecosystem;
    this.client = createTranslateClient(ecosystem, apiKey);
  }

  /**
   * Make a request to the API.
   * @param {string} endpoint - The API endpoint to request.
   * @param {string} [method='GET'] - The HTTP method to use.
   * @param {RequestInit} [options={}] - Additional request options.
   * @returns {Promise<any>} The response from the API.
   * @throws Will throw an error if the request fails or returns an error response.
   */
  protected async makeRequest(endpoint: string, method: string = 'GET', options: RequestInit = {}): Promise<any> {
    const result: ApiResponse = await this.client(endpoint, method, options);
    
    // Handle error responses
    if (!result.succeeded) {
      // Use structured error types when available
      if (result.errorType) {
        const errorType = result.errorType as ErrorType;
        const errors = result.response?.errors || { message: [result.response?.message || 'Request failed'] };
        throw new TransactionError(errors, errorType, result.httpStatusCode, result.response);
      }

      // Legacy error handling with structured error types
      if (result.response?.message === 'Unauthorized') {
        throw new TransactionError({ message: ['Invalid API Key'] }, ErrorType.INVALID_API_KEY, result.httpStatusCode);
      }
      if (result.response?.message === 'Rate limit exceeded') {
        throw new TransactionError({ message: ['Rate limit exceeded'] }, ErrorType.RATE_LIMIT_EXCEEDED, result.httpStatusCode);
      }
      if (result.response?.message === 'Job not ready yet') {
        throw new TransactionError({ message: ['Job is still processing. Please try again in a few moments.'] }, ErrorType.JOB_NOT_READY, result.httpStatusCode);
      }
      if (result.response?.message === 'Invalid response format') {
        throw new TransactionError({ message: ['Invalid response format from API'] }, ErrorType.INVALID_RESPONSE_FORMAT, result.httpStatusCode);
      }

      // Handle job not found based on error message content
      if (result.response?.message && typeof result.response.message === 'string' && result.response.message.includes('does not exist')) {
        throw new TransactionError({ message: [result.response.message] }, ErrorType.JOB_NOT_FOUND, result.httpStatusCode);
      }

      // Handle job processing based on error message content
      if (result.response?.message && typeof result.response.message === 'string' && result.response.message.includes('Job is still processing')) {
        throw new TransactionError({ message: [result.response.message] }, ErrorType.JOB_PROCESSING, result.httpStatusCode);
      }

      // Handle structured error responses
      if (result.response?.errors) {
        throw new TransactionError(result.response.errors, ErrorType.VALIDATION_ERROR, result.httpStatusCode);
      }
      if (result.response?.status === 400 && result.response?.errors) {
        throw new TransactionError({ message: [result.response.title || 'Request failed'] }, ErrorType.INVALID_REQUEST, result.httpStatusCode);
      }
      if (result.response?.detail) {
        throw new TransactionError({ message: [result.response.detail] }, ErrorType.UNKNOWN_ERROR, result.httpStatusCode);
      }

      // Default error handling
      throw new TransactionError({ message: [result.response?.message || 'Request failed'] }, ErrorType.UNKNOWN_ERROR, result.httpStatusCode);
    }

    // Handle empty responses
    if (!result.response) {
      return Array.isArray(result.response) ? [] : {};
    }

    return result.response;
  }

  /**
   * Validate the response structure.
   * @param {any} response - The response to validate.
   * @param {string[]} requiredFields - The required fields in the response.
   * @returns {boolean} True if the response is valid, false otherwise.
   */
  protected validateResponse(response: any, requiredFields: string[]): boolean {
    if (!response) {
      return false;
    }

    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    return true;
  }
} 