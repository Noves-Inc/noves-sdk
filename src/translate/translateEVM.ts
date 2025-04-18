// src/translate/translateEVM.ts

import { BalancesData, BalancesResponse, Chain, DescribeTransaction, HistoryData, PageOptions, Transaction } from '../types/types';
import { createTranslateClient } from '../utils/apiUtils';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { HistoryPage } from './historyPage';

const ECOSYSTEM = 'evm';

/**
 * Class representing the EVM translation module.
 */
export class TranslateEVM {
  private request: ReturnType<typeof createTranslateClient>;

  /**
   * Create a TranslateEVM instance.
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
   * Returns a list with the names of the EVM blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
   * Get a chain by its name.
   * @param {string} name - The name of the chain to retrieve.
   * @returns {Promise<Chain>} A promise that resolves to the chain object or undefined if not found.
   * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
   */
  public async getChain(name: string): Promise<Chain> {
    const validatedName = name.toLowerCase() === 'ethereum' ? 'eth' : name.toLowerCase();
    const result = await this.request('chains');
    const chain = result.response.find((chain: Chain) => chain.name.toLowerCase() === validatedName.toLowerCase());
    if (!chain) {
      throw new ChainNotFoundError(name);
    }
    return chain;
  }

  /**
   * For any given transaction, it returns only the description and the type.
   * Useful in cases where you're pulling a large number of transactions but only need this data for purposes of displaying on a UI or similar.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @param {string} viewAsAccountAddress - OPTIONAL - Results are returned with the view/perspective of this wallet address.
   * @returns {Promise<DescribeTransaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describeTransaction(chain: string, txHash: string, viewAsAccountAddress?: string): Promise<DescribeTransaction> {
    try {
      let endpoint = `${chain}/describeTx/${txHash}`;
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      const result = await this.request(endpoint);
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
   * Returns all of the available transaction information for the chain and transaction hash requested.
   * @param {string} chain - The chain name.
   * @param {string} txHash - The transaction hash.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, txHash: string): Promise<Transaction> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const result = await this.request(`${validatedChain}/tx/${txHash}`);
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
   * Returns the token balances for the account address as of a given block.
   * If tokens array is provided, it will fetch balances for specific tokens (POST request).
   * If tokens array is not provided, it will fetch all token balances (GET request).
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The account address.
   * @param {string[]} [tokens] - Optional array of token addresses to check.
   * @param {number} [block] - Optional block number. Defaults to current block.
   * @returns {Promise<BalancesResponse>} A promise that resolves to the balances data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenBalances(chain: string, accountAddress: string, tokens?: string[], block?: number): Promise<BalancesResponse> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      let endpoint = `${validatedChain}/tokens/balancesOf/${accountAddress}`;
      
      // Add block parameter if provided
      if (block) {
        endpoint += `?block=${block}`;
      }

      // If tokens array is provided, use POST request
      if (tokens) {
        const result = await this.request(endpoint, "POST", { body: JSON.stringify(tokens) });
        return result.response;
      }
      
      // If no tokens array, use GET request
      const result = await this.request(endpoint);
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
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<Transaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<Transaction>> {
    try {
      const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
      const endpoint = `${validatedChain}/txs/${walletAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.request(url);

      const initialData = {
        chain: chain,
        walletAddress: walletAddress,
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
   * Returns a list of the available transaction hash for the chain and wallet requested.
   * Max number of 100 results per request.
   * If the wallet is not found, this method will return a 404.
   * @param {string} chain - The chain name.
   * @param {string} walletAddress - The wallet address.
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage>} A promise that resolves to a TransactionsPage instance.
   */
  public async History(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<HistoryPage<HistoryData>> {
    try {
      const endpoint = `${chain}/history/${walletAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.request(url);

      const initialData = {
        chain: chain,
        walletAddress: walletAddress,
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
}