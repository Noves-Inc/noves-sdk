import { PageOptions } from '../types/common';
import { 
  XRPLTranslateChains,
  XRPLTranslateTransaction,
  XRPLTranslateTransactionsResponse,
  XRPLTranslateBalancesResponse
} from '../types/xrpl';
import { TransactionsPage } from './transactionsPage';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'xrpl';

/**
 * Class representing the XRPL translation module.
 */
export class TranslateXRPL extends BaseTranslate {
  /**
   * Create a TranslateXRPL instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    super(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the XRPL chains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<XRPLTranslateChains>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<XRPLTranslateChains> {
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
   * Returns a single transaction, classified from the perspective of the viewAsAccountAddress parameter (if provided), 
   * or the transaction signer by default.
   * @param {string} chain - The chain name.
   * @param {string} txHash - Hash of the transaction (64-character hexadecimal string).
   * @param {string} [viewAsAccountAddress] - Optional. Results are returned with the view/perspective of this account address.
   * @returns {Promise<XRPLTranslateTransaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransaction(chain: string, txHash: string, viewAsAccountAddress?: string): Promise<XRPLTranslateTransaction> {
    try {
      let endpoint = `${chain}/tx/${txHash}`;
      if (viewAsAccountAddress) {
        endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
      }
      const result = await this.makeRequest(endpoint);
      
      if (!this.validateResponse(result, ['txTypeVersion', 'chain', 'accountAddress', 'classificationData', 'transfers', 'values', 'rawTransactionData', 'timestamp'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      
      if (!this.validateResponse(result.classificationData, ['type', 'description', 'protocol', 'source'])) {
        throw new TransactionError({ message: ['Invalid classificationData format'] });
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transaction'] });
    }
  }

  /**
   * Returns a paginated list of transactions for the given account address on the XRP Ledger.
   * Transactions are returned in reverse chronological order (most recent first).
   * Use the pageSize parameter to control how many transactions are returned per page (maximum 50). 
   * For pagination, use the nextPageUrl link that will be returned as part of the output when more results are available.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The XRP Ledger account address to fetch transactions for (starts with 'r').
   * @param {PageOptions} pageOptions - The page options object.
   * @returns {Promise<TransactionsPage<XRPLTranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
   */
  public async getTransactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<XRPLTranslateTransaction>> {
    try {
      const endpoint = `${chain}/txs/${accountAddress}`;
      const url = constructUrl(endpoint, pageOptions);
      const result = await this.makeRequest(url);

      if (!this.validateResponse(result, ['items', 'nextPageSettings'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }

      // Validate that we have a proper response structure
      if (!Array.isArray(result.items)) {
        throw new TransactionError({ message: ['Invalid items format'] });
      }

      // Convert the XRPL response format to our standard pagination format
      const hasNextPage = !!(result.nextPageSettings && result.nextPageSettings.nextPageUrl);
      let nextPageKeys = hasNextPage ? parseUrl(result.nextPageSettings.nextPageUrl) : null;
      
      // For XRPL, we need to include the marker from nextPageSettings separately
      // since it may not be present in the URL or may be URL-encoded
      if (hasNextPage && result.nextPageSettings.marker && nextPageKeys) {
        nextPageKeys.marker = result.nextPageSettings.marker;
      }

      const initialData = {
        chain: chain,
        walletAddress: accountAddress,
        transactions: result.items,
        currentPageKeys: pageOptions,
        nextPageKeys: nextPageKeys,
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
   * Returns the current token balances (and optionally, prices) for the provided XRP Ledger account address.
   * You can optionally specify a ledger index or ledger hash to get historical balances at a specific point in time.
   * If neither is provided, the latest validated ledger will be used.
   * @param {string} chain - The chain name.
   * @param {string} accountAddress - The XRP Ledger account address to fetch balances for (starts with 'r').
   * @param {boolean} [includePrices=false] - Optional. If true, the response will include the prices of each token in USD.
   * @param {string} [ledgerIndex] - Optional. The ledger index to use for historical balance lookup. Can be a number or 'validated', 'current', 'closed'.
   * @param {string} [ledgerHash] - Optional. The ledger hash to use for historical balance lookup. Alternative to ledgerIndex.
   * @returns {Promise<XRPLTranslateBalancesResponse>} A promise that resolves to the balances data.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTokenBalances(
    chain: string,
    accountAddress: string,
    includePrices: boolean = false,
    ledgerIndex?: string,
    ledgerHash?: string
  ): Promise<XRPLTranslateBalancesResponse> {
    try {
      let endpoint = `${chain}/tokens/balancesOf/${accountAddress}`;
      
      const queryParams = new URLSearchParams();
      if (includePrices) queryParams.append('includePrices', 'true');
      if (ledgerIndex) queryParams.append('ledgerIndex', ledgerIndex);
      if (ledgerHash) queryParams.append('ledgerHash', ledgerHash);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      const result = await this.makeRequest(endpoint);
      
      if (!this.validateResponse(result, ['accountAddress', 'timestamp', 'balances'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      
      if (!Array.isArray(result.balances)) {
        throw new TransactionError({ message: ['Invalid balances format'] });
      }
      
      // Validate each balance in the array
      for (const balance of result.balances) {
        if (!this.validateResponse(balance, ['balance', 'token'])) {
          throw new TransactionError({ message: ['Invalid balance format'] });
        }
        if (!this.validateResponse(balance.token, ['symbol', 'name', 'decimals', 'address', 'issuer'])) {
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
}