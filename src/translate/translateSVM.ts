// src/translate/translateSVM.ts

import { PageOptions } from '../types/common';
import { 
  SVMTranslateChain,
  SVMTranslateChainsResponse,
  SVMTranslateTransactionType,
  SVMTranslateTransactionTypesResponse,
  SVMTranslateTransactionJob,
  SVMTranslateTransactionJobResponse,
  SVMTranslateDeleteTransactionJobResponse,
  SVMTranslateTokenBalance,
  SVMTranslateTransactionCountResponse,
  SVMTranslateTransactionCountJobStartResponse,
  SVMTranslateStakingTransactionsResponse,
  SVMTranslateStakingEpochResponse,
  SVMTranslateDescribeTransaction,
  SVMTranslateSPLAccounts,
  SVMTranslateTransactionV4,
  SVMTranslateTransactionV5,
  SVMTranslateTransaction,
  SVMTranslateTransactionsResponse,
  SVMTranslateToken,
  SVMTranslateAccount,
  SVMTranslateTransfer,
  SVMTranslateRawTransactionData,
  SVMTranslateSourceV4,
  SVMTranslateSourceV5,
  SVMTranslateTokenBalancesResponse
} from '../types/svm';
import { createTranslateClient } from '../utils/apiUtils';
import { TransactionError } from '../errors/TransactionError';
import { TransactionsPage, PaginatedItem } from './transactionsPage';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'svm';

// Local type aliases for backward compatibility within this file
type Token = SVMTranslateToken;
type DescribeTransaction = SVMTranslateDescribeTransaction;
type Account = SVMTranslateAccount;
type Transfer = SVMTranslateTransfer;
type RawTransactionData = SVMTranslateRawTransactionData;
type SourceV4 = SVMTranslateSourceV4;
type SourceV5 = SVMTranslateSourceV5;
type SPLAccounts = SVMTranslateSPLAccounts;
type SVMBalancesResponse = SVMTranslateTokenBalancesResponse;
type SVMTransactionV4 = SVMTranslateTransactionV4;
type SVMTransactionV5 = SVMTranslateTransactionV5;
type SVMTransaction = SVMTranslateTransaction;

/**
 * Class representing the SVM translation module.
 */
export class TranslateSVM extends BaseTranslate {
  private request: ReturnType<typeof createTranslateClient>;

  /**
   * Create a TranslateSVM instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    super(ECOSYSTEM, apiKey);
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.request = createTranslateClient(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the SVM blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<SVMTranslateChainsResponse>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<SVMTranslateChainsResponse> {
    const result = await this.makeRequest('chains');
    return result;
  }

  /**
   * Returns all of the available transaction information for the signature requested.
   * @param {string} chain - The chain name. Defaults to solana.
   * @param {string} signature - The transaction signature.
   * @param {number} [txTypeVersion=5] - Optional. The transaction type version to use (4 or 5). Defaults to 5.
   * @returns {Promise<SVMTransactionV4 | SVMTransactionV5>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string = 'solana', signature: string, txTypeVersion: number = 5): Promise<SVMTransactionV4 | SVMTransactionV5> {
    try {
      if (txTypeVersion !== 4 && txTypeVersion !== 5) {
        throw new TransactionError({ message: ['Invalid txTypeVersion. Must be either 4 or 5'] });
      }
      const result = await this.makeRequest(`${chain}/tx/v${txTypeVersion}/${signature}`);
      
      // Check if the response indicates an error
      if (result.classificationData?.type === 'error') {
        throw new TransactionError({ message: ['Transaction not found or invalid'] });
      }

      if (txTypeVersion === 5) {
        if (!this.validateResponse(result, [
          'txTypeVersion',
          'source',
          'timestamp',
          'classificationData',
          'transfers',
          'values',
          'rawTransactionData'
        ])) {
          throw new TransactionError({ message: ['Invalid v5 transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'description'])) {
          throw new TransactionError({ message: ['Invalid v5 transaction format'] });
        }
        return result as SVMTransactionV5;
      } else {
        if (!this.validateResponse(result, [
          'txTypeVersion',
          'source',
          'timestamp',
          'classificationData',
          'transfers',
          'rawTransactionData'
        ])) {
          throw new TransactionError({ message: ['Invalid v4 transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type'])) {
          throw new TransactionError({ message: ['Invalid v4 transaction format'] });
        }
        // Ensure source has the correct format for v4
        if (!result.source.type) {
          result.source.type = 'blockchain';
        }
        if (!result.source.name) {
          result.source.name = chain;
        }
        return result as SVMTransactionV4;
      }
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction'] });
    }
  }

  /**
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<SVMTransaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async getTransactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<SVMTransaction>> {
    try {
      // Use v4 format if specified, otherwise default to v5
      const format = pageOptions.v5Format === false ? 'v4' : 'v5';
      const endpoint = `${chain}/txs/${format}/${accountAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result: SVMTranslateTransactionsResponse = await this.makeRequest(url);

      const initialData = {
        chain: chain,
        walletAddress: accountAddress,
        transactions: result.items,
        currentPageKeys: pageOptions,
        nextPageKeys: result.nextPageUrl ? parseUrl(result.nextPageUrl) : null,
      };
      return new TransactionsPage(this, initialData);
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transactions'] });
    }
  }

  /**
   * @deprecated Use getTransactions instead. This method will be removed in a future version.
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<SVMTransaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<SVMTransaction>> {
    return this.getTransactions(chain, accountAddress, pageOptions);
  }

  /**
   * Returns a list of the available SPL token account addresses for the chain and wallet requested.
   * @param {string} accountAddress - The account address.
   * @param {string} chain - The chain name. Defaults to solana.
   * @returns {Promise<SPLAccounts>} A promise that resolves to the SPL accounts data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getSplTokens(accountAddress: string, chain: string = 'solana'): Promise<SPLAccounts> {
    try {
      const result = await this.makeRequest(`${chain}/splAccounts/${accountAddress}`);
      if (!this.validateResponse(result, ['accountPubkey', 'tokenAccounts'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get SPL tokens'] });
    }
  }

  /**
   * Returns a list of all available transaction types that can be returned by the API.
   * This is useful for understanding what types of transactions can be classified.
   * @returns {Promise<SVMTranslateTransactionTypesResponse>} A promise that resolves to an object containing transaction types and version.
   */
  public async getTxTypes(): Promise<SVMTranslateTransactionTypesResponse> {
    try {
      const result = await this.makeRequest('txTypes');
      if (!this.validateResponse(result, ['transactionTypes', 'version'])) {
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
   * For a list of transactions, returns their descriptions and types.
   * Useful in cases where you need to describe multiple transactions at once.
   * @param {string} chain - The chain name.
   * @param {string[]} signatures - Array of transaction signatures.
   * @param {string} viewAsAccountAddress - OPTIONAL - Results are returned with the view/perspective of this wallet address.
   * @returns {Promise<SVMTranslateDescribeTransaction[]>} A promise that resolves to an array of transaction descriptions.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransactions(chain: string, signatures: string[], viewAsAccountAddress?: string): Promise<SVMTranslateDescribeTransaction[]> {
    try {
      const validatedChain = chain.toLowerCase();
      let endpoint = `${validatedChain}/describeTxs`;
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${viewAsAccountAddress}`;
      }
      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify({ signatures })
      });
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to describe transactions'] });
    }
  }

  /**
   * Start a transaction job for the given chain and account address.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {number} startTimestamp - The start timestamp.
   * @param {boolean} validateStartTimestamp - Whether to validate the start timestamp.
   * @returns {Promise<SVMTranslateTransactionJob>} A promise that resolves to the transaction job.
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string,
    startTimestamp: number = 0,
    validateStartTimestamp: boolean = true
  ): Promise<SVMTranslateTransactionJob> {
    try {
      const endpoint = `${chain}/txs/job/start?accountAddress=${encodeURIComponent(accountAddress)}&startTimestamp=${startTimestamp}&validateStartTimestamp=${validateStartTimestamp}`;
      const result = await this.makeRequest(endpoint, 'POST');
      
      // Validate the response structure
      if (!this.validateResponse(result, ['jobId', 'nextPageUrl', 'startTimestamp'])) {
        throw new TransactionError({ message: ['Invalid transaction job response format'] });
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to start transaction job'] });
    }
  }

  /**
   * Get the results of a transaction job.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID from the transaction job.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<SVMTranslateTransactionJobResponse>} A promise that resolves to the transaction job results.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactionJobResults(
    chain: string,
    jobId: string,
    pageOptions: PageOptions = {}
  ): Promise<SVMTranslateTransactionJobResponse> {
    try {
      const endpoint = `${chain}/txs/job/${jobId}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);
      
      // Validate the response structure
      if (!this.validateResponse(result, ['items', 'pageSize', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid transaction job response format'] });
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction job results'] });
    }
  }

  /**
   * Delete a transaction job.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID to delete.
   * @returns {Promise<SVMTranslateDeleteTransactionJobResponse>} A promise that resolves to the deletion confirmation message.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async deleteTransactionJob(
    chain: string,
    jobId: string
  ): Promise<SVMTranslateDeleteTransactionJobResponse> {
    try {
      const endpoint = `${chain}/txs/job/${jobId}`;
      const result = await this.makeRequest(endpoint, 'DELETE');
      
      // Validate the response structure
      if (!this.validateResponse(result, ['message'])) {
        throw new TransactionError({ message: ['Invalid delete job response format'] });
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to delete transaction job'] });
    }
  }

  /**
   * Get token balances for an account address.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {boolean} [includePrices=true] - Optional. Whether to include token prices in the response.
   * @param {boolean} [excludeZeroPrices=false] - Optional. Whether to exclude tokens with zero price.
   * @returns {Promise<SVMTranslateTokenBalance[]>} A promise that resolves to the balances data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string,
    includePrices: boolean = true,
    excludeZeroPrices: boolean = false
  ): Promise<SVMTranslateTokenBalance[]> {
    try {
      const endpoint = `${chain}/tokens/balancesOf/${accountAddress}`;
      const url = constructUrl(endpoint, { includePrices, excludeZeroPrices });
      const result = await this.makeRequest(url);
      
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      
      // Validate each token balance in the array
      for (const balance of result) {
        if (!this.validateResponse(balance, ['balance', 'usdValue', 'token'])) {
          throw new TransactionError({ message: ['Invalid token balance format'] });
        }
        if (!this.validateResponse(balance.token, ['symbol', 'name', 'decimals', 'address', 'price'])) {
          throw new TransactionError({ message: ['Invalid token format'] });
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get token balances'] });
    }
  }

  /**
   * Get the transaction count for an account address.
   * @param {string} chain - The chain name. Defaults to solana.
   * @param {string} accountAddress - The account address to get transaction count for.
   * @param {string} [webhookUrl] - Optional webhook URL for job completion notification.
   * @returns {Promise<SVMTranslateTransactionCountResponse>} A promise that resolves to the transaction count data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactionCount(chain: string = 'solana', accountAddress: string, webhookUrl?: string): Promise<SVMTranslateTransactionCountResponse> {
    try {
      // Start the transaction count job
      const startEndpoint = `${chain}/txCount/job/start`;
      const startParams = new URLSearchParams({ accountAddress });
      if (webhookUrl) {
        startParams.append('webhookUrl', webhookUrl);
      }
      const startUrl = `${startEndpoint}?${startParams.toString()}`;
      
      const jobStartResponse = await this.makeRequest(startUrl, 'POST', {
        headers: {
          'Accept': '*/*'
        },
        body: ''
      });
      
      // Validate job start response
      if (!this.validateResponse(jobStartResponse, ['jobId', 'resultsUrl'])) {
        throw new TransactionError({ message: ['Invalid job start response format'] });
      }
      
      // Get the job results
      const jobEndpoint = `${chain}/txCount/job/${jobStartResponse.jobId}`;
      const result = await this.makeRequest(jobEndpoint, 'GET', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Validate the final response structure
      if (!this.validateResponse(result, ['chain', 'timestamp', 'account'])) {
        throw new TransactionError({ message: ['Invalid transaction count response format'] });
      }
      
      if (!this.validateResponse(result.account, ['address', 'transactionCount'])) {
        throw new TransactionError({ message: ['Invalid account data in transaction count response'] });
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction count'] });
    }
  }

  /**
   * Get staking transactions for a staking account.
   * @param {string} chain - The chain name. Defaults to solana.
   * @param {string} stakingAccount - The staking account address.
   * @param {PageOptions} pageOptions - Optional pagination options.
   * @returns {Promise<SVMTranslateStakingTransactionsResponse>} A promise that resolves to the staking transactions data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getStakingTransactions(
    chain: string = 'solana',
    stakingAccount: string,
    pageOptions: PageOptions = {}
  ): Promise<SVMTranslateStakingTransactionsResponse> {
    try {
      const endpoint = `${chain}/staking/txs/${stakingAccount}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get staking transactions'] });
    }
  }

  /**
   * Get staking information for a specific epoch.
   * @param {string} chain - The chain name. Defaults to solana.
   * @param {string} stakingAccount - The staking account address.
   * @param {number} epoch - The epoch number.
   * @returns {Promise<SVMTranslateStakingEpochResponse>} A promise that resolves to the staking epoch data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getStakingEpoch(
    chain: string = 'solana',
    stakingAccount: string,
    epoch: number
  ): Promise<SVMTranslateStakingEpochResponse> {
    try {
      const endpoint = `${chain}/staking/${stakingAccount}/epoch/${epoch}`;
      const result = await this.makeRequest(endpoint);
      
      // Validate the response structure
      if (!this.validateResponse(result, [
        'txTypeVersion',
        'source',
        'timestamp',
        'classificationData',
        'transfers',
        'values',
        'rawTransactionData'
      ])) {
        throw new TransactionError({ message: ['Invalid staking epoch response format'] });
      }
      
      if (!this.validateResponse(result.classificationData, ['type', 'description'])) {
        throw new TransactionError({ message: ['Invalid classification data format'] });
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get staking epoch'] });
    }
  }
}