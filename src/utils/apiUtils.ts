import { ApiResponse } from '../types/types';

const TRANSLATE_URL = 'https://translate.noves.fi';
const FORESIGHT_URL = 'https://foresight.noves.fi';
const PRICING_URL = 'https://pricing.noves.fi';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryFetch(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
}

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
    const response = await retryFetch(`${TRANSLATE_URL}/${ecosystem}/${endpoint}`, {
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
    const response = await retryFetch(`${FORESIGHT_URL}/${endpoint}`, {
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

export function createPricingClient(ecosystem: string, apiKey: string) {
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const response = await retryFetch(`${PRICING_URL}/${ecosystem}/${endpoint}`, {
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