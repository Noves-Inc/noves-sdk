/**
 * Polkadot-specific types based on actual API responses
 * Following naming convention: POLKADOT[API][TypeName]
 */

/**
 * Polkadot Translate Chain interface - matches actual API response structure
 */
export interface POLKADOTTranslateChain {
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
 * Polkadot Translate Chains response - array of chains
 */
export interface POLKADOTTranslateChainsResponse extends Array<POLKADOTTranslateChain> {}

/**
 * Polkadot-specific address interface
 */
export interface POLKADOTTranslateAddress {
  name: string | null;
  address: string;
  owner: {
    name: string | null;
    address: string | null;
  };
}

/**
 * Polkadot-specific asset interface
 */
export interface POLKADOTTranslateAsset {
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Polkadot-specific transfer interface
 */
export interface POLKADOTTranslateTransfer {
  action: string;
  from: POLKADOTTranslateAddress;
  to: {
    name: string | null;
    address: string | null;
    owner: {
      name: string | null;
      address: string | null;
    };
  };
  amount: string;
  asset: POLKADOTTranslateAsset;
}

/**
 * Polkadot-specific value interface
 */
export interface POLKADOTTranslateValue {
  key: string;
  value: string;
}

/**
 * Polkadot transaction type union - complete list of all supported transaction types
 */
export type PolkadotTransactionType = 
  | 'unclassified'
  | 'failed'
  | 'transfer'
  | 'tokenTransfer'
  | 'stake'
  | 'unstake'
  | 'moveStake'
  | 'transferStake'
  | 'syntheticStakingReward'
  | 'register'
  | 'burnedRegister'
  | 'setWeights'
  | 'commitWeights'
  | 'revealWeights'
  | 'swapHotkey'
  | 'executeColdkeySwap'
  | 'scheduleColdkeySwap'
  | 'setChildkeyTake'
  | 'claimRewards'
  | 'delegate'
  | 'undelegate'
  | 'bridgeOut'
  | 'bridgeIn'
  | 'swap';

/**
 * Polkadot-specific classification data interface
 */
export interface POLKADOTTranslateClassificationData {
  type: PolkadotTransactionType;
  description: string;
}

/**
 * Polkadot-specific raw transaction data interface
 */
export interface POLKADOTTranslateRawTransactionData {
  extrinsicIndex: number;
  blockNumber: number;
  timestamp: number;
  from: POLKADOTTranslateAddress;
  to: {
    name: string | null;
    address: string | null;
    owner: {
      name: string | null;
      address: string | null;
    };
  };
}

/**
 * Polkadot Transaction interface - matches actual API response structure
 */
export interface POLKADOTTranslateTransaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string | null;
  block: number;
  index: number;
  classificationData: POLKADOTTranslateClassificationData;
  transfers: POLKADOTTranslateTransfer[];
  values: POLKADOTTranslateValue[];
  rawTransactionData: POLKADOTTranslateRawTransactionData;
}

/**
 * Polkadot Translate Transactions Response interface - matches actual API response structure
 */
export interface POLKADOTTranslateTransactionsResponse {
  items: POLKADOTTranslateTransaction[];
  nextPageSettings: {
    hasNextPage: boolean;
    endBlock: number | null;
    nextPageUrl: string | null;
  };
}

/**
 * Polkadot Staking Rewards Response interface - matches actual API response structure
 */
export interface POLKADOTTranslateStakingRewardsResponse {
  items: POLKADOTTranslateTransaction[];
  nextPageSettings: {
    hasNextPage: boolean;
    endTimestamp: number | null;
    nextPageUrl: string | null;
  };
} 