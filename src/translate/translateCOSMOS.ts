import { Chain, PageOptions, Transaction, CosmosBalancesResponse, CosmosTransactionJob, CosmosTransactionJobResponse } from '../types/types';
import { TransactionError } from '../errors/TransactionError';
import { TransactionsPage } from './transactionsPage';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { validateCosmosAddress } from '../utils/cosmosUtils';
import { CosmosAddressError, CosmosTransactionJobError } from '../errors/CosmosError';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'cosmos';

/**
 * Class representing the COSMOS translation module.
 */
export class TranslateCOSMOS extends BaseTranslate {
  /**
   * Create a TranslateCOSMOS instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    super(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the COSMOS blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    const result = await this.makeRequest('chains');
    return Array.isArray(result) ? result : [];
  }

  /**
   * Returns all of the available transaction information for the signature requested.
   * @param {string} chain - The chain name.
   * @param {string} hash - The transaction signature.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, hash: string): Promise<Transaction> {
    try {
      return await this.makeRequest(`${chain}/tx/${hash}`);
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: [error instanceof Error ? error.message : 'Failed to get transaction'] });
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
      const result = await this.makeRequest(url);

      const initialData = {
        chain: chain,
        walletAddress: accountAddress,
        transactions: result.items || [],
        currentPageKeys: pageOptions,
        nextPageKeys: result.hasNextPage ? parseUrl(result.nextPageUrl) : null,
      };
      return new TransactionsPage(this, initialData);
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: [error instanceof Error ? error.message : 'Failed to get transactions'] });
    }
  }

  /**
   * Get token balances for an account
   * @param {string} chain - The chain name
   * @param {string} accountAddress - The account address
   * @returns {Promise<CosmosBalancesResponse>} A promise that resolves to the balances
   * @throws {TransactionError} If there are validation errors in the request
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string
  ): Promise<CosmosBalancesResponse> {
    try {
      const result = await this.makeRequest(`${chain}/tokens/balancesOf/${accountAddress}`);
      
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      
      // Validate each token balance in the array
      for (const balance of result) {
        if (!this.validateResponse(balance, ['balance', 'token'])) {
          throw new TransactionError({ message: ['Invalid token balance format'] });
        }
        if (!this.validateResponse(balance.token, ['symbol', 'name', 'decimals', 'address', 'icon'])) {
          throw new TransactionError({ message: ['Invalid token format'] });
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: [error instanceof Error ? error.message : 'Failed to get token balances'] });
    }
  }

  /**
   * Start a transaction job for an account
   * @param {string} chain - The chain name
   * @param {string} accountAddress - The account address
   * @param {number} startBlock - The start block
   * @param {number} endBlock - The end block
   * @returns {Promise<CosmosTransactionJob>} A promise that resolves to the job details
   * @throws {CosmosAddressError} If the account address is invalid
   * @throws {TransactionError} If there are validation errors in the request
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string,
    startBlock: number = 0,
    endBlock: number = 0
  ): Promise<CosmosTransactionJob> {
    if (!validateCosmosAddress(accountAddress)) {
      throw new CosmosAddressError(accountAddress);
    }

    try {
      return await this.makeRequest(`${chain}/txs/job/start`, 'POST', {
        body: JSON.stringify({ accountAddress, startBlock, endBlock })
      });
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: [error instanceof Error ? error.message : 'Failed to start transaction job'] });
    }
  }

  /**
   * Get transaction job results
   * @param {string} chain - The chain name
   * @param {string} pageId - The page ID from the job
   * @returns {Promise<CosmosTransactionJobResponse>} A promise that resolves to the job results
   * @throws {CosmosTransactionJobError} If the job has failed
   * @throws {TransactionError} If there are validation errors in the request
   */
  public async getTransactionJobResults(
    chain: string,
    pageId: string
  ): Promise<CosmosTransactionJobResponse> {
    try {
      const response = await this.makeRequest(`${chain}/txs/job/${pageId}`);

      if (response.status === 'failed') {
        throw new CosmosTransactionJobError(pageId, response.status);
      }

      return response;
    } catch (error) {
      if (error instanceof CosmosTransactionJobError) {
        throw error;
      }
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: [error instanceof Error ? error.message : 'Failed to get transaction job results'] });
    }
  }
}