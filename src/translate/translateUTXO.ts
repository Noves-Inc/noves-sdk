// src/translate/translateUTXO.ts

import { PageOptions } from '../types/common';
import { 
  UTXOTranslateChain, 
  UTXOTranslateTransaction,
  UTXOTranslateTransactionV2,
  UTXOTranslateTransactionV5,
  UTXOTranslateAddressesResponse, 
  UTXOTranslateBalancesResponse,
  UTXOTranslateTransactionJob,
  UTXOTranslateTransactionJobResponse,
  UTXOTranslateDeleteTransactionJobResponse
} from '../types/utxo';
import { createTranslateClient } from '../utils/apiUtils';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { TransactionsPage } from './transactionsPage';

const ECOSYSTEM = 'utxo';

/**
 * Class representing the UTXO translation module.
 */
export class TranslateUTXO {
  private request: ReturnType<typeof createTranslateClient>;
  private apiKey: string;

  /**
   * Create a TranslateUTXO instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.request = createTranslateClient(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the UTXO blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<UTXOTranslateChain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<UTXOTranslateChain[]> {
    try {
      const result = await this.request('chains');
      if (!result || !result.response) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 500) {
          throw new TransactionError({ message: ['Internal server error occurred'] });
        }
        throw new TransactionError({ message: [errorResponse.error || 'Failed to fetch chains'] });
      }
      throw error;
    }
  }

  /**
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<UTXOTranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async getTransactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<UTXOTranslateTransaction>> {
    try {
      const endpoint = `${chain}/txs/${accountAddress}`;
      // constructUrl automatically handles all PageOptions parameters, including v5Format
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.request(url);

      if (!result || !result.response || !Array.isArray(result.response.items)) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }

      // Validate response format matches the requested format
      if (result.response.items.length > 0) {
        const firstTx = result.response.items[0];
        const requestedV5Format = pageOptions.v5Format === true;
        const expectedVersion = requestedV5Format ? 5 : 2;
        
        // Check if we got the expected txTypeVersion
        if (firstTx.txTypeVersion !== expectedVersion) {
          throw new TransactionError({ 
            general: [`API returned txTypeVersion ${firstTx.txTypeVersion} but expected ${expectedVersion}. Check v5Format parameter.`] 
          });
        }
        
        // Validate transaction structure based on format
        if (requestedV5Format) {
          // v5 format should have transfers, values, timestamp, and NO sent/received in classificationData
          if (!firstTx.transfers || !Array.isArray(firstTx.transfers)) {
            throw new TransactionError({ general: ['Invalid v5 transaction format - missing transfers array'] });
          }
          if (!firstTx.values || !Array.isArray(firstTx.values)) {
            throw new TransactionError({ general: ['Invalid v5 transaction format - missing values array'] });
          }
          if (!firstTx.timestamp) {
            throw new TransactionError({ general: ['Invalid v5 transaction format - missing timestamp'] });
          }
          if (firstTx.classificationData?.sent || firstTx.classificationData?.received) {
            throw new TransactionError({ general: ['v5 format should not have sent/received arrays in classificationData'] });
          }
        } else {
          // v2 format should have sent/received in classificationData and NO transfers/values at root level
          if (!firstTx.classificationData?.sent || !Array.isArray(firstTx.classificationData.sent)) {
            throw new TransactionError({ general: ['Invalid v2 transaction format - missing sent array in classificationData'] });
          }
          if (!firstTx.classificationData?.received || !Array.isArray(firstTx.classificationData.received)) {
            throw new TransactionError({ general: ['Invalid v2 transaction format - missing received array in classificationData'] });
          }
          if (firstTx.transfers || firstTx.values) {
            throw new TransactionError({ general: ['v2 format should not have transfers/values arrays at root level'] });
          }
        }
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
   * @deprecated Use getTransactions instead. This method will be removed in v2.0.0.
   * Get a pagination object to iterate over transactions pages.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<UTXOTranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<UTXOTranslateTransaction>> {
    return this.getTransactions(chain, accountAddress, pageOptions);
  }

    /**
   * Utility endpoint for Bitcoin. Returns a list of derived addresses for the given master key.
   * @param {string} masterKey - The master key (xpub, ypub, or zpub) to derive BTC addresses from.
   * @returns {Promise<UTXOTranslateAddressesResponse>} A promise that resolves to an array of derived addresses.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getAddressesByMasterKey(masterKey: string): Promise<UTXOTranslateAddressesResponse> {
    try {
      // Note: This specific endpoint uses 'uxto' instead of 'utxo' in the URL
      // This is an API inconsistency that we need to handle
      const url = `https://translate.noves.fi/uxto/btc/addresses/${masterKey}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        if (response.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        } else if (response.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch addresses'] });
      }

      const addresses = await response.json();
      if (!Array.isArray(addresses)) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      
      return addresses;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        } else if (errorResponse.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch addresses'] });
      }
      throw new TransactionError({ general: ['Network error occurred'] });
    }
  }

  /**
   * @deprecated Use getAddressesByMasterKey instead. This method will be removed in v2.0.0.
   * Utility endpoint for Bitcoin. Returns a list of derived addresses for the given xpub address.
   * @param {string} xpub - The xpub address to derive BTC addresses from.
   * @returns {Promise<UTXOTranslateAddressesResponse>} A promise that resolves to an array of derived addresses.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getAddressesByXpub(xpub: string): Promise<UTXOTranslateAddressesResponse> {
    return this.getAddressesByMasterKey(xpub);
  }

  /**
   * Returns all of the available transaction information for the chain and transaction hash requested.
   * @param {string} chain - The chain name.
   * @param {string} hash - The transaction hash.
   * @param {number} [txTypeVersion=5] - The transaction format version (2 or 5). Defaults to 5.
   * @param {string} [viewAsAccountAddress] - Optional account address to view the transaction from its perspective.
   * @returns {Promise<UTXOTranslateTransaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, hash: string, txTypeVersion: number = 5, viewAsAccountAddress?: string): Promise<UTXOTranslateTransaction> {
    try {
      if (txTypeVersion !== 2 && txTypeVersion !== 5) {
        throw new TransactionError({ general: ['Invalid txTypeVersion. Must be either 2 or 5'] });
      }

      let endpoint = `${chain}/tx/${txTypeVersion === 5 ? 'v5' : 'v2'}/${hash}`;
      
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      
      const result = await this.request(endpoint);
      if (!result || !result.response || typeof result.response !== 'object') {
        throw new TransactionError({ general: ['Invalid response format'] });
      }

      const transaction = result.response;

      // Validate response based on format
      if (txTypeVersion === 5) {
        if (!transaction.txTypeVersion || transaction.txTypeVersion !== 5) {
          throw new TransactionError({ general: ['Invalid v5 transaction response format'] });
        }
        if (!transaction.transfers || !Array.isArray(transaction.transfers)) {
          throw new TransactionError({ general: ['Invalid v5 transaction format - missing transfers array'] });
        }
        if (!transaction.values || !Array.isArray(transaction.values)) {
          throw new TransactionError({ general: ['Invalid v5 transaction format - missing values array'] });
        }
        if (!transaction.timestamp) {
          throw new TransactionError({ general: ['Invalid v5 transaction format - missing timestamp'] });
        }
        return transaction;
      } else {
        if (!transaction.txTypeVersion || transaction.txTypeVersion !== 2) {
          throw new TransactionError({ general: ['Invalid v2 transaction response format'] });
        }
        if (!transaction.classificationData?.sent || !Array.isArray(transaction.classificationData.sent)) {
          throw new TransactionError({ general: ['Invalid v2 transaction format - missing sent array'] });
        }
        if (!transaction.classificationData?.received || !Array.isArray(transaction.classificationData.received)) {
          throw new TransactionError({ general: ['Invalid v2 transaction format - missing received array'] });
        }
        if (!transaction.rawTransactionData?.timestamp) {
          throw new TransactionError({ general: ['Invalid v2 transaction format - missing timestamp in rawTransactionData'] });
        }
        return transaction;
      }
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        } else if (errorResponse.status === 404) {
          throw new TransactionError({ general: ['Transaction not found'] });
        } else if (errorResponse.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch transaction'] });
      }
      throw error;
    }
  }

  /**
   * Get token balances for an account address.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {number} [blockNumber] - Optional block number to retrieve balances as of.
   * @param {number} [timestamp] - Optional timestamp to retrieve balances as of.
   * @param {boolean} [includePrices=true] - Optional. Whether to include token prices in the response.
   * @param {boolean} [excludeZeroPrices=false] - Optional. Whether to exclude tokens with zero price.
   * @returns {Promise<UTXOTranslateBalancesResponse>} A promise that resolves to the balances data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string,
    blockNumber?: number,
    timestamp?: number,
    includePrices: boolean = true,
    excludeZeroPrices: boolean = false
  ): Promise<UTXOTranslateBalancesResponse> {
    try {
      const endpoint = `${chain}/tokens/balancesOf/${accountAddress}`;
      const queryParams = new URLSearchParams();
      
      if (blockNumber) queryParams.append('blockNumber', blockNumber.toString());
      if (timestamp) queryParams.append('timestamp', timestamp.toString());
      if (!includePrices) queryParams.append('includePrices', 'false');
      if (excludeZeroPrices) queryParams.append('excludeZeroPrices', 'true');
      
      const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
      const result = await this.request(url);

      if (!result || !result.response || !Array.isArray(result.response)) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }

      // Validate each token balance in the array
      for (const balance of result.response) {
        if (!balance.balance || !balance.token) {
          throw new TransactionError({ general: ['Invalid token balance format'] });
        }
        if (!balance.token.symbol || !balance.token.name || !balance.token.decimals || !balance.token.address) {
          throw new TransactionError({ general: ['Invalid token format'] });
        }
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
        throw new TransactionError({ general: [errorResponse.error || 'Failed to fetch token balances'] });
      }
      throw error;
    }
  }

  /**
   * Starts a transaction job for processing multiple transactions in a UTXO wallet.
   * The job will be processed in the background, and results will become available once all transactions have been fetched.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {number} [startBlock] - Optional starting block number.
   * @param {number} [endBlock] - Optional ending block number.
   * @param {number} [startTimestamp] - Optional starting timestamp.
   * @param {number} [endTimestamp] - Optional ending timestamp.
   * @returns {Promise<UTXOTranslateTransactionJob>} A promise that resolves to the transaction job.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async startTransactionJob(
    chain: string,
    accountAddress: string,
    startBlock?: number,
    endBlock?: number,
    startTimestamp?: number,
    endTimestamp?: number
  ): Promise<UTXOTranslateTransactionJob> {
    try {
      const endpoint = `${chain}/txs/job/start`;
      const queryParams = new URLSearchParams({
        accountAddress: accountAddress
      });
      
      if (startBlock !== undefined) queryParams.append('startBlock', startBlock.toString());
      if (endBlock !== undefined) queryParams.append('endBlock', endBlock.toString());
      if (startTimestamp !== undefined) queryParams.append('startTimestamp', startTimestamp.toString());
      if (endTimestamp !== undefined) queryParams.append('endTimestamp', endTimestamp.toString());
      
      const url = `${endpoint}?${queryParams.toString()}`;
      const result = await this.request(url, 'POST');
      
      if (!result || !result.response) {
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
        throw new TransactionError({ general: [errorResponse.error || 'Failed to start transaction job'] });
      }
      throw error;
    }
  }

  /**
   * Gets the results of a transaction job.
   * If the job is not finished yet, this will return a 425 status with progress information.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID from the transaction job.
   * @param {PageOptions} pageOptions - The page options.
   * @returns {Promise<UTXOTranslateTransactionJobResponse>} A promise that resolves to the transaction job response.
   * @throws {TransactionError} If there are validation errors in the request or if the job is not finished (425 status).
   */
  public async getTransactionJobResults(
    chain: string,
    jobId: string,
    pageOptions: PageOptions = {}
  ): Promise<UTXOTranslateTransactionJobResponse> {
    try {
      const endpoint = `${chain}/txs/job/${jobId}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.request(url);
      
      if (!result || !result.response) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      
      // Handle case where API returns 200 with "Job not ready yet" message
      if (result.response.message && result.response.message.includes('Job not ready yet')) {
        throw new TransactionError({ 
          general: [result.response.detail?.message || 'Job is not finished yet'],
          txsProcessed: result.response.detail?.txsProcessed 
        });
      }
      
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 425) {
          // Job is not finished yet, throw error with progress information
          throw new TransactionError({ 
            general: [errorResponse.detail?.message || 'Job is not finished yet'],
            txsProcessed: errorResponse.detail?.txsProcessed 
          });
        } else if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        } else if (errorResponse.status === 404) {
          throw new TransactionError({ general: ['Job not found'] });
        } else if (errorResponse.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to get transaction job results'] });
      }
      throw error;
    }
  }

  /**
   * Deletes a transaction job.
   * @param {string} chain - The chain name.
   * @param {string} jobId - The job ID to delete.
   * @returns {Promise<UTXOTranslateDeleteTransactionJobResponse>} A promise that resolves to the deletion confirmation message.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async deleteTransactionJob(
    chain: string,
    jobId: string
  ): Promise<UTXOTranslateDeleteTransactionJobResponse> {
    try {
      const endpoint = `${chain}/txs/job/${jobId}`;
      const result = await this.request(endpoint, 'DELETE');
      
      if (!result || !result.response) {
        throw new TransactionError({ general: ['Invalid response format'] });
      }
      
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        } else if (errorResponse.status === 404) {
          throw new TransactionError({ general: ['Job not found'] });
        } else if (errorResponse.status === 500) {
          throw new TransactionError({ general: ['Internal server error occurred'] });
        }
        throw new TransactionError({ general: [errorResponse.error || 'Failed to delete transaction job'] });
      }
      throw error;
    }
  }
}