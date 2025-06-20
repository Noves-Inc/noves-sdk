// src/translate/translateEVM.ts

import { 
  EVMTranslateChains, 
  EVMTranslateDescribeTransaction,
  EVMTranslateDescribeTransactions,
  EVMTranslateHistoryData, 
  EVMTranslateBalancesData,
  EVMTranslateTransactionTypes,
  EVMTranslateTransactionTypesResponse,
  EVMTranslateTransactionJob,
  EVMTranslateTransactionJobResponse,
  EVMTranslateTransactionV2,
  EVMTranslateTransactionV5,
  EVMTranslateRawTransactionResponse,
  EVMTranslateDeleteTransactionJobResponse
} from '../types/evm';
import { PageOptions } from '../types/common';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { HistoryPage } from './historyPage';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'evm';



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
   * @returns {Promise<EVMTranslateChains>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<EVMTranslateChains> {
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
   * @returns {Promise<EVMTranslateDescribeTransaction>} A promise that resolves to the transaction description.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransaction(chain: string, txHash: string, viewAsAccountAddress?: string): Promise<EVMTranslateDescribeTransaction> {
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
   * @returns {Promise<EVMTranslateDescribeTransactions[]>} A promise that resolves to an array of transaction descriptions with txHash.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransactions(chain: string, txHashes: string[], viewAsAccountAddress?: string): Promise<EVMTranslateDescribeTransactions[]> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      let endpoint = `${validatedChain}/describeTxs`;
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify(txHashes)
      });
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      // Validate response structure
      for (const item of result) {
        if (!this.validateResponse(item, ['txHash', 'type', 'description'])) {
          throw new TransactionError({ message: ['Invalid transaction description format'] });
        }
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
   * @param {string} [viewAsAccountAddress] - Optional. Results are returned with the view/perspective of this wallet address.
   * @returns {Promise<EVMTranslateTransactionV2 | EVMTranslateTransactionV5>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, hash: string, txTypeVersion: number = 5, viewAsAccountAddress?: string): Promise<EVMTranslateTransactionV2 | EVMTranslateTransactionV5> {
    try {
      if (txTypeVersion !== 2 && txTypeVersion !== 5) {
        throw new TransactionError({ message: ['Invalid txTypeVersion. Must be either 2 or 5'] });
      }

      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      let endpoint = `${validatedChain}/tx/${hash}${txTypeVersion === 5 ? '?v5Format=true' : ''}`;
      
      if (viewAsAccountAddress) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoint += `${separator}viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      
      const result = await this.makeRequest(endpoint);

      if (txTypeVersion === 5) {
        if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'rawTransactionData', 'transfers', 'values'])) {
          throw new TransactionError({ message: ['Invalid v5 transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'source', 'description', 'protocol'])) {
          throw new TransactionError({ message: ['Invalid v5 transaction format'] });
        }
        return result as EVMTranslateTransactionV5;
      } else {
        if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'rawTransactionData'])) {
          throw new TransactionError({ message: ['Invalid v2 transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'source', 'description', 'protocol', 'sent', 'received'])) {
          throw new TransactionError({ message: ['Invalid v2 transaction format'] });
        }
        return result as EVMTranslateTransactionV2;
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
   * @returns {Promise<EVMTranslateBalancesData[]>} A promise that resolves to the balances data.
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
  ): Promise<EVMTranslateBalancesData[]> {
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
   * @returns {Promise<TransactionsPage<EVMTranslateTransactionV2 | EVMTranslateTransactionV5>>} A promise that resolves to a TransactionsPage instance.
   */
  public async getTransactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<EVMTranslateTransactionV2 | EVMTranslateTransactionV5>> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/${walletAddress}`;
      
      // constructUrl automatically handles all PageOptions parameters, including v5Format
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!this.validateResponse(result, ['items', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      // Validate response format matches the requested format
      if (result.items && result.items.length > 0) {
        const firstTx = result.items[0];
        const requestedV5Format = pageOptions.v5Format === true;
        const expectedVersion = requestedV5Format ? 5 : 2;
        
        // Check if we got the expected txTypeVersion
        if (firstTx.txTypeVersion !== expectedVersion) {
          throw new TransactionError({ 
            message: [`API returned txTypeVersion ${firstTx.txTypeVersion} but expected ${expectedVersion}. Check v5Format parameter.`] 
          });
        }
        
        // Validate transaction structure based on format
        if (requestedV5Format) {
          // v5 format should have transfers, values, and NO sent/received in classificationData
          if (!this.validateResponse(firstTx, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'transfers', 'values', 'rawTransactionData'])) {
            throw new TransactionError({ message: ['Invalid v5 transaction format in response'] });
          }
          if (firstTx.classificationData.sent || firstTx.classificationData.received) {
            throw new TransactionError({ message: ['v5 format should not have sent/received arrays in classificationData'] });
          }
        } else {
          // v2 format should have sent/received in classificationData and NO transfers/values at root level
          if (!this.validateResponse(firstTx, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'rawTransactionData'])) {
            throw new TransactionError({ message: ['Invalid v2 transaction format in response'] });
          }
          if (!this.validateResponse(firstTx.classificationData, ['type', 'source', 'description', 'protocol', 'sent', 'received'])) {
            throw new TransactionError({ message: ['Invalid v2 classificationData format in response'] });
          }
          if (firstTx.transfers || firstTx.values) {
            throw new TransactionError({ message: ['v2 format should not have transfers/values arrays at root level'] });
          }
        }
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
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transactions'] });
    }
  }

  /**
   * @deprecated Use getTransactions() instead. This method will be removed in a future version.
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<EVMTranslateTransactionV2 | EVMTranslateTransactionV5>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<EVMTranslateTransactionV2 | EVMTranslateTransactionV5>> {
    return this.getTransactions(chain, walletAddress, pageOptions);
  }

  /**
   * Returns a list of the available transaction hash for the chain and wallet requested.
   * Max number of 100 results per request.
   * If the wallet is not found, this method will return a 404.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<HistoryPage<EVMTranslateHistoryData>>} A promise that resolves to a HistoryPage instance.
   */
  public async getHistory(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<HistoryPage<EVMTranslateHistoryData>> {
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
      return new HistoryPage<EVMTranslateHistoryData>(this, initialData);
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
   * @deprecated Use getHistory() instead. This method will be removed in a future version.
   * Returns a list of the available transaction hash for the chain and wallet requested.
   * Max number of 100 results per request.
   * If the wallet is not found, this method will return a 404.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<HistoryPage<EVMTranslateHistoryData>>} A promise that resolves to a HistoryPage instance.
   */
  public async History(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<HistoryPage<EVMTranslateHistoryData>> {
    return this.getHistory(chain, walletAddress, pageOptions);
  }

  /**
   * Returns a list of available transaction types for the EVM ecosystem.
   * @returns {Promise<EVMTranslateTransactionTypesResponse>} A promise that resolves to the transaction types.
   */
  public async getTxTypes(): Promise<EVMTranslateTransactionTypesResponse> {
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
   * Starts a transaction job for processing multiple transactions.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {number} startBlock - The starting block number.
   * @param {number} endBlock - The ending block number.
   * @param {boolean} [v5Format=false] - Whether to use v5 format.
   * @param {boolean} [excludeSpam=true] - Whether to exclude spam transactions.
   * @returns {Promise<EVMTranslateTransactionJob>} A promise that resolves to the transaction job.
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string,
    startBlock: number,
    endBlock: number,
    v5Format: boolean = false,
    excludeSpam: boolean = true
  ): Promise<EVMTranslateTransactionJob> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/job/start`;
      const queryParams = new URLSearchParams({
        accountAddress: accountAddress,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        v5Format: v5Format.toString(),
        excludeSpam: excludeSpam.toString()
      });
      
      const result = await this.makeRequest(`${endpoint}?${queryParams.toString()}`, 'POST');
      if (!this.validateResponse(result, ['jobId', 'nextPageUrl'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
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
   * Gets the results of a transaction job.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID.
   * @param {PageOptions} pageOptions - The page options.
   * @returns {Promise<EVMTranslateTransactionJobResponse>} A promise that resolves to the transaction job response.
   */
  public async getTransactionJobResults(
    chain: string,
    jobId: string,
    pageOptions: PageOptions = {}
  ): Promise<EVMTranslateTransactionJobResponse> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/job/${jobId}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);
      
      if (!this.validateResponse(result, ['items', 'pageSize', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
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
   * Deletes a transaction job.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID.
   * @returns {Promise<EVMTranslateDeleteTransactionJobResponse>} A promise that resolves to the delete response.
   */
  public async deleteTransactionJob(
    chain: string,
    jobId: string
  ): Promise<EVMTranslateDeleteTransactionJobResponse> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/job/${jobId}`;
      const result = await this.makeRequest(endpoint, 'DELETE');
      
      if (!this.validateResponse(result, ['message'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
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
   * Gets the raw transaction data for a given transaction hash.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<EVMTranslateRawTransactionResponse>} A promise that resolves to the raw transaction response.
   */
  public async getRawTransaction(chain: string, txHash: string): Promise<EVMTranslateRawTransactionResponse> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/raw/tx/${txHash}`;
      const result = await this.makeRequest(endpoint);
      
      if (!this.validateResponse(result, ['network', 'rawTx'])) {
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