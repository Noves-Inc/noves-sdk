import { ApiResponse } from '../types/common';

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
    const url = `${TRANSLATE_URL}/${ecosystem}/${endpoint}`;
    
    const response = await retryFetch(url, {
      ...options,
      method,
      headers: {
        ...options.headers,
        'apiKey': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      return {
        succeeded: false,
        response: { message: 'Rate limit exceeded' },
        httpStatusCode: 429,
        errorType: 'RATE_LIMIT_EXCEEDED'
      };
    }

    // Handle unauthorized
    if (response.status === 401) {
      return {
        succeeded: false,
        response: { message: 'Unauthorized' },
        httpStatusCode: 401,
        errorType: 'UNAUTHORIZED'
      };
    }

    // Handle job not ready (425 Too Early)
    if (response.status === 425) {
      const responseData = await response.json();
      return {
        succeeded: false,
        response: { message: 'Job not ready yet', detail: responseData.detail },
        httpStatusCode: 425,
        errorType: 'JOB_NOT_READY'
      };
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      // Handle empty or invalid JSON responses
      return {
        succeeded: false,
        response: { message: 'Invalid response format' },
        httpStatusCode: response.status,
        errorType: 'INVALID_RESPONSE_FORMAT'
      };
    }

    if (!response.ok) {
      return {
        succeeded: false,
        response: responseData,
        httpStatusCode: response.status
      };
    }

    return {
      succeeded: true,
      response: responseData,
      httpStatusCode: response.status
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

    // Handle rate limiting
    if (response.status === 429) {
      return {
        succeeded: false,
        response: { message: 'Rate limit exceeded' },
        httpStatusCode: 429,
        errorType: 'RATE_LIMIT_EXCEEDED'
      };
    }

    // Handle unauthorized
    if (response.status === 401) {
      return {
        succeeded: false,
        response: { message: 'Unauthorized' },
        httpStatusCode: 401,
        errorType: 'UNAUTHORIZED'
      };
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      // Handle empty or invalid JSON responses
      return {
        succeeded: false,
        response: { message: 'Invalid response format' },
        httpStatusCode: response.status,
        errorType: 'INVALID_RESPONSE_FORMAT'
      };
    }

    if (!response.ok) {
      return {
        succeeded: false,
        response: responseData,
        httpStatusCode: response.status
      };
    }

    return {
      succeeded: true,
      response: responseData,
      httpStatusCode: response.status
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
      httpStatusCode: response.status
    };
  };
}