// src/translate/translateEVM.ts

import { ApiResponse, Chain, PageOptions, Transaction } from '../types/types';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';

const BASE_URL = 'https://translate.noves.fi';
const ECOSYSTEM = 'evm';

/**
 * Class representing the EVM translation module.
 */
export class Translate {
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

  /**
   * Get a chain by its name.
   * @param {string} name - The name of the chain to retrieve.
   * @returns {Promise<Chain>} A promise that resolves to the chain object or undefined if not found.
   * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
   */
  public async getChain(name: string): Promise<Chain> {
    const result = await this.request('chains');
    const chain = result.response.find((chain: Chain) => chain.name.toLowerCase() === name.toLowerCase());
    if (!chain) {
      throw new ChainNotFoundError(name);
    }
    return chain;
  }


  /**
   * Get a transaction by its hash.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, txHash: string): Promise<Transaction> {
    try {
      const result = await this.request(`${chain}/tx/${txHash}`);
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      throw error;
    }
  }

  /**
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @returns {Promise<TransactionsPage>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage> {
    try {
      const endpoint = `${chain}/txs/${walletAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.request(url);

      const initialData = {
        chain: chain,
        walletAddress: walletAddress,
        transactions: result.response.items,
        currentPageKeys: pageOptions,
        nextPageKeys: result.response.hasNextPage ? parseUrl(result.response.nextPageUrl) : null,
      };
      return new TransactionsPage(this, initialData);
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      throw error;
    }
  }
}

/**
 * Create a TranslateEVM instance.
 * @param {string} apiKey - The API key to authenticate requests.
 * @returns {TranslateEVM} An instance of TranslateEVM.
 */
export const TranslateEVM = (apiKey: string) => new Translate(apiKey);