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
 * UTXO address information - v2 format (nullable addresses)
 */
export interface UTXOTranslateAddressV2 {
  name: string | null;
  address: string | null;
}

/**
 * UTXO address information - v5 format (with owner field)
 */
export interface UTXOTranslateAddressV5 {
  name: string;
  address: string;
  owner: Record<string, any>;
}

/**
 * UTXO transfer information - v2 format (in sent/received arrays)
 */
export interface UTXOTranslateTransferV2 {
  action: string;
  from: UTXOTranslateAddressV2;
  to: UTXOTranslateAddressV2;
  amount: string;
  token: UTXOTranslateToken;
}

/**
 * UTXO transfer information - v5 format (in transfers array)
 */
export interface UTXOTranslateTransferV5 {
  action: string;
  from: UTXOTranslateAddressV5;
  to: UTXOTranslateAddressV5;
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
 * UTXO transaction type union based on backend confirmation (only sendToken/receiveToken)
 */
export type UTXOTransactionType = 'sendToken' | 'receiveToken';

/**
 * UTXO classification data - v2 format
 */
export interface UTXOTranslateClassificationDataV2 {
  type: UTXOTransactionType;
  source: {
    type: string;
  };
  description: string;
  protocol: Record<string, any>;
  sent: UTXOTranslateTransferV2[];
  received: UTXOTranslateTransferV2[];
  utxo: {
    summary: UTXOTransactionSummary;
  };
}

/**
 * UTXO classification data - v5 format
 */
export interface UTXOTranslateClassificationDataV5 {
  type: UTXOTransactionType;
  source: {
    type: string;
  };
  description: string;
  protocol: Record<string, any>;
}

/**
 * UTXO raw transaction data - v2 format (timestamp in rawTransactionData)
 */
export interface UTXOTranslateRawTransactionDataV2 {
  transactionHash: string;
  blockNumber: number;
  transactionFee: {
    amount: string;
    token: UTXOTranslateToken;
  };
  timestamp: number;
}

/**
 * UTXO raw transaction data - v5 format (no timestamp in rawTransactionData)
 */
export interface UTXOTranslateRawTransactionDataV5 {
  transactionHash: string;
  blockNumber: number;
  transactionFee: {
    amount: string;
    token: UTXOTranslateToken;
  };
}

/**
 * UTXO value item - v5 format specific
 */
export interface UTXOTranslateValueItem {
  name: string;
  value: {
    summary: UTXOTransactionSummary;
  };
}

/**
 * UTXO transaction - v2 format
 */
export interface UTXOTranslateTransactionV2 extends PaginatedItem {
  txTypeVersion: 2;
  chain: string;
  accountAddress: string;
  classificationData: UTXOTranslateClassificationDataV2;
  rawTransactionData: UTXOTranslateRawTransactionDataV2;
}

/**
 * UTXO transaction - v5 format
 */
export interface UTXOTranslateTransactionV5 extends PaginatedItem {
  txTypeVersion: 5;
  chain: string;
  accountAddress: string;
  timestamp: number;
  classificationData: UTXOTranslateClassificationDataV5;
  transfers: UTXOTranslateTransferV5[];
  values: UTXOTranslateValueItem[];
  rawTransactionData: UTXOTranslateRawTransactionDataV5;
}

/**
 * Union type for UTXO transactions
 */
export type UTXOTranslateTransaction = UTXOTranslateTransactionV2 | UTXOTranslateTransactionV5;

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
 * Bitcoin address type for getAddressesByMasterKey
 * Supports both numeric and string values
 */
export type BitcoinAddressType = 0 | 1 | 2 | 3 | 'Legacy' | 'SegWit' | 'SegWitP2SH' | 'Taproot';

/**
 * Options for getAddressesByMasterKey endpoint
 */
export interface GetAddressesByMasterKeyOptions {
  /**
   * Number of addresses to derive from the master key
   * Values between 1-10000. Default: 20
   */
  count?: number;
  /**
   * Bitcoin address type to generate
   * Supports both numeric (0-3) and string values
   * 0/'Legacy': Legacy P2PKH addresses starting with "1" - Most compatible, higher fees
   * 1/'SegWit': Native SegWit P2WPKH addresses starting with "bc1" - Lower fees, modern standard
   * 2/'SegWitP2SH': SegWit P2SH-P2WPKH addresses starting with "3" - Backward compatible SegWit
   * 3/'Taproot': Taproot P2TR addresses starting with "bc1p" - Enhanced privacy and flexibility
   * Default: 'Legacy' (0)
   */
  addressType?: BitcoinAddressType;
}

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