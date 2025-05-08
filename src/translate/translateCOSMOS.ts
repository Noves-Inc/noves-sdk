import { Chain, PageOptions, Transaction, CosmosBalancesResponse, CosmosTransactionJob, CosmosTransactionJobResponse } from '../types/types';
import { createTranslateClient } from '../utils/apiUtils';
import { TransactionError } from '../errors/TransactionError';
import { TransactionsPage } from './transactionsPage';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { validateCosmosAddress } from '../utils/cosmosUtils';
import { CosmosAddressError, CosmosTransactionJobError } from '../errors/CosmosError';

const ECOSYSTEM = 'cosmos';

/**
 * Class representing the COSMOS translation module.
 */
export class TranslateCOSMOS {
  private request: ReturnType<typeof createTranslateClient>;

  /**
   * Create a TranslateCOSMOS instance.
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
   * Returns a list with the names of the COSMOS blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
   * Returns all of the available transaction information for the signature requested.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction signature.
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

  /**
   * Get token balances for an account
   * @param {string} chain - The chain name
   * @param {string} accountAddress - The account address
   * @returns {Promise<CosmosBalancesResponse>} A promise that resolves to the balances
   * @throws {CosmosAddressError} If the account address is invalid
   * @throws {TransactionError} If there are validation errors in the request
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string
  ): Promise<CosmosBalancesResponse> {
    if (!validateCosmosAddress(accountAddress)) {
      throw new CosmosAddressError(accountAddress);
    }

    try {
      const result = await this.request(`${chain}/tokens/balancesOf/${accountAddress}`);
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
   * Start a transaction job for an account
   * @param {string} chain - The chain name
   * @param {string} accountAddress - The account address
   * @returns {Promise<CosmosTransactionJob>} A promise that resolves to the job details
   * @throws {CosmosAddressError} If the account address is invalid
   * @throws {TransactionError} If there are validation errors in the request
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string
  ): Promise<CosmosTransactionJob> {
    if (!validateCosmosAddress(accountAddress)) {
      throw new CosmosAddressError(accountAddress);
    }

    try {
      const result = await this.request(`${chain}/txs/job/start`, 'POST', {
        body: JSON.stringify({ accountAddress })
      });
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
      const result = await this.request(`${chain}/txs/job/${pageId}`);
      const response = result.response;

      if (response.status === 'failed') {
        throw new CosmosTransactionJobError(pageId, response.status);
      }

      return response;
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