import { PaginatedItem } from '../translate/transactionsPage';

/**
 * Exchange-specific types for the Noves SDK
 * Based on actual API responses from Exchange endpoints
 */

/**
 * Exchange information as returned by /exchange/exchanges endpoint
 * This interface exactly matches the actual API response structure
 */
export interface ExchangeTranslateExchange {
    name: string;
    ecosystem: "exchange";
    tier: number;
}

/**
 * Array of exchanges returned by getExchanges() method
 */
export type ExchangeTranslateExchanges = ExchangeTranslateExchange[];

/**
 * Exchange account information
 * Based on actual API response from /exchange/{exchange}/accounts endpoint
 */
export interface ExchangeTranslateAccount {
    id: string;
    type: string;
    name: string;
    code: string;
}

/**
 * Response structure for getAccounts method
 * Based on actual API response from /exchange/{exchange}/accounts endpoint
 */
export interface ExchangeTranslateAccountsResponse {
    accounts: ExchangeTranslateAccount[];
}

/**
 * Exchange token information
 * Based on actual API response from /exchange/{exchange}/balances endpoint
 */
export interface ExchangeTranslateToken {
    symbol: string;
    name: string;
    decimals: string;
}

/**
 * Exchange balance information
 * Based on actual API response from /exchange/{exchange}/balances endpoint
 */
export interface ExchangeTranslateBalance {
    balance: string;
    token: ExchangeTranslateToken;
}

/**
 * Response structure for getBalances method
 * Based on actual API response from /exchange/{exchange}/balances endpoint
 */
export interface ExchangeTranslateBalancesResponse {
    balances: ExchangeTranslateBalance[];
}

/**
 * Address information for exchange transactions
 */
export interface ExchangeTranslateAddress {
    name: string | null;
    address: string | null;
}

/**
 * Asset information for exchange transactions
 */
export interface ExchangeTranslateAsset {
    symbol: string;
}

/**
 * Transfer information for exchange transactions
 */
export interface ExchangeTranslateTransfer {
    action: string;
    from: ExchangeTranslateAddress;
    to: ExchangeTranslateAddress;
    amount: number;
    asset: ExchangeTranslateAsset;
}

/**
 * Classification data for exchange transactions
 */
export interface ExchangeTranslateClassificationData {
    type: string;
}

/**
 * Source information for exchange transactions
 */
export interface ExchangeTranslateSource {
    type: string;
}

/**
 * Value information for exchange transactions (currently empty in API responses)
 */
export interface ExchangeTranslateValue {
    // This array is currently empty in API responses but included for completeness
    // Add specific fields when they become available in the API
}

/**
 * Destination transaction information
 */
export interface ExchangeTranslateDestinationTransaction {
    chain: string;
    to: string | null;
    transactionHash: string;
    timestamp: number;
}

/**
 * Raw transaction data for exchange transactions
 */
export interface ExchangeTranslateRawTransactionData {
    status: string;
    destinationTx: ExchangeTranslateDestinationTransaction;
}

/**
 * Exchange transaction structure
 * Based on actual API response from /exchange/{exchange}/txs endpoint
 */
export interface ExchangeTranslateTransaction extends PaginatedItem {
    txTypeVersion: number;
    source: ExchangeTranslateSource;
    chain: string;
    timestamp: number;
    classificationData: ExchangeTranslateClassificationData;
    transfers: ExchangeTranslateTransfer[];
    values: ExchangeTranslateValue[];
    rawTransactionData: ExchangeTranslateRawTransactionData;
}

/**
 * Response structure for getTransactions method
 * Based on actual API response from /exchange/{exchange}/txs endpoint
 */
export interface ExchangeTranslateTransactionsResponse {
    items: ExchangeTranslateTransaction[];
    pageSize: number;
    hasNextPage: boolean;
    nextPageUrl?: string;
}

/**
 * Authentication configuration for exchange API calls
 * Based on actual API request structure
 */
export interface ExchangeTranslateAuth {
    apiKey: string;
    walletAddress: string;
    testnet?: boolean;
}

/**
 * Request body structure for exchange API calls that require authentication
 */
export interface ExchangeTranslateAuthRequest {
    auth: ExchangeTranslateAuth;
}

/**
 * Options for pagination in exchange transaction requests
 */
export interface ExchangeTranslatePageOptions {
    startTimestamp?: number;
    endTimestamp?: number;
    pageSize?: number;
    pageKey?: string;
}
