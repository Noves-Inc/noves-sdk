import { ApiResponse } from '../types/types';

const BASE_URL = 'https://translate.noves.fi';

/**
 * Make a request to the API.
 * @param {string} endpoint - The API endpoint to request.
 * @param {string} [method='GET'] - The HTTP method to use.
 * @param {RequestInit} [options={}] - Additional request options.
 * @returns {Promise<ApiResponse>} The response from the API.
 * @throws Will throw an error if the network response is not ok.
 */
export function createApiClient(ecosystem: string, apiKey: string) {
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/${ecosystem}/${endpoint}`, {
      ...options,
      method,
      headers: {
        ...options.headers,
        'apiKey': apiKey,
      },
    });

    const responseData = await response.json();
    return {
      succeeded: response.ok,
      response: responseData,
    };
  };
}