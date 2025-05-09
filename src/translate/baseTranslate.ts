import { createTranslateClient } from '../utils/apiUtils';
import { ApiResponse } from '../types/types';
import { TransactionError } from '../errors/TransactionError';

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
      if (result.response?.message === 'Unauthorized') {
        throw new TransactionError({ message: ['Invalid API Key'] });
      }
      if (result.response?.message === 'Rate limit exceeded') {
        throw new TransactionError({ message: ['Rate limit exceeded'] });
      }
      if (result.response?.message === 'Invalid response format') {
        throw new TransactionError({ message: ['Invalid response format from API'] });
      }
      if (result.response?.errors) {
        throw new TransactionError(result.response.errors);
      }
      if (result.response?.status === 400 && result.response?.errors) {
        throw new TransactionError({ message: [result.response.title || 'Request failed'] });
      }
      if (result.response?.detail) {
        throw new TransactionError({ message: [result.response.detail] });
      }
      throw new TransactionError({ message: [result.response?.message || 'Request failed'] });
    }

    // Handle empty responses
    if (!result.response) {
      return Array.isArray(result.response) ? [] : {};
    }

    // Return the response data
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