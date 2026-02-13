// src/translate/translateMOVE.ts

import { 
  MOVETranslateChains,
  MOVETranslateTransaction,
  MOVETranslateTransactionTypesResponse,
  MOVETranslateTransactionsResponse
} from '../types/move';
import { PageOptions } from '../types/common';
import { TransactionsPage } from './transactionsPage';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { BaseTranslate } from './baseTranslate';
import { RetryConfig, FetchConfig } from '../types/common';

const ECOSYSTEM = 'move';

/**
 * Class representing the Move translation module.
 */
export class TranslateMOVE extends BaseTranslate {
  /**
   * Create a TranslateMOVE instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @param {Partial<RetryConfig>} [retryConfig] - Optional retry configuration for enhanced resilience.
   * @param {FetchConfig} [fetchConfig] - Optional fetch configuration for timeouts, abort signals, and custom headers.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string, retryConfig?: Partial<RetryConfig>, fetchConfig?: FetchConfig) {
    super(ECOSYSTEM, apiKey, retryConfig, fetchConfig);
  }

  /**
   * Returns a list with the names of the Move blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<MOVETranslateChains>} A promise that resolves to an array of chains.
   * 
   * @example
   * ```typescript
   * const translate = Translate.move("YOUR_API_KEY");
   * const chains = await translate.getChains();
   * console.log(chains); // [{ name: "sui", ecosystem: "move", nativeCoin: {...}, tier: 2 }]
   * ```
   */
  public async getChains(): Promise<MOVETranslateChains> {
    try {
      const result = await this.makeRequest('chains');
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get chains'] });
    }
  }

  /**
   * Returns a list of all the transaction types supported by the classification system, 
   * with their corresponding descriptions.
   * @returns {Promise<MOVETranslateTransactionTypesResponse>} A promise that resolves to transaction types data.
   * 
   * @example
   * ```typescript
   * const translate = Translate.move("YOUR_API_KEY");
   * const txTypes = await translate.getTransactionTypes();
   * console.log(txTypes.transactionTypes); // [{ type: "swap", description: "Token swap transaction" }, ...]
   * ```
   */
  public async getTransactionTypes(): Promise<MOVETranslateTransactionTypesResponse> {
    try {
      const result = await this.makeRequest('txTypes');
      if (!result || !result.version || !Array.isArray(result.transactionTypes)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction types'] });
    }
  }

  /**
   * Returns a single Move VM transaction.
   * @param {string} chain - The name of the chain to retrieve the transaction from.
   * @param {string} txId - The transaction ID/digest to retrieve.
   * @returns {Promise<MOVETranslateTransaction>} A promise that resolves to the transaction data.
   * @throws {TransactionError} If there are validation errors in the request.
   * 
   * @example
   * ```typescript
   * const translate = Translate.move("YOUR_API_KEY");
   * const transaction = await translate.getTransaction("sui", "FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK");
   * console.log(transaction.classificationData.type); // "failed"
   * ```
   */
  public async getTransaction(chain: string, txId: string): Promise<MOVETranslateTransaction> {
    if (!chain || !txId) {
      throw new TransactionError(
        { message: ['Chain and transaction ID are required'] }
      );
    }

    try {
      const result = await this.makeRequest(`${chain}/tx/${txId}`);
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction'] });
    }
  }

  /**
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The name of the chain to retrieve transactions from.
   * @param {string} walletAddress - The wallet address to retrieve transactions for.
   * @param {PageOptions} [pageOptions={}] - Optional pagination parameters.
   * @returns {Promise<TransactionsPage<MOVETranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
   * 
   * @example
   * ```typescript
   * const translate = Translate.move("YOUR_API_KEY");
   * const page = await translate.getTransactions("sui", "0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874");
   * 
   * // Get current page of transactions
   * const txs = page.getTransactions();
   * for (const tx of txs) {
   *   console.log(`${tx.rawTransactionData.digest}: ${tx.classificationData.type}`);
   * }
   * 
   * // Fetch next page
   * if (page.hasNext()) {
   *   await page.next();
   * }
   * ```
   */
  public async getTransactions(
    chain: string, 
    walletAddress: string, 
    pageOptions: PageOptions = {}
  ): Promise<TransactionsPage<MOVETranslateTransaction>> {
    if (!chain || !walletAddress) {
      throw new TransactionError(
        { message: ['Chain and wallet address are required'] }
      );
    }

    try {
      const endpoint = `${chain}/txs/${walletAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!result.items || !Array.isArray(result.items)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      const response = result as MOVETranslateTransactionsResponse;

      const initialData = {
        chain,
        walletAddress,
        transactions: response.items,
        currentPageKeys: pageOptions,
        nextPageKeys: response.nextPageUrl ? parseUrl(response.nextPageUrl) : null,
      };

      return new TransactionsPage(this, initialData);
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transactions'] });
    }
  }
}
