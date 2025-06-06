/**
 * Re-exports for backward compatibility
 * This file maintains the existing API while using the new ecosystem-specific types
 */

// Common types
export * from './common';

// EVM types
export * from './evm';

// SVM types
export * from './svm';

// Cosmos types
export * from './cosmos';

// Polkadot types
export * from './polkadot';

// TVM types
export * from './tvm';

// UTXO types
export * from './utxo';

// Move types
export * from './move';

// Re-export old generic names for backward compatibility
export type { EVMTranslateDescribeTransaction as DescribeTransaction } from './evm';
export type { EVMTranslateHistoryData as HistoryData } from './evm';
export type { EVMTranslateBalancesData as BalancesData } from './evm';
export type { EVMTranslateTransactionTypes as TransactionTypes } from './evm';
export type { EVMTranslateTransactionTypesResponse as TransactionTypesResponse } from './evm';

// SVM backward compatibility aliases
export type { SVMTranslateTransactionType as SVMTransactionTypes } from './svm';
export type { SVMTranslateTransactionTypesResponse as SVMTransactionTypesResponse } from './svm';
export type { EVMTranslateTransactionJob as EVMTransactionJob } from './evm';
export type { EVMTranslateTransactionJobResponse as EVMTransactionJobResponse } from './evm';
export type { EVMTranslateTransactionV2 as TransactionV2 } from './evm';
export type { EVMTranslateTransactionV5 as TransactionV5 } from './evm';
export type { EVMTranslateRawTransactionResponse as RawTransactionResponse } from './evm';
export type { EVMTranslateBalancesResponse as BalancesResponse } from './evm';
export type { EVMTranslateToken as Token } from './evm';
export type { EVMTranslateNft as Nft } from './evm';
export type { EVMTranslateAddress as From, EVMTranslateAddress as To } from './evm';
export type { EVMTranslateTransfer as SentReceived } from './evm';
export type { EVMTranslateUnsignedTransaction as UnsignedTransaction } from './evm';
export type { EVMTranslateStateDiff as StateDiff } from './evm';
export type { EVMTranslateStateOverrides as StateOverrides } from './evm';
export type { EVMTranslateUserOperation as UserOperation } from './evm';
export type { EVMTranslateTokenHolder as TokenHolder } from './evm';
export type { EVMTranslateTokenTransfer as TokenTransfer } from './evm';
export type { EVMTranslateTransactionCountResponse as TransactionCountResponse } from './evm';
export type { EVMTranslateTransactionStatus as TransactionStatus } from './evm';
export type { EVMTranslateDeleteTransactionJobResponse as DeleteTransactionJobResponse } from './evm';
export type { EVMTranslateApproval as Approval } from './evm';

// EVM pricing specific exports
export type { 
    EVMPricingChain, 
    EVMPricingChains, 
    EVMPricingResponse, 
    EVMPricingPoolResponse, 
    EVMPricingToken, 
    EVMPricingPrice, 
    EVMPricingSource, 
    EVMPricingExchange, 
    EVMPricingBaseToken,
    EVMPricingTokenPrefetchRequest,
    EVMPricingTokenPrefetchResult,
    EVMPricingTokenPrefetchResultData,
    EVMPricingTokenInfo,
    EVMPricingPreFetchResponse
} from './evm';

// Legacy aliases for ClassificationData types
export type { EVMTranslateClassificationDataV2 as ClassificationData } from './evm';
export type { EVMTranslateRawTransactionData as RawTransactionData } from './evm';

// EVM Foresight types
export type { 
    EVMForesightDescribe4337Response, 
    EVMForesightPreviewResponse, 
    EVMForesightPreview4337Response,
    EVMForesightScreenResponse,
    EVMForesightScreen4337Response,
    EVMForesightAddressAnalysis,
    EVMForesightTokenAnalysis,
    EVMForesightRisk
} from './evm';

// SVM backward compatibility aliases
export type { SVMTranslateStakingTransactionsResponse as SVMStakingTransactionsResponse } from './svm';
export type { SVMTranslateStakingEpochResponse as SVMStakingEpochResponse } from './svm';

// SVM pricing specific exports
export type { 
    SVMPricingChain, 
    SVMPricingChainsResponse,
    SVMPricingPrice,
    SVMPricingToken,
    SVMPricingPriceInfo
} from './svm';

// UTXO pricing specific exports
export type { 
    UTXOPricingChain, 
    UTXOPricingChainsResponse,
    UTXOPricingPrice,
    UTXOPricingToken,
    UTXOPricingPriceInfo
} from './utxo';

// Backward compatibility aliases for UTXO types
export type { EVMPricingChain as Chain } from './evm';

// Backward compatibility aliases for Cosmos types
export type { COSMOSTranslateTokenBalance as CosmosTokenBalance } from './cosmos';
export type { COSMOSTranslateBalancesResponse as CosmosBalancesResponse } from './cosmos';
export type { COSMOSTranslateTransactionJob as CosmosTransactionJob } from './cosmos';
export type { COSMOSTranslateTransactionJobResponse as CosmosTransactionJobResponse } from './cosmos';
export type { UTXOTranslateTransaction as Transaction } from './utxo';
export type { COSMOSTranslateTransactionsResponse as CosmosTransactionsResponse } from './cosmos';

// Cosmos pricing types (backward compatibility)
export type { COSMOSPricingChainsResponse as ChainsResponse } from './cosmos';

// Backward compatibility aliases for Polkadot types
export type { POLKADOTTranslateTransaction as PolkadotTransaction } from './polkadot';
export type { POLKADOTTranslateStakingRewardsResponse as PolkadotStakingRewardsResponse } from './polkadot';

// Pricing types (backward compatibility aliases)
export type { EVMPricingResponse as Pricing } from './evm';
export type { EVMPricingPoolResponse as PoolPricing } from './evm';

// Backward compatibility for old prefetch types
export type { EVMPricingTokenPrefetchRequest as TokenPrefetchRequest } from './evm';
export type { EVMPricingTokenPrefetchResult as TokenPrefetchResult } from './evm';
export type { EVMPricingTokenPrefetchResultData as TokenPriceResult } from './evm'; 