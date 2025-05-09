// src/translate/translateUTXO.ts

import { Chain, PageOptions, Transaction } from '../types/types';
import { createTranslateClient } from '../utils/apiUtils';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { TransactionsPage } from './transactionsPage';

const ECOSYSTEM = 'utxo';

/**
 * Class representing the UTXO translation module.
 */
export class TranslateUTXO {
  private request: ReturnType<typeof createTranslateClient>;

  /**
   * Create a TranslateUTXO instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.request = createTranslateClient(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the UTXO blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    try {
      const result = await this.request('chains');
      if (!result || !result.response) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch chains'] });
      }
      throw error;
    }
  }

  /**
   * Get a supported chain by its name.
   * @param {string} name - The name of the chain to retrieve.
   * @returns {Promise<Chain>} A promise that resolves to the chain object or undefined if not found.
   * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
   */
  public async getChain(name: string): Promise<Chain> {
    try {
      const result = await this.request('chains');
      if (!result || !result.response) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      const chain = result.response.find((chain: Chain) => chain.name.toLowerCase() === name.toLowerCase());
      if (!chain) {
        throw new ChainNotFoundError(name);
      }
      return chain;
    } catch (error) {
      if (error instanceof ChainNotFoundError) {
        throw error;
      }
      if (error instanceof Response) {
        const errorResponse = await error.json();
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch chain'] });
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

      if (!result || !result.response || !Array.isArray(result.response.items)) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }

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
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch transactions'] });
      }
      throw error;
    }
  }

  /**
   * Utility endpoint for Bitcoin. Returns a list of derived addresses for the given xpub address.
   * @param {string} xpub - The xpub address to derive BTC addresses from.
   * @returns {Promise<String[]>} A promise that resolves to an array of derived addresses.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getAddressesByXpub(xpub: string): Promise<String[]> {
    try {
      const result = await this.request(`btc/addresses/${xpub}`);
      if (!result || !result.response || !Array.isArray(result.response)) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        } else if (errorResponse.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch addresses'] });
      }
      throw error;
    }
  }

  /**
   * Returns all of the available transaction information for the chain and transaction hash requested.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, txHash: string): Promise<Transaction> {
    try {
      const endpoint = `${chain}/tx/${txHash}`;
      const result = await this.request(endpoint);
      if (!result || !result.response || typeof result.response !== 'object') {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch transaction'] });
      }
      throw error;
    }
  }
}