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
import { ErrorType } from '../errors/ErrorTypes';
import { constructUrl } from '../utils/urlUtils';
import { BaseTranslate } from './baseTranslate';
import { RetryConfig } from '../types/common';

const ECOSYSTEM = 'move';

/**
 * Class representing the Move translation module.
 */
export class TranslateMOVE extends BaseTranslate {
  /**
   * Create a TranslateMOVE instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @param {Partial<RetryConfig>} [retryConfig] - Optional retry configuration for enhanced resilience.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string, retryConfig?: Partial<RetryConfig>) {
    super(ECOSYSTEM, apiKey, retryConfig);
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
    const result = await this.makeRequest('chains');
    
    if (!this.validateResponse(result, [])) {
      throw new TransactionError(
        { message: ['Invalid response format from chains endpoint'] },
        ErrorType.INVALID_RESPONSE_FORMAT
      );
    }

    return result as MOVETranslateChains;
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
    const result = await this.makeRequest('txTypes');
    
    if (!this.validateResponse(result, ['version', 'transactionTypes'])) {
      throw new TransactionError(
        { message: ['Invalid response format from transaction types endpoint'] },
        ErrorType.INVALID_RESPONSE_FORMAT
      );
    }

    return result as MOVETranslateTransactionTypesResponse;
  }

  /**
   * Returns a single Move VM transaction.
   * @param {string} chain - The name of the chain to retrieve the transaction from.
   * @param {string} txId - The transaction ID/hash to retrieve.
   * @returns {Promise<MOVETranslateTransaction>} A promise that resolves to the transaction data.
   * @throws Will throw an error if the transaction is not found or if there's an API error.
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
        { message: ['Chain and transaction ID are required'] },
        ErrorType.INVALID_REQUEST
      );
    }

    const endpoint = `${chain}/tx/${txId}`;
    const result = await this.makeRequest(endpoint);
    
    if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'classificationData', 'rawTransactionData'])) {
      throw new TransactionError(
        { message: ['Invalid response format from transaction endpoint'] },
        ErrorType.INVALID_RESPONSE_FORMAT
      );
    }

    return result as MOVETranslateTransaction;
  }

  /**
   * Returns a paginated list of Move VM transactions for an address.
   * @param {string} chain - The name of the chain to retrieve transactions from.
   * @param {string} address - The address to retrieve transactions for.
   * @param {PageOptions} [pageOptions={}] - Optional pagination parameters.
   * @returns {Promise<TransactionsPage<MOVETranslateTransaction>>} A promise that resolves to a paginated list of transactions.
   * @throws Will throw an error if the address is invalid or if there's an API error.
   * 
   * @example
   * ```typescript
   * const translate = Translate.move("YOUR_API_KEY");
   * const transactions = await translate.getTransactions("sui", "0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874");
   * 
   * // Iterate through transactions
   * for (const tx of transactions.transactions) {
   *   console.log(`${tx.rawTransactionData.digest}: ${tx.classificationData.type}`);
   * }
   * 
   * // Get next page if available
   * if (transactions.hasNextPage()) {
   *   const nextPage = await transactions.getNextPage();
   * }
   * ```
   */
  public async getTransactions(
    chain: string, 
    address: string, 
    pageOptions: PageOptions = {}
  ): Promise<TransactionsPage<MOVETranslateTransaction>> {
    if (!chain || !address) {
      throw new TransactionError(
        { message: ['Chain and address are required'] },
        ErrorType.INVALID_REQUEST
      );
    }

    const endpoint = `${chain}/txs/${address}`;
    const url = constructUrl(endpoint, pageOptions);
    const result = await this.makeRequest(url);
    
    // Validate response structure
    if (!this.validateResponse(result, ['items'])) {
      throw new TransactionError(
        { message: ['Invalid response format from transactions endpoint'] },
        ErrorType.INVALID_RESPONSE_FORMAT
      );
    }

    const response = result as MOVETranslateTransactionsResponse;
    
    // Extract next page keys from the response
    const nextPageKeys = this.extractNextPageKeys(response);
    
    return new TransactionsPage(this, {
      chain,
      walletAddress: address,
      transactions: response.items,
      currentPageKeys: pageOptions,
      nextPageKeys
    });
  }

  /**
   * Extract next page keys from the API response for pagination.
   * @param {MOVETranslateTransactionsResponse} response - The API response.
   * @returns {PageOptions | null} The next page options or null if no next page.
   * @private
   */
  private extractNextPageKeys(response: MOVETranslateTransactionsResponse): PageOptions | null {
    if (!response.nextPageUrl) {
      return null;
    }
    
    const nextPageKeys: PageOptions = {};
    
    // Parse the nextPageUrl to extract pagination parameters
    try {
      const url = new URL(response.nextPageUrl, 'https://translate.noves.fi');
      const pageNumber = url.searchParams.get('pageNumber');
      const pageSize = url.searchParams.get('pageSize');
      const sort = url.searchParams.get('sort');
      
      if (pageNumber) nextPageKeys.pageNumber = parseInt(pageNumber, 10);
      if (pageSize) nextPageKeys.pageSize = parseInt(pageSize, 10);
      if (sort && (sort === 'desc' || sort === 'asc')) nextPageKeys.sort = sort;
      
      // Return the parsed keys if we have any, otherwise null
      return Object.keys(nextPageKeys).length > 0 ? nextPageKeys : null;
    } catch (error) {
      // If URL parsing fails, no next page is available
      return null;
    }
  }
}
