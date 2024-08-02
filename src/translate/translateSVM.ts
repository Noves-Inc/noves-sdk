// src/translate/translateSVM.ts

import { Chain, DescribeTransaction, HistoryData, PageOptions, Transaction } from '../types/types';
import { createApiClient } from '../utils/apiUtils';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { TransactionsPage } from './transactionsPage';
import { constructUrl, parseUrl } from '../utils/urlUtils';

const ECOSYSTEM = 'svm';

/**
 * Class representing the SVM translation module.
 */
export class TranslateSVM {
  private request: ReturnType<typeof createApiClient>;

  /**
   * Create a TranslateSVM instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.request = createApiClient(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the SVM blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
  * Returns all of the available transaction information for the signature requested.
  * @param {string} chain - The chain name. Defaults to solana.
  * @param {string} signature - The signature.
  * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
  * @throws {TransactionError} If there are validation errors in the request.
  */
  public async getTransaction(chain: string = 'solana', signature: string): Promise<Transaction> {
    try {
      const result = await this.request(`${chain}/tx/${signature}`);
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
   * @param {string} accountAddress - The account address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<Transaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<Transaction>> {
    try {
      const endpoint = `${chain}/txs/${accountAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.request(url);

      const initialData = {
        chain: chain,
        walletAddress: accountAddress,
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
 * Create a TranslateSVM instance.
 * @param {string} apiKey - The API key to authenticate requests.
 * @returns {TranslateSVM} An instance of TranslateSVM.
 */
//export const TranslateSVM = (apiKey: string) => new Translate(apiKey);