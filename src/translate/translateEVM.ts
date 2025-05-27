// src/translate/translateEVM.ts

import { BalancesData, Chain, DescribeTransaction, HistoryData, PageOptions, Transaction, TransactionTypes, EVMTransactionJob, EVMTransactionJobResponse, TransactionV4, TransactionV5 } from '../types/types';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { HistoryPage } from './historyPage';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'evm';

/**
 * Represents a transaction receipt in the EVM ecosystem.
 */
export interface TransactionReceipt {
  blockHash: string;
  blockNumber: number;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
    logIndex: number;
  }>;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: string;
}

/**
 * Represents the status of a transaction in the EVM ecosystem.
 */
export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
  error?: string;
}

/**
 * Represents a native token balance in the EVM ecosystem.
 */
export interface NativeBalance {
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
}

/**
 * Represents a block in the EVM ecosystem.
 */
export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: number;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: number;
  transactions: string[];
  uncles: string[];
}

/**
 * Represents token information in the EVM ecosystem.
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner?: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
}

/**
 * Represents a token holder in the EVM ecosystem.
 */
export interface TokenHolder {
  address: string;
  balance: string;
  share: number;
}

/**
 * Represents a transaction job in the EVM ecosystem.
 */
export interface TransactionJob {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a transaction job response in the EVM ecosystem.
 */
export interface TransactionJobResponse {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  results?: {
    transactions: Transaction[];
    totalCount: number;
  };
  error?: string;
}

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
   * Get a chain by its name.
   * @param {string} name - The name of the chain to retrieve.
   * @returns {Promise<Chain>} A promise that resolves to the chain object or undefined if not found.
   * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
   */
  public async getChain(name: string): Promise<Chain> {
    try {
      const validatedName = name.toLowerCase() === 'ethereum' ? 'eth' : name.toLowerCase();
      const chains = await this.getChains();
      const chain = chains.find((chain: Chain) => chain.name.toLowerCase() === validatedName.toLowerCase());
      if (!chain) {
        throw new ChainNotFoundError(name);
      }
      return chain;
    } catch (error) {
      if (error instanceof ChainNotFoundError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get chain'] });
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
   * Returns all of the available transaction information for the chain and transaction hash requested.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @param {boolean} [v5Format=false] - Whether to return the response in v5 format. Defaults to false (v2 format).
   * @returns {Promise<TransactionV4 | TransactionV5>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, txHash: string, v5Format: boolean = false): Promise<TransactionV4 | TransactionV5> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/tx/${txHash}${v5Format ? '?v5Format=true' : ''}`;
      const result = await this.makeRequest(endpoint);
      
      if (v5Format) {
        if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'rawTransactionData', 'transfers'])) {
          throw new TransactionError({ message: ['Invalid transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'source', 'description', 'protocol'])) {
          throw new TransactionError({ message: ['Invalid v5 transaction format'] });
        }
        return result as TransactionV5;
      } else {
        if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'rawTransactionData'])) {
          throw new TransactionError({ message: ['Invalid transaction response format'] });
        }
        if (!this.validateResponse(result.classificationData, ['type', 'source', 'description', 'protocol', 'sent', 'received'])) {
          throw new TransactionError({ message: ['Invalid v2 transaction format'] });
        }
        return result as TransactionV4;
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
      let endpoint = `${validatedChain}/token/balancesOf/${accountAddress}`;
      
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
          body: JSON.stringify({ tokens })
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
   * @returns {Promise<TransactionsPage<TransactionV4 | TransactionV5>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<TransactionV4 | TransactionV5>> {
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
   * Get detailed information about a specific chain.
   * @param {string} chain - The chain name.
   * @returns {Promise<Chain>} A promise that resolves to the chain information.
   * @throws {ChainNotFoundError} If the chain is not found.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getChainInfo(chain: string): Promise<Chain> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/info`);
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
   * Get the receipt of a specific transaction.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<TransactionReceipt>} A promise that resolves to the transaction receipt.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactionReceipt(chain: string, txHash: string): Promise<TransactionReceipt> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/tx/${txHash}/receipt`);
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
   * Get the status of a specific transaction.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<TransactionStatus>} A promise that resolves to the transaction status.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactionStatus(chain: string, txHash: string): Promise<TransactionStatus> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/tx/${txHash}/status`);
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
   * Get the native token balance of an account.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @returns {Promise<NativeBalance>} A promise that resolves to the native token balance.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getNativeBalance(chain: string, accountAddress: string): Promise<NativeBalance> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/balance/${accountAddress}`);
      if (!this.validateResponse(result, ['address', 'balance', 'symbol', 'decimals'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get native balance'] });
    }
  }

  /**
   * Get information about a specific block.
   * @param {string} chain - The chain name.
   * @param {number} blockNumber - The block number.
   * @returns {Promise<Block>} A promise that resolves to the block information.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getBlock(chain: string, blockNumber: number): Promise<Block> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/block/${blockNumber}`);
      if (!this.validateResponse(result, ['number', 'hash', 'transactions'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get block'] });
    }
  }

  /**
   * Get transactions in a specific block with pagination.
   * @param {string} chain - The chain name.
   * @param {number} blockNumber - The block number.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<TransactionV4 | TransactionV5>>} A promise that resolves to a TransactionsPage instance.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getBlockTransactions(
    chain: string,
    blockNumber: number,
    pageOptions: PageOptions = {}
  ): Promise<TransactionsPage<TransactionV4 | TransactionV5>> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/block/${blockNumber}/txs`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!this.validateResponse(result, ['items', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      const initialData = {
        chain: chain,
        blockNumber: blockNumber,
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
   * Get information about a specific token.
   * @param {string} chain - The chain name.
   * @param {string} tokenAddress - The token address.
   * @returns {Promise<TokenInfo>} A promise that resolves to the token information.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenInfo(chain: string, tokenAddress: string): Promise<TokenInfo> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.makeRequest(`${validatedChain}/token/${tokenAddress}`);
      if (!this.validateResponse(result, ['address', 'name', 'symbol', 'decimals'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get token info'] });
    }
  }

  /**
   * Get holders of a specific token with pagination.
   * @param {string} chain - The chain name.
   * @param {string} tokenAddress - The token address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<TokenHolder>>} A promise that resolves to a TransactionsPage instance.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenHolders(
    chain: string,
    tokenAddress: string,
    pageOptions: PageOptions = {}
  ): Promise<TransactionsPage<TokenHolder>> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/token/${tokenAddress}/holders`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!this.validateResponse(result, ['items', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      const initialData = {
        chain: chain,
        tokenAddress: tokenAddress,
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