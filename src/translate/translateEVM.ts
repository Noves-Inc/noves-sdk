// src/translate/translateEVM.ts

import { ApiResponse, Chain } from '../types/types';

const BASE_URL = 'https://translate.noves.fi';
const ECOSYSTEM = 'evm';

/**
 * Class representing the EVM translation module.
 */
class Translate {
  private apiKey: string;

  /**
   * Create a TranslateEVM instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Make a request to the API.
   * @param {string} endpoint - The API endpoint to request.
   * @param {RequestInit} [options={}] - Additional request options.
   * @returns {Promise<ApiResponse>} The response from the API.
   * @throws Will throw an error if the network response is not ok.
   * @private
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/${ECOSYSTEM}/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'apiKey': this.apiKey,
      },
    });

    const responseData = await response.json();
    return {
      succeeded: response.ok,
      response: responseData,
    };
  }

  /**
   * Get a list of chains.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    const result = await this.request('chains');
    return result.response;
  }

  public async getTransaction(chain: string, txHash: string): Promise<ApiResponse> {
    return this.request(`txs/${chain}/${txHash}`);
  }
}

/**
 * Create a TranslateEVM instance.
 * @param {string} apiKey - The API key to authenticate requests.
 * @returns {TranslateEVM} An instance of TranslateEVM.
 */
export const TranslateEVM = (apiKey: string) => new Translate(apiKey);
