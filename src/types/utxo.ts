/**
 * UTXO-specific types for the Translate API
 * These types match the actual API responses from UTXO endpoints
 */

import { PaginatedItem } from '../translate/transactionsPage';

/**
 * UTXO chain information returned by the getChains endpoint
 */
export interface UTXOTranslateChain {
  name: string;
  ecosystem: 'utxo';
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
  tier: number;
}

/**
 * Response type for getChains endpoint
 */
export type UTXOTranslateChainsResponse = UTXOTranslateChain[];

/**
 * UTXO token information
 */
export interface UTXOTranslateToken {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

/**
 * UTXO address information
 */
export interface UTXOTranslateAddress {
  name: string | null;
  address: string | null;
}

/**
 * UTXO transfer information
 */
export interface UTXOTranslateTransfer {
  action: string;
  from: UTXOTranslateAddress;
  to: UTXOTranslateAddress;
  amount: string;
  token: UTXOTranslateToken;
}

/**
 * UTXO-specific transaction summary for inputs and outputs
 */
export interface UTXOTransactionSummaryItem {
  senders?: string[];
  receivers?: string[];
  totalSent?: {
    amount: string;
    token: UTXOTranslateToken;
  };
  totalReceived?: {
    amount: string;
    token: UTXOTranslateToken;
  };
}

/**
 * UTXO-specific transaction summary
 */
export interface UTXOTransactionSummary {
  inputs: UTXOTransactionSummaryItem[];
  outputs: UTXOTransactionSummaryItem[];
}

/**
 * UTXO classification data
 */
export interface UTXOTranslateClassificationData {
  type: string;
  source: {
    type: string | null;
  };
  description: string;
  protocol: Record<string, any>;
  sent: UTXOTranslateTransfer[];
  received: UTXOTranslateTransfer[];
  utxo: {
    summary: UTXOTransactionSummary;
  };
}

/**
 * UTXO raw transaction data
 */
export interface UTXOTranslateRawTransactionData {
  transactionHash: string;
  blockNumber: number;
  transactionFee: {
    amount: string;
    token: UTXOTranslateToken;
  };
  timestamp: number;
}

/**
 * UTXO transaction
 */
export interface UTXOTranslateTransaction extends PaginatedItem {
  txTypeVersion: number;
  chain: string;
  accountAddress: string;
  classificationData: UTXOTranslateClassificationData;
  rawTransactionData: UTXOTranslateRawTransactionData;
}

/**
 * Response type for the Transactions endpoint
 */
export interface UTXOTranslateTransactionsResponse {
  items: UTXOTranslateTransaction[];
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}

/**
 * UTXO token balance information
 */
export interface UTXOTranslateBalanceData {
  balance: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
  };
}

/**
 * Response type for token balances endpoint
 */
export type UTXOTranslateBalancesResponse = UTXOTranslateBalanceData[];

/**
 * Response type for getAddressesByXpub endpoint (Bitcoin-specific)
 */
export type UTXOTranslateAddressesResponse = string[];

/**
 * UTXO Transaction Job for batch processing
 * Based on actual API response from POST /utxo/{chain}/txs/job/start
 */
export interface UTXOTranslateTransactionJob {
  jobId: string;
  nextPageUrl: string;
}

/**
 * UTXO Transaction Job Response for batch processing
 * Based on actual API response from GET /utxo/{chain}/txs/job/{jobId}
 */
export interface UTXOTranslateTransactionJobResponse {
  items: UTXOTranslateTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}

/**
 * UTXO Job Progress Response (425 status)
 * Returned when job is still processing
 */
export interface UTXOTranslateJobProgressResponse {
  detail: {
    message: string;
    txsProcessed: number;
  };
}

/**
 * Delete transaction job response for UTXO
 * Based on actual API response from DELETE /utxo/{chain}/txs/job/{jobId}
 */
export interface UTXOTranslateDeleteTransactionJobResponse {
  message: string;
}

/**
 * Interface representing a UTXO chain as returned by the Pricing API
 * Based on actual API response from GET /utxo/chains
 */
export interface UTXOPricingChain {
  name: string;
  ecosystem: 'utxo';
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
}

/**
 * Response from the UTXO pricing chains endpoint
 */
export type UTXOPricingChainsResponse = UTXOPricingChain[];

/**
 * Interface representing a token in UTXO pricing response
 * Based on actual API response from GET /utxo/{chain}/price/{token}
 */
export interface UTXOPricingToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

/**
 * Interface representing price information in UTXO pricing response
 * Based on actual API response from GET /utxo/{chain}/price/{token}
 */
export interface UTXOPricingPriceInfo {
  amount: string;
  currency: string;
  status: string;
}

/**
 * Interface representing the complete UTXO pricing response
 * Based on actual API response from GET /utxo/{chain}/price/{token}
 */
export interface UTXOPricingPrice {
  chain: string;
  token: UTXOPricingToken;
  price: UTXOPricingPriceInfo;
  priceType: string;
  priceStatus: string;
} 