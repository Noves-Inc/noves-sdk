// src/translate/translateEVM.ts

import { BalancesData, Chain, DescribeTransaction, HistoryData, PageOptions, TransactionTypes, EVMTransactionJob, EVMTransactionJobResponse, TransactionV2, TransactionV5 } from '../types/types';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { HistoryPage } from './historyPage';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'evm';

/**
 * Represents a raw transaction response from the EVM Translate API.
 */
export interface RawTransactionResponse {
  network: string;
  rawTx: {
    transactionHash: string;
    hash: string;
    transactionIndex: number;
    type: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    gas: number;
    gasPrice: number;
    maxFeePerGas?: number;
    maxPriorityFeePerGas?: number;
    value: number;
    input: string;
    nonce: number;
    r: string;
    s: string;
    v: string;
    networkEnum: number;
    timestamp: number;
    gasUsed: number;
    transactionFee: number;
  };
  rawTraces: Array<{
    action: {
      from: string;
      callType: string;
      gas: string;
      input: string;
      to: string;
      value: string;
    };
    blockHash: string;
    blockNumber: number;
    result: {
      gasUsed: string;
      output: string;
    };
    subtraces: number;
    traceAddress: number[];
    transactionHash: string;
    transactionPosition: number;
    type: string;
  }>;
  eventLogs: Array<{
    decodedName: string;
    decodedSignature: string;
    logIndex: number;
    address: string;
    params: Array<{
      name: string;
      type: string;
      value: number;
    }>;
    raw: {
      eventSignature: string;
      topics: string[];
      data: string;
    };
  }>;
  internalTxs: any[];
  txReceipt: {
    blockNumber: number;
    blockHash: string;
    status: number;
    effectiveGasPrice: number;
    gasUsed: number;
    cumulativeGasUsed: number;
  };
  decodedInput: Record<string, any>;
}

/**
 * Class representing the EVM translation module.
 */
export class TranslateEVM extends BaseTranslate {
  /**
   * Create a TranslateEVM instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    super(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the EVM blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
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
   * For any given transaction, it returns only the description and the type.
   * Useful in cases where you're pulling a large number of transactions but only need this data for purposes of displaying on a UI or similar.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @param {string} viewAsAccountAddress - OPTIONAL - Results are returned with the view/perspective of this wallet address.
   * @returns {Promise<DescribeTransaction>} A promise that resolves to the transaction description.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransaction(chain: string, txHash: string, viewAsAccountAddress?: string): Promise<DescribeTransaction> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      let endpoint = `${validatedChain}/describeTx/${txHash}`;
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      const result = await this.makeRequest(endpoint);
      if (!this.validateResponse(result, ['description', 'type'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to describe transaction'] });
    }
  }

  /**
   * For a list of transactions, returns their descriptions and types.
   * Useful in cases where you need to describe multiple transactions at once.
   * @param {string} chain - The chain name.
   * @param {string[]} txHashes - Array of transaction hashes.
   * @param {string} viewAsAccountAddress - OPTIONAL - Results are returned with the view/perspective of this wallet address.
   * @returns {Promise<DescribeTransaction[]>} A promise that resolves to an array of transaction descriptions.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransactions(chain: string, txHashes: string[], viewAsAccountAddress?: string): Promise<DescribeTransaction[]> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      let endpoint = `${validatedChain}/describeTxs`;
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify({ txHashes })
      });
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to describe transactions'] });
    }
  }

  /**
   * Returns all of the available transaction information for the hash requested.
   * @param {string} chain - The chain name.
   * @param {string} hash - The transaction hash.
   * @param {number} [txTypeVersion=5] - Optional. The transaction type version to use (2 or 5). Defaults to 5.
   * @returns {Promise<TransactionV2 | TransactionV5>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, hash: string, txTypeVersion: number = 5): Promise<TransactionV2 | TransactionV5> {
    try {
      if (txTypeVersion !== 2 && txTypeVersion !== 5) {
        throw new TransactionError({ message: ['Invalid txTypeVersion. Must be either 2 or 5'] });
      }

      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/tx/${hash}${txTypeVersion === 5 ? '?v5Format=true' : ''}`;
      const result = await this.makeRequest(endpoint);

      if (txTypeVersion === 5) {
        if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'rawTransactionData', 'transfers'])) {
          throw new TransactionError({ message: ['Invalid v5 transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'source', 'description', 'protocol'])) {
          throw new TransactionError({ message: ['Invalid v5 transaction format'] });
        }
        return result as TransactionV5;
      } else {
        if (!this.validateResponse(result, ['chain', 'accountAddress', 'classificationData', 'rawTransactionData'])) {
          throw new TransactionError({ message: ['Invalid v2 transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'source', 'description', 'sent', 'received'])) {
          throw new TransactionError({ message: ['Invalid v2 transaction format'] });
        }
        return result as TransactionV2;
      }
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction'] });
    }
  }

  /**
   * Returns the token balances for the account address as of a given block.
   * If tokens array is provided, it will fetch balances for specific tokens (POST request).
   * If tokens array is not provided, it will fetch all token balances (GET request).
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {string[]} [tokens] - Optional array of token addresses to check.
   * @param {number} [block] - Optional block number. Defaults to current block.
   * @param {boolean} [includePrices=true] - Optional. Whether to include token prices in the response.
   * @param {boolean} [excludeZeroPrices=false] - Optional. Whether to exclude tokens with zero price.
   * @param {boolean} [excludeSpam=true] - Optional. Whether to exclude spam tokens.
   * @returns {Promise<BalancesData[]>} A promise that resolves to the balances data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string,
    tokens?: string[],
    block?: number,
    includePrices: boolean = true,
    excludeZeroPrices: boolean = false,
    excludeSpam: boolean = true
  ): Promise<BalancesData[]> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      let endpoint = `${validatedChain}/tokens/balancesOf/${accountAddress}`;
      
      const queryParams = new URLSearchParams();
      if (block) queryParams.append('block', block.toString());
      if (!includePrices) queryParams.append('includePrices', 'false');
      if (excludeZeroPrices) queryParams.append('excludeZeroPrices', 'true');
      if (!excludeSpam) queryParams.append('excludeSpam', 'false');
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      if (tokens && tokens.length > 0) {
        const result = await this.makeRequest(endpoint, 'POST', {
          body: JSON.stringify(tokens)
        });
        if (!Array.isArray(result)) {
          throw new TransactionError({ message: ['Invalid response format'] });
        }
        // Validate each token balance in the array
        for (const balance of result) {
          if (!this.validateResponse(balance, ['balance', 'token'])) {
            throw new TransactionError({ message: ['Invalid token balance format'] });
          }
          if (!this.validateResponse(balance.token, ['symbol', 'name', 'decimals', 'address'])) {
            throw new TransactionError({ message: ['Invalid token format'] });
          }
        }
        return result;
      }

      const result = await this.makeRequest(endpoint);
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      // Validate each token balance in the array
      for (const balance of result) {
        if (!this.validateResponse(balance, ['balance', 'token'])) {
          throw new TransactionError({ message: ['Invalid token balance format'] });
        }
        if (!this.validateResponse(balance.token, ['symbol', 'name', 'decimals', 'address'])) {
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
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<TransactionV2 | TransactionV5>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<TransactionV2 | TransactionV5>> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/${walletAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!this.validateResponse(result, ['items', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      const initialData = {
        chain: chain,
        walletAddress: walletAddress,
        transactions: result.items,
        currentPageKeys: pageOptions,
        nextPageKeys: result.hasNextPage ? parseUrl(result.nextPageUrl) : null,
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
   * Returns a list of the available transaction hash for the chain and wallet requested.
   * Max number of 100 results per request.
   * If the wallet is not found, this method will return a 404.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<HistoryPage<HistoryData>>} A promise that resolves to a HistoryPage instance.
   */
  public async History(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<HistoryPage<HistoryData>> {
    try {
      const endpoint = `${chain}/history/${walletAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!this.validateResponse(result, ['items', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      const initialData = {
        chain: chain,
        walletAddress: walletAddress,
        transactions: result.items,
        currentPageKeys: pageOptions,
        nextPageKeys: result.hasNextPage ? parseUrl(result.nextPageUrl) : null,
      };
      return new HistoryPage(this, initialData);
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
   * Start a transaction job for the given chain and account address.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {number} startBlock - The start block number.
   * @param {number} endBlock - The end block number.
   * @param {boolean} v5Format - Whether to return the response in v5 format.
   * @param {boolean} excludeSpam - Whether to exclude spam transactions.
   * @returns {Promise<EVMTransactionJob>} A promise that resolves to the transaction job.
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string,
    startBlock: number,
    endBlock: number,
    v5Format: boolean = false,
    excludeSpam: boolean = true
  ): Promise<EVMTransactionJob> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const queryParams = new URLSearchParams({
        accountAddress,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        v5Format: v5Format.toString(),
        excludeSpam: excludeSpam.toString()
      });
      const result = await this.makeRequest(`${validatedChain}/txs/job/start?${queryParams.toString()}`, 'POST');
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
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/job/${jobId}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);
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
   * Delete a transaction job.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID to delete.
   * @returns {Promise<void>} A promise that resolves when the job is deleted.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async deleteTransactionJob(
    chain: string,
    jobId: string
  ): Promise<void> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      await this.makeRequest(`${validatedChain}/txs/job/${jobId}`, 'DELETE');
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
   * Get raw transaction data including traces, event logs, and internal transactions.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<RawTransactionResponse>} A promise that resolves to the raw transaction data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getRawTransaction(chain: string, txHash: string): Promise<RawTransactionResponse> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/raw/tx/${txHash}`);
      if (!this.validateResponse(result, ['network', 'rawTx', 'rawTraces'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get raw transaction'] });
    }
  }
}