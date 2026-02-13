// src/translate/translateExchange.ts

import { 
  ExchangeTranslateExchanges,
  ExchangeTranslateAccountsResponse,
  ExchangeTranslateBalancesResponse,
  ExchangeTranslateTransactionsResponse,
  ExchangeTranslateAuthRequest,
  ExchangeTranslatePageOptions
} from '../types/exchange';
import { TransactionError } from '../errors/TransactionError';
import { ErrorType } from '../errors/ErrorTypes';
import { BaseTranslate } from './baseTranslate';
import { RetryConfig, FetchConfig } from '../types/common';

const ECOSYSTEM = 'exchange';

/**
 * Class representing the Exchange translation module.
 * Provides access to exchange-specific translation services for centralized exchanges.
 */
export class TranslateExchange extends BaseTranslate {
  /**
   * Create a TranslateExchange instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @param {Partial<RetryConfig>} [retryConfig] - Optional retry configuration for enhanced resilience.
   * @param {FetchConfig} [fetchConfig] - Optional fetch configuration for timeouts, abort signals, and custom headers.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string, retryConfig?: Partial<RetryConfig>, fetchConfig?: FetchConfig) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    super(ECOSYSTEM, apiKey, retryConfig, fetchConfig);
  }

  /**
   * Returns a list of available exchanges supported by this API.
   * @returns {Promise<ExchangeTranslateExchanges>} A promise that resolves to an array of exchanges.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getExchanges(): Promise<ExchangeTranslateExchanges> {
    try {
      const result = await this.makeRequest('exchanges');
      if (!Array.isArray(result)) {
        throw new TransactionError({ message: ['Invalid response format'] }, ErrorType.VALIDATION_ERROR);
      }
      // Validate each exchange in the array
      for (const exchange of result) {
        if (!this.validateResponse(exchange, ['name', 'ecosystem', 'tier'])) {
          throw new TransactionError({ message: ['Invalid exchange format'] }, ErrorType.VALIDATION_ERROR);
        }
      }
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get exchanges'] });
    }
  }

  /**
   * Returns the accounts available for the requested exchange, for the credentials posted.
   * @param {string} exchange - The exchange name.
   * @param {ExchangeTranslateAuthRequest} authRequest - The authentication request containing credentials.
   * @returns {Promise<ExchangeTranslateAccountsResponse>} A promise that resolves to the accounts response.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getAccounts(exchange: string, authRequest: ExchangeTranslateAuthRequest): Promise<ExchangeTranslateAccountsResponse> {
    if (!exchange) {
      throw new TransactionError({ message: ['Exchange name is required'] }, ErrorType.VALIDATION_ERROR);
    }
    if (!authRequest?.auth) {
      throw new TransactionError({ message: ['Authentication credentials are required'] }, ErrorType.VALIDATION_ERROR);
    }
    if (!authRequest.auth.apiKey || !authRequest.auth.walletAddress) {
      throw new TransactionError({ message: ['API key and wallet address are required'] }, ErrorType.VALIDATION_ERROR);
    }

    try {
      const endpoint = `${exchange}/accounts`;
      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify(authRequest)
      });

      if (!this.validateResponse(result, ['accounts'])) {
        throw new TransactionError({ message: ['Invalid response format'] }, ErrorType.VALIDATION_ERROR);
      }
      
      // Validate each account in the accounts array
      if (!Array.isArray(result.accounts)) {
        throw new TransactionError({ message: ['Invalid accounts format'] }, ErrorType.VALIDATION_ERROR);
      }
      for (const account of result.accounts) {
        if (!this.validateResponse(account, ['id', 'type', 'name', 'code'])) {
          throw new TransactionError({ message: ['Invalid account format'] }, ErrorType.VALIDATION_ERROR);
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get accounts'] });
    }
  }

  /**
   * Returns the balances for the requested exchange account.
   * @param {string} exchange - The exchange name.
   * @param {ExchangeTranslateAuthRequest} authRequest - The authentication request containing credentials.
   * @returns {Promise<ExchangeTranslateBalancesResponse>} A promise that resolves to the balances response.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getBalances(exchange: string, authRequest: ExchangeTranslateAuthRequest): Promise<ExchangeTranslateBalancesResponse> {
    if (!exchange) {
      throw new TransactionError({ message: ['Exchange name is required'] }, ErrorType.VALIDATION_ERROR);
    }
    if (!authRequest?.auth) {
      throw new TransactionError({ message: ['Authentication credentials are required'] }, ErrorType.VALIDATION_ERROR);
    }
    if (!authRequest.auth.apiKey || !authRequest.auth.walletAddress) {
      throw new TransactionError({ message: ['API key and wallet address are required'] }, ErrorType.VALIDATION_ERROR);
    }

    try {
      const endpoint = `${exchange}/balances`;
      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify(authRequest)
      });

      if (!this.validateResponse(result, ['balances'])) {
        throw new TransactionError({ message: ['Invalid response format'] }, ErrorType.VALIDATION_ERROR);
      }
      
      // Validate each balance in the balances array
      if (!Array.isArray(result.balances)) {
        throw new TransactionError({ message: ['Invalid balances format'] }, ErrorType.VALIDATION_ERROR);
      }
      for (const balance of result.balances) {
        if (!this.validateResponse(balance, ['balance', 'token'])) {
          throw new TransactionError({ message: ['Invalid balance format'] }, ErrorType.VALIDATION_ERROR);
        }
        if (!this.validateResponse(balance.token, ['symbol', 'name', 'decimals'])) {
          throw new TransactionError({ message: ['Invalid token format'] }, ErrorType.VALIDATION_ERROR);
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get balances'] });
    }
  }

  /**
   * Returns all transactions for the requested exchange and account.
   * This includes deposits/bridge transactions, as well as trades and withdrawals.
   * @param {string} exchange - The exchange name.
   * @param {ExchangeTranslateAuthRequest} authRequest - The authentication request containing credentials.
   * @param {ExchangeTranslatePageOptions} pageOptions - Optional pagination and filtering options.
   * @returns {Promise<ExchangeTranslateTransactionsResponse>} A promise that resolves to the transactions response.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async getTransactions(
    exchange: string, 
    authRequest: ExchangeTranslateAuthRequest, 
    pageOptions: ExchangeTranslatePageOptions = {}
  ): Promise<ExchangeTranslateTransactionsResponse> {
    if (!exchange) {
      throw new TransactionError({ message: ['Exchange name is required'] }, ErrorType.VALIDATION_ERROR);
    }
    if (!authRequest?.auth) {
      throw new TransactionError({ message: ['Authentication credentials are required'] }, ErrorType.VALIDATION_ERROR);
    }
    if (!authRequest.auth.apiKey || !authRequest.auth.walletAddress) {
      throw new TransactionError({ message: ['API key and wallet address are required'] }, ErrorType.VALIDATION_ERROR);
    }

    try {
      let endpoint = `${exchange}/txs`;
      
      // Add query parameters if provided
      const queryParams = new URLSearchParams();
      if (pageOptions.startTimestamp) queryParams.append('startTimestamp', pageOptions.startTimestamp.toString());
      if (pageOptions.endTimestamp) queryParams.append('endTimestamp', pageOptions.endTimestamp.toString());
      if (pageOptions.pageSize) queryParams.append('pageSize', pageOptions.pageSize.toString());
      if (pageOptions.pageKey) queryParams.append('pageKey', pageOptions.pageKey);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      const result = await this.makeRequest(endpoint, 'POST', {
        body: JSON.stringify(authRequest)
      });

      if (!this.validateResponse(result, ['items', 'pageSize', 'hasNextPage'])) {
        throw new TransactionError({ message: ['Invalid response format'] }, ErrorType.VALIDATION_ERROR);
      }
      
      // Validate each transaction in the items array
      if (!Array.isArray(result.items)) {
        throw new TransactionError({ message: ['Invalid items format'] }, ErrorType.VALIDATION_ERROR);
      }
      for (const transaction of result.items) {
        if (!this.validateResponse(transaction, ['txTypeVersion', 'source', 'chain', 'timestamp', 'classificationData', 'transfers', 'values', 'rawTransactionData'])) {
          throw new TransactionError({ message: ['Invalid transaction format'] }, ErrorType.VALIDATION_ERROR);
        }
        if (!this.validateResponse(transaction.classificationData, ['type'])) {
          throw new TransactionError({ message: ['Invalid classificationData format'] }, ErrorType.VALIDATION_ERROR);
        }
        if (!this.validateResponse(transaction.source, ['type'])) {
          throw new TransactionError({ message: ['Invalid source format'] }, ErrorType.VALIDATION_ERROR);
        }
        if (!this.validateResponse(transaction.rawTransactionData, ['status', 'destinationTx'])) {
          throw new TransactionError({ message: ['Invalid rawTransactionData format'] }, ErrorType.VALIDATION_ERROR);
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to get transactions'] });
    }
  }
}
