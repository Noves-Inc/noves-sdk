// src/translate/translateSVM.ts

import { Chain, PageOptions, TransactionTypes, EVMTransactionJob, EVMTransactionJobResponse, DeleteTransactionJobResponse, SVMTokenBalance, TransactionCountResponse, SVMStakingTransactionsResponse, SVMStakingEpochResponse } from '../types/types';
import { createTranslateClient } from '../utils/apiUtils';
import { TransactionError } from '../errors/TransactionError';
import { TransactionsPage, PaginatedItem } from './transactionsPage';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'svm';

/**
 * Interface representing a token in a transfer
 */
interface Token {
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  icon: string | null;
}

/**
 * Interface representing a transaction description
 */
interface DescribeTransaction {
  signature: string;
  type: string;
  description: string;
  timestamp: number;
  transfers: Transfer[];
}

/**
 * Interface representing an account in a transfer
 */
interface Account {
  name: string | null;
  address: string | null;
  owner: {
    name: string | null;
    address: string | null;
  };
}

/**
 * Interface representing a transfer in a transaction
 */
interface Transfer {
  action: string;
  amount: string;
  token: Token;
  from: Account;
  to: Account;
}

/**
 * Interface representing the raw transaction data
 */
interface RawTransactionData {
  signature: string;
  blockNumber: number;
  signer: string;
  interactedAccounts: string[];
}

/**
 * Interface representing the source of the transaction
 */
interface Source {
  type: string | null;
  name: string | null;
}

/**
 * Interface representing a V4 SVM transaction response
 */
export interface SVMTransactionV4 extends PaginatedItem {
  txTypeVersion: 4;
  source: {
    type: string;
    name: string;
  };
  timestamp: number;
  classificationData: {
    type: string;
  };
  transfers: Transfer[];
  rawTransactionData: RawTransactionData;
}

/**
 * Interface representing a V5 SVM transaction response
 */
export interface SVMTransactionV5 extends PaginatedItem {
  txTypeVersion: 5;
  source: {
    type: string | null;
    name: string | null;
  };
  timestamp: number;
  classificationData: {
    type: string;
    description: string | null;
  };
  transfers: Transfer[];
  values: any[];
  rawTransactionData: RawTransactionData;
}

export type SVMTransaction = SVMTransactionV4 | SVMTransactionV5;

/**
 * Interface representing SPL accounts response
 */
interface SPLAccounts {
  accountPubkey: string;
  tokenAccounts: Array<{
    pubKey: string;
  }>;
}

/**
 * Interface representing the SVM token balances response
 */
interface SVMBalancesResponse {
  balances: SVMTokenBalance[];
}

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
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
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
  public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<SVMTransaction>> {
    try {
      // Use v4 format if specified, otherwise default to v5
      const format = pageOptions.v5Format === false ? 'v4' : 'v5';
      const endpoint = `${chain}/txs/${format}/${accountAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

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
   * @returns {Promise<{transactionTypes: TransactionTypes[], version: number}>} A promise that resolves to an object containing transaction types and version.
   */
  public async getTxTypes(): Promise<{transactionTypes: TransactionTypes[], version: number}> {
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
   * @returns {Promise<DescribeTransaction[]>} A promise that resolves to an array of transaction descriptions.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransactions(chain: string, signatures: string[], viewAsAccountAddress?: string): Promise<DescribeTransaction[]> {
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
   * @returns {Promise<EVMTransactionJob>} A promise that resolves to the transaction job.
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string,
    startTimestamp: number = 0,
    validateStartTimestamp: boolean = true
  ): Promise<EVMTransactionJob> {
    try {
      const endpoint = `${chain}/txJob`;
      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify({
          accountAddress,
          startTimestamp,
          validateStartTimestamp
        })
      });
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
   * @returns {Promise<EVMTransactionJobResponse>} A promise that resolves to the transaction job results.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactionJobResults(
    chain: string,
    jobId: string,
    pageOptions: PageOptions = {}
  ): Promise<EVMTransactionJobResponse> {
    try {
      const endpoint = `${chain}/txJob/${jobId}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);
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
   * @returns {Promise<DeleteTransactionJobResponse>} A promise that resolves to the deletion confirmation message.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async deleteTransactionJob(
    chain: string,
    jobId: string
  ): Promise<DeleteTransactionJobResponse> {
    try {
      const endpoint = `${chain}/txJob/${jobId}`;
      const result = await this.makeRequest(endpoint, 'DELETE');
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
   * @returns {Promise<SVMBalancesResponse>} A promise that resolves to the balances data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string,
    includePrices: boolean = true,
    excludeZeroPrices: boolean = false
  ): Promise<SVMTokenBalance[]> {
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
   * @returns {Promise<TransactionCountResponse>} A promise that resolves to the transaction count data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactionCount(chain: string = 'solana', accountAddress: string): Promise<TransactionCountResponse> {
    try {
      const endpoint = `${chain}/txCount/${accountAddress}`;
      const result = await this.makeRequest(endpoint);
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
   * @returns {Promise<SVMStakingTransactionsResponse>} A promise that resolves to the staking transactions data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getStakingTransactions(
    chain: string = 'solana',
    stakingAccount: string,
    pageOptions: PageOptions = {}
  ): Promise<SVMStakingTransactionsResponse> {
    try {
      const endpoint = `${chain}/stakingTxs/${stakingAccount}`;
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
   * @returns {Promise<SVMStakingEpochResponse>} A promise that resolves to the staking epoch data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getStakingEpoch(
    chain: string = 'solana',
    stakingAccount: string,
    epoch: number
  ): Promise<SVMStakingEpochResponse> {
    try {
      const endpoint = `${chain}/stakingEpoch/${stakingAccount}/${epoch}`;
      const result = await this.makeRequest(endpoint);
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get staking epoch'] });
    }
  }
}