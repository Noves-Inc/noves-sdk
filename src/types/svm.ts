/**
 * SVM (Solana Virtual Machine) ecosystem-specific types
 * These types match the actual API responses from the Noves API
 */

/**
 * Represents an SVM chain as returned by the Translate API
 */
export interface SVMTranslateChain {
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
 * Response from the SVM chains endpoint
 */
export type SVMTranslateChainsResponse = SVMTranslateChain[];

/**
 * Interface representing a token in a transfer
 */
export interface SVMTranslateToken {
  decimals: number;
  address: string;
  name: string | null;
  symbol: string | null;
  icon: string | null;
}

/**
 * Interface representing an account in a transfer
 */
export interface SVMTranslateAccount {
  name: string | null;
  address: string | null;
  owner: {
    name: string | null;
    address: string | null;
  };
}

/**
 * Interface representing a transfer in a transaction
 */
export interface SVMTranslateTransfer {
  action: string;
  amount: string;
  token: SVMTranslateToken;
  from: SVMTranslateAccount;
  to: SVMTranslateAccount;
}

/**
 * Interface representing the raw transaction data
 */
export interface SVMTranslateRawTransactionData {
  signature: string;
  blockNumber: number;
  signer: string;
  interactedAccounts: string[];
}

/**
 * Interface representing the source of the transaction for V5 format
 */
export interface SVMTranslateSourceV5 {
  type: string | null;
  name: string | null;
}

/**
 * Interface representing the source of the transaction for V4 format
 */
export interface SVMTranslateSourceV4 {
  type: string;
  name: string;
}

/**
 * SVM transaction type union based on actual API response from /svm/txTypes endpoint
 */
export type SVMTransactionType = 
  | 'addLiquidity'
  | 'bridge'
  | 'cancelNftListing'
  | 'claimRewards'
  | 'closeTipAccount'
  | 'createNftListing'
  | 'depositForStake'
  | 'depositToVault'
  | 'distributeRewards'
  | 'error'
  | 'failed'
  | 'mergeStake'
  | 'mintNFT'
  | 'mintToken'
  | 'removeLiquidity'
  | 'stake'
  | 'swap'
  | 'unclassified'
  | 'unstake'
  | 'withdrawStake';

/**
 * Interface representing classification data for SVM V5 transactions
 */
export interface SVMTranslateClassificationDataV5 {
  type: SVMTransactionType;
  description: string | null;
}

/**
 * Interface representing classification data for SVM V4 transactions
 */
export interface SVMTranslateClassificationDataV4 {
  type: SVMTransactionType;
}

/**
 * Interface representing a V4 SVM transaction response
 */
export interface SVMTranslateTransactionV4 {
  txTypeVersion: 4;
  source: SVMTranslateSourceV4;
  timestamp: number;
  classificationData: SVMTranslateClassificationDataV4;
  transfers: SVMTranslateTransfer[];
  rawTransactionData: SVMTranslateRawTransactionData;
}

/**
 * Interface representing a V5 SVM transaction response
 */
export interface SVMTranslateTransactionV5 {
  txTypeVersion: 5;
  source: SVMTranslateSourceV5;
  timestamp: number;
  classificationData: SVMTranslateClassificationDataV5;
  transfers: SVMTranslateTransfer[];
  values: any[];
  rawTransactionData: SVMTranslateRawTransactionData;
}

/**
 * Union type for SVM transactions
 */
export type SVMTranslateTransaction = SVMTranslateTransactionV4 | SVMTranslateTransactionV5;

/**
 * Interface representing paginated SVM transactions response
 */
export interface SVMTranslateTransactionsResponse {
  items: SVMTranslateTransaction[];
  page: number;
  pageSize: number;
  nextPageUrl: string | null;
}

/**
 * Interface representing a transaction description
 */
export interface SVMTranslateDescribeTransaction {
  signature: string;
  type: SVMTransactionType;
  description: string;
  timestamp: number;
  transfers: SVMTranslateTransfer[];
}

/**
 * Interface representing SPL accounts response
 */
export interface SVMTranslateSPLAccounts {
  accountPubkey: string;
  tokenAccounts: Array<{
    pubKey: string;
  }>;
}

/**
 * Interface representing SVM token balance
 */
export interface SVMTranslateTokenBalance {
  balance: string;
  usdValue: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    price: string;
  };
}

/**
 * Response from the SVM token balances endpoint
 */
export type SVMTranslateTokenBalancesResponse = SVMTranslateTokenBalance[];

/**
 * Interface representing a single transaction type
 */
export interface SVMTranslateTransactionType {
  type: string;
  description: string;
}

/**
 * Interface representing the full transaction types response from /svm/txTypes endpoint
 */
export interface SVMTranslateTransactionTypesResponse {
  version: number;
  transactionTypes: SVMTranslateTransactionType[];
}

/**
 * Interface representing transaction job for SVM
 */
export interface SVMTranslateTransactionJob {
  jobId: string;
  nextPageUrl: string;
  startTimestamp: number;
}

/**
 * Interface representing transaction job response for SVM
 */
export interface SVMTranslateTransactionJobResponse {
  items: SVMTranslateTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}

/**
 * Interface representing delete transaction job response for SVM
 */
export interface SVMTranslateDeleteTransactionJobResponse {
  message: string;
}

/**
 * Interface representing transaction count job start response for SVM
 */
export interface SVMTranslateTransactionCountJobStartResponse {
  jobId: string;
  resultsUrl: string;
}

/**
 * Interface representing transaction count response for SVM
 */
export interface SVMTranslateTransactionCountResponse {
  chain: string;
  timestamp: number;
  account: {
    address: string;
    transactionCount: number;
  };
}

/**
 * Interface representing SVM staking transaction
 */
export interface SVMTranslateStakingTransaction {
  txTypeVersion: number;
  source: SVMTranslateSourceV5;
  timestamp: number;
  classificationData: {
    description: string;
    type: SVMTransactionType;
  };
  transfers: SVMTranslateTransfer[];
  values: Array<{
    key: string;
    value: string;
  }>;
  rawTransactionData: {
    signature: string;
    blockNumber: number;
    signer: string;
    interactedAccounts: string[] | null;
  };
}

/**
 * Interface representing SVM staking transactions response
 */
export interface SVMTranslateStakingTransactionsResponse {
  items: SVMTranslateStakingTransaction[];
  numberOfEpochs: number;
  failedEpochs: any[];
  nextPageUrl: string | null;
}

/**
 * Interface representing SVM staking epoch response
 */
export interface SVMTranslateStakingEpochResponse {
  txTypeVersion: 5;
  source: SVMTranslateSourceV5;
  timestamp: number;
  classificationData: {
    description: string;
    type: string;
  };
  transfers: SVMTranslateTransfer[];
  values: Array<{
    key: string;
    value: string;
  }>;
  rawTransactionData: {
    signature: string;
    blockNumber: number;
    signer: string;
    interactedAccounts: string[] | null;
  };
}

/**
 * Interface representing an SVM chain as returned by the Pricing API
 */
export interface SVMPricingChain {
  name: string;
  ecosystem: string;
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
}

/**
 * Response from the SVM pricing chains endpoint
 */
export type SVMPricingChainsResponse = SVMPricingChain[];

/**
 * Interface representing a token in SVM pricing response
 */
export interface SVMPricingToken {
  address: string;
  symbol: string;
  name: string;
}

/**
 * Interface representing price information in SVM pricing response
 */
export interface SVMPricingPriceInfo {
  amount: string;
  currency: string;
  status: string;
}

/**
 * Interface representing the complete SVM pricing response
 * Matches the actual API response from GET /svm/{chain}/price/{tokenAddress}
 */
export interface SVMPricingPrice {
  chain: string;
  token: SVMPricingToken;
  price: SVMPricingPriceInfo;
  priceType: string;
  priceStatus: string;
} 