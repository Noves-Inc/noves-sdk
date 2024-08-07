import { ApiResponse } from '../types/types';

const TRANSLATE_URL = 'https://translate.noves.fi';
const FORESIGHT_URL = 'https://foresight.noves.fi';

/**
 * Make a request to the API.
 * @param {string} endpoint - The API endpoint to request.
 * @param {string} [method='GET'] - The HTTP method to use.
 * @param {RequestInit} [options={}] - Additional request options.
 * @returns {Promise<ApiResponse>} The response from the API.
 * @throws Will throw an error if the network response is not ok.
 */
export function createTranslateClient(ecosystem: string, apiKey: string) {
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const response = await fetch(`${TRANSLATE_URL}/${ecosystem}/${endpoint}`, {
      ...options,
      method,
      headers: {
        ...options.headers,
        'apiKey': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    return {
      succeeded: response.ok,
      response: responseData,
    };
  };
}

export function createForesightClient(apiKey: string) {
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const response = await fetch(`${FORESIGHT_URL}/evm/${endpoint}`, {
      ...options,
      method,
      headers: {
        ...options.headers,
        'apiKey': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    return {
      succeeded: response.ok,
      response: responseData,
    };
  };
}