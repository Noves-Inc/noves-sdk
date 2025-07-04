/**
 * Cosmos ecosystem-specific types
 */

// Naming convention: COSMOSTranslate[TypeName] for translate API types
// Naming convention: COSMOSPricing[TypeName] for pricing API types

// === PRICING TYPES ===

/**
 * Native coin information for Cosmos chains
 */
export interface COSMOSPricingNativeCoin {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}

/**
 * Represents a Cosmos chain from the pricing /cosmos/chains endpoint
 */
export interface COSMOSPricingChain {
  name: string;
  ecosystem: string;
  nativeCoin: COSMOSPricingNativeCoin;
}

/**
 * Response type for the pricing getChains method
 */
export type COSMOSPricingChainsResponse = COSMOSPricingChain[];

/**
 * Token information for pricing - matches actual API response
 * All fields are required based on actual API response structure
 */
export interface COSMOSPricingToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Exchange information for pricing - matches actual API response
 * Only name can be null based on actual API response
 */
export interface COSMOSPricingExchange {
  name: string | null;
}

/**
 * Price information - matches actual API response
 * Amount is always present based on actual API response
 */
export interface COSMOSPricingPrice {
  amount: string;
}

/**
 * Pool pricing response for Cosmos chains - matches actual API response exactly
 * Updated to reflect actual API response structure with correct nullable fields
 */
export interface COSMOSPricingPoolPricing {
  chain: string;
  exchange: COSMOSPricingExchange;
  poolAddress: string;
  baseToken: COSMOSPricingToken;
  quoteToken: COSMOSPricingToken;
  price: COSMOSPricingPrice;
}

// === TRANSLATE TYPES ===

/**
 * Represents a Cosmos chain from the /cosmos/chains endpoint
 */
export interface COSMOSTranslateChain {
  name: string;
  ecosystem: string;
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
  tier: number;
}

/**
 * Response type for the getChains method
 */
export type COSMOSTranslateChainsResponse = COSMOSTranslateChain[];

/**
 * Token balance for Cosmos
 */
export interface COSMOSTranslateTokenBalance {
  balance: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    icon: string | null;
  };
}

/**
 * Response type for token balances
 */
export type COSMOSTranslateBalancesResponse = COSMOSTranslateTokenBalance[];

/**
 * Transaction job for Cosmos - matches actual start job API response
 */
export interface COSMOSTranslateTransactionJob {
  nextPageId: string;
  nextPageUrl: string;
}

/**
 * Transaction job response for Cosmos - matches actual job results API response
 */
export interface COSMOSTranslateTransactionJobResponse {
  items: COSMOSTranslateTransaction[];
  hasNextPage: boolean;
  nextPageUrl?: string;
}

/**
 * Cosmos address type - matches actual API response
 */
export interface COSMOSTranslateAddress {
  name: string | null;
  address: string | null;
}

/**
 * Cosmos asset type - matches actual API response
 */
export interface COSMOSTranslateAsset {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  icon: string | null;
}

/**
 * Cosmos transfer type - matches actual API response
 */
export interface COSMOSTranslateTransfer {
  action: string;
  from: COSMOSTranslateAddress;
  to: COSMOSTranslateAddress;
  amount: string;
  asset: COSMOSTranslateAsset;
}

/**
 * Cosmos transaction type union - complete list of all supported transaction types
 */
export type CosmosTransactionType = 
  | 'delegate'
  | 'undelegate'
  | 'withdrawRewards'
  | 'claimRewards'
  | 'swap'
  | 'bridgeOut'
  | 'ibcReceive'
  | 'bridgeIn'
  | 'EibcStart'
  | 'payForBlobs'
  | 'unclassified';

/**
 * Cosmos transaction classification data - matches actual API response
 */
export interface COSMOSTranslateClassificationData {
  type: CosmosTransactionType;
  description: string;
}

/**
 * Cosmos raw transaction data - matches actual API response
 * Note: txhash can be null (e.g., in genesis transactions)
 */
export interface COSMOSTranslateRawTransactionData {
  height: number;
  txhash: string | null;
  gas_used: number;
  gas_wanted: number;
  transactionFee: number;
  timestamp: number;
}

/**
 * Cosmos transaction type - matches actual API response exactly
 */
export interface COSMOSTranslateTransaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string | null;
  classificationData: COSMOSTranslateClassificationData;
  transfers: COSMOSTranslateTransfer[];
  values: any[]; // Empty array in actual response, keeping flexible
  rawTransactionData: COSMOSTranslateRawTransactionData;
}

/**
 * Response type for the getTransactions method - matches actual API response
 */
export interface COSMOSTranslateTransactionsResponse {
  account: string;
  items: COSMOSTranslateTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  startBlock: number | null;
  endBlock: number;
  nextPageUrl: string | null;
} 