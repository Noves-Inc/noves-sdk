import { PaginatedItem } from '../translate/transactionsPage';

/**
 * EVM-specific types for the Noves SDK
 * Based on actual API responses from EVM endpoints
 */

/**
 * EVM Chain information as returned by /evm/chains endpoint
 * This interface exactly matches the actual API response structure
 */
export interface EVMTranslateChain {
    name: string;
    ecosystem: "evm";
    evmChainId: number;
    nativeCoin: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
    };
    tier: number;
}

/**
 * Foresight Preview Response Raw Transaction Data
 * Based on actual API response from /evm/{chain}/preview endpoint
 */
export interface EVMForesightPreviewRawTransactionData {
    fromAddress: string;
    toAddress: string;
    gasUsed: number;
}

/**
 * EVM transaction type union based on actual API response from /evm/txTypes endpoint
 */
export type EVMTransactionType = 
  | 'addLiquidity'
  | 'addressPoisoning'
  | 'admin'
  | 'approveNFTCollection'
  | 'approveSingleNFT'
  | 'approveToken'
  | 'borrow'
  | 'burnNFT'
  | 'burnToken'
  | 'buyNFT'
  | 'cancelNFTListing'
  | 'cancelOrder'
  | 'claimAndStake'
  | 'claimRewards'
  | 'composite'
  | 'createContract'
  | 'createNFTListing'
  | 'delegate'
  | 'deployContract'
  | 'depositCollateral'
  | 'depositToExchange'
  | 'failed'
  | 'fillOrder'
  | 'gambling'
  | 'gaming'
  | 'issueLoan'
  | 'leveragedFarming'
  | 'liquidate'
  | 'lock'
  | 'mev'
  | 'migrateToken'
  | 'mintNFT'
  | 'placeNFTBid'
  | 'placeOrder'
  | 'protocol'
  | 'rebalancePosition'
  | 'receiveFromBridge'
  | 'receiveLoanRepayment'
  | 'receiveNFT'
  | 'receiveNFTAirdrop'
  | 'receiveNFTRoyalty'
  | 'receiveSpamNFT'
  | 'receiveSpamToken'
  | 'receiveToken'
  | 'receiveTokenAirdrop'
  | 'refinanceLoan'
  | 'refund'
  | 'registerDomain'
  | 'removeLiquidity'
  | 'renewDomain'
  | 'repayLoan'
  | 'revokeNFTCollectionApproval'
  | 'revokeTokenApproval'
  | 'sellNFT'
  | 'sendNFT'
  | 'sendNFTAirdrop'
  | 'sendToBridge'
  | 'sendToken'
  | 'sendTokenAirdrop'
  | 'signMultisig'
  | 'stakeNFT'
  | 'stakeToken'
  | 'swap'
  | 'system'
  | 'unclassified'
  | 'unstakeNFT'
  | 'unstakeToken'
  | 'unverifiedContract'
  | 'unwrap'
  | 'vote'
  | 'withdrawCollateral'
  | 'withdrawFromExchange'
  | 'wrap';

/**
 * Foresight Preview Response Classification Data
 * Based on actual API response from /evm/{chain}/preview endpoint
 */
export interface EVMForesightPreviewClassificationData {
    type: EVMTransactionType;
    source: {
        type: string | null;
    };
    description: string;
    protocol: Record<string, any>;
    sent: EVMTranslateTransfer[];
    received: EVMTranslateTransfer[];
}

/**
 * Foresight Preview Response
 * Based on actual API response structure from /evm/{chain}/preview endpoint
 */
export interface EVMForesightPreviewResponse {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: EVMForesightPreviewClassificationData;
    rawTransactionData: EVMForesightPreviewRawTransactionData;
}

/**
 * Raw transaction data specific to Foresight Preview4337 Response
 * Based on actual API response from /evm/{chain}/preview4337 endpoint
 */
export interface EVMForesightPreview4337RawTransactionData {
    fromAddress: string;
    toAddress: string;
    gasUsed: number;
}

/**
 * Classification data specific to Foresight Preview4337 Response
 * Based on actual API response from /evm/{chain}/preview4337 endpoint
 */
export interface EVMForesightPreview4337ClassificationData {
    type: EVMTransactionType;
    source: {
        type: string | null;
    };
    description: string;
    protocol: Record<string, any>;
    sent: EVMTranslateTransfer[];
    received: EVMTranslateTransfer[];
}

/**
 * EVM Foresight Preview4337 Response
 * Based on actual API response structure from /evm/{chain}/preview4337 endpoint
 * This response structure is specific to the preview437 endpoint and differs from 
 * the generic Transaction type by having a simpler rawTransactionData structure
 */
export interface EVMForesightPreview4337Response {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: EVMForesightPreview4337ClassificationData;
    rawTransactionData: EVMForesightPreview4337RawTransactionData;
}

/**
 * Array of EVM chains returned by getChains() method
 */
export type EVMTranslateChains = EVMTranslateChain[];

/**
 * Token information for EVM chains
 */
export interface EVMTranslateToken {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    price?: string | null;
    icon?: string | null;
}

/**
 * NFT information for EVM chains
 */
export interface EVMTranslateNft {
    name: string;
    id: number;
    symbol: string;
    address: string;
}

/**
 * Address information with optional name
 */
export interface EVMTranslateAddress {
    name: string | null;
    address: string | null;
}

/**
 * Transfer information for sent/received arrays and v5 transfers
 */
export interface EVMTranslateTransfer {
    action: string;
    from: EVMTranslateAddress;
    to: EVMTranslateAddress;
    amount: string;
    token: EVMTranslateToken;
}

/**
 * Transaction fee information
 */
export interface EVMTranslateTransactionFee {
    amount: string;
    token: EVMTranslateToken;
}

/**
 * Raw transaction data for EVM transactions
 * Updated to match actual API response structure
 */
export interface EVMTranslateRawTransactionData {
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    blockNumber: number;
    gas: number;
    gasUsed: number;
    gasPrice: number;
    transactionFee: EVMTranslateTransactionFee;
    timestamp: number;
}

/**
 * Protocol information structure
 */
export interface EVMTranslateProtocol {
    name: string | null;
}

/**
 * Source information structure
 */
export interface EVMTranslateSource {
    type: string;
}

/**
 * Approval information for token approval transactions
 */
export interface EVMTranslateApproval {
    spender: string;
    amount: string;
    token: EVMTranslateToken;
}

/**
 * Classification data for EVM transactions (v2 format)
 */
export interface EVMTranslateClassificationDataV2 {
    type: EVMTransactionType;
    source: EVMTranslateSource;
    description: string;
    protocol: EVMTranslateProtocol;
    sent: EVMTranslateTransfer[];
    received: EVMTranslateTransfer[];
    approved?: EVMTranslateApproval;
}

/**
 * Classification data for EVM transactions (v5 format)
 */
export interface EVMTranslateClassificationDataV5 {
    type: EVMTransactionType;
    source: EVMTranslateSource;
    description: string;
    protocol: EVMTranslateProtocol;
    approved?: EVMTranslateApproval;
}

/**
 * Value information for v5 format
 */
export interface EVMTranslateValue {
    // This array is currently empty in API responses but included for completeness
    // Add specific fields when they become available in the API
}

/**
 * EVM Transaction in v2 format with separate sent and received arrays
 */
export interface EVMTranslateTransactionV2 extends PaginatedItem {
    txTypeVersion: 2;
    chain: string;
    accountAddress: string;
    classificationData: EVMTranslateClassificationDataV2;
    rawTransactionData: EVMTranslateRawTransactionData;
}

/**
 * EVM Transaction in v5 format with combined transfers array
 */
export interface EVMTranslateTransactionV5 extends PaginatedItem {
    txTypeVersion: 5;
    chain: string;
    accountAddress: string;
    classificationData: EVMTranslateClassificationDataV5;
    transfers: EVMTranslateTransfer[];
    values: EVMTranslateValue[];
    rawTransactionData: EVMTranslateRawTransactionData;
}

/**
 * Union type for EVM transactions (both v2 and v5 formats)
 */
export type EVMTranslateTransaction = EVMTranslateTransactionV2 | EVMTranslateTransactionV5;

/**
 * Transaction description for single transaction endpoint (/evm/{chain}/describeTx/{txHash})
 * This interface matches the response from the describeTx endpoint
 */
export interface EVMTranslateDescribeTransaction {
    type: EVMTransactionType;
    description: string;
}

/**
 * Transaction descriptions for batch transactions endpoint (/evm/{chain}/describeTxs)
 * This interface matches the response from the describeTxs endpoint which includes the txHash
 */
export interface EVMTranslateDescribeTransactions {
    txHash: string;
    type: EVMTransactionType;
    description: string;
}

/**
 * Balance data for EVM tokens
 */
export interface EVMTranslateBalancesData {
    balance: string;
    usdValue?: string | null;
    token: EVMTranslateToken;
}

/**
 * Balance response type
 */
export type EVMTranslateBalancesResponse = EVMTranslateBalancesData[];

/**
 * EVM Transaction Job for batch processing
 */
export interface EVMTranslateTransactionJob {
    jobId: string;
    nextPageUrl: string;
}

/**
 * EVM Transaction Job Response for batch processing
 * Updated to match actual API response structure
 */
export interface EVMTranslateTransactionJobResponse {
    items: EVMTranslateTransactionV2[] | EVMTranslateTransactionV5[];
    pageSize: number;
    hasNextPage: boolean;
    nextPageUrl: string | null;
}

/**
 * Unsigned transaction for EVM chains
 */
export interface EVMTranslateUnsignedTransaction {
    from: string | null;
    to: string | null;
    data: string | null;
    value: string | null;
    gas: string | null;
    gasPrice: string | null;
    maxFeePerGas: string | null;
    maxPriorityFeePerGas: string | null;
    type: string | null;
}

/**
 * State diff for EVM chains
 */
export interface EVMTranslateStateDiff {
    [key: string]: string;
}

/**
 * State overrides for EVM chains
 */
export interface EVMTranslateStateOverrides {
    [key: string]: {
        stateDiff: EVMTranslateStateDiff;
    };
}

/**
 * User operation for EVM chains (Account Abstraction)
 */
export interface EVMTranslateUserOperation {
    sender: string | null;
    nonce: number;
    initCode: string | null;
    callData: string | null;
    callGasLimit: number;
    verificationGasLimit: number;
    preVerificationGas: number;
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
    paymasterAndData: string | null;
    signature: string | null;
}

/**
 * Raw trace action for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateRawTraceAction {
    from: string;
    callType: string;
    gas: string;
    input: string;
    to: string;
    value: string;
}

/**
 * Raw trace result for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateRawTraceResult {
    gasUsed: string;
    output: string;
}

/**
 * Raw trace entry for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateRawTrace {
    action: EVMTranslateRawTraceAction;
    blockHash: string;
    blockNumber: number;
    result: EVMTranslateRawTraceResult;
    subtraces: number;
    traceAddress: number[];
    transactionHash: string;
    transactionPosition: number;
    type: string;
}

/**
 * Decoded parameter for event logs
 * Based on actual API response structure
 */
export interface EVMTranslateEventLogParam {
    name: string;
    type: string;
    value: string | number;
}

/**
 * Raw event log data for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateRawEventLogData {
    eventSignature: string;
    topics: string[];
    data: string;
}

/**
 * Event log entry for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateEventLog {
    decodedName: string;
    decodedSignature: string;
    logIndex: number;
    address: string;
    params: EVMTranslateEventLogParam[];
    raw: EVMTranslateRawEventLogData;
    error?: string; // Present when ABI decoding fails
}

/**
 * Transaction receipt data for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateTransactionReceipt {
    blockNumber: number;
    blockHash: string;
    status: number;
    effectiveGasPrice: number;
    gasUsed: number;
    cumulativeGasUsed: number;
}

/**
 * Decoded input parameter for transaction functions
 * Based on actual API response structure
 */
export interface EVMTranslateDecodedInputParameter {
    parameter: {
        name: string;
        type: string;
        order: number;
        internalType: string | null;
        serpentSignature: string | null;
        structTypeName: string | null;
        indexed: boolean;
    };
    dataIndexStart: number;
    result: string;
}

/**
 * Decoded input data for EVM transactions
 * Based on actual API response structure
 */
export interface EVMTranslateDecodedInput {
    functionName: string;
    parameters: EVMTranslateDecodedInputParameter[];
}

/**
 * Raw transaction response for EVM chains from /evm/{chain}/raw/tx/{txHash} endpoint
 * Updated to match actual API response structure exactly
 */
export interface EVMTranslateRawTransactionResponse {
    network: string;
    rawTx: {
        transactionHash: string;
        hash: string;
        transactionIndex: number;
        type: number;
        blockHash: string;
        blockNumber: number;
        from: string;
        to: string;
        gas: number;
        gasPrice: number;
        maxFeePerGas?: number;
        maxPriorityFeePerGas?: number;
        value: number;
        input: string;
        nonce: number;
        r: string;
        s: string;
        v: string;
        networkEnum: number;
        timestamp: number;
        gasUsed: number;
        transactionFee: number;
    };
    rawTraces: EVMTranslateRawTrace[];
    eventLogs: EVMTranslateEventLog[];
    internalTxs: any[]; // Array appears to be empty in actual responses
    txReceipt: EVMTranslateTransactionReceipt;
    decodedInput: EVMTranslateDecodedInput;
}

/**
 * Transaction type definition for EVM chains
 * Based on actual API response from /evm/txTypes endpoint
 */
export interface EVMTranslateTransactionTypes {
    type: string;
    description: string;
}

/**
 * Response structure for getTxTypes method
 * Based on actual API response from /evm/txTypes endpoint
 */
export interface EVMTranslateTransactionTypesResponse {
    version: number;
    transactionTypes: EVMTranslateTransactionTypes[];
}

/**
 * History data for EVM chains
 */
export interface EVMTranslateHistoryData {
    transactionHash: string;
    blockNumber: string;
    timestamp: number;
}

/**
 * Token holder information
 */
export interface EVMTranslateTokenHolder extends PaginatedItem {
    address: string;
    balance: string;
    share: number;
}

/**
 * Token transfer information
 */
export interface EVMTranslateTokenTransfer {
    token: EVMTranslateToken;
    from: string;
    to: string;
    value: string;
    transactionHash: string;
    blockNumber: number;
    blockTimestamp: number;
}

/**
 * Transaction count response
 */
export interface EVMTranslateTransactionCountResponse {
    chain: string;
    timestamp: number;
    account: {
        address: string;
        transactionCount: number;
    };
}

/**
 * Transaction status
 */
export interface EVMTranslateTransactionStatus {
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: number;
}

/**
 * Delete transaction job response
 */
export interface EVMTranslateDeleteTransactionJobResponse {
    message: string;
}

/**
 * EVM Foresight Chain information as returned by /evm/chains endpoint
 * This interface exactly matches the actual API response structure
 */
export interface EVMForesightChain {
    name: string;
    ecosystem: "evm";
    nativeCoin: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
    };
}

/**
 * Array of EVM foresight chains returned by getChains() method
 */
export type EVMForesightChains = EVMForesightChain[];

/**
 * EVM Foresight describe response returned by /evm/{chain}/describe endpoint
 * This interface exactly matches the actual API response structure
 */
export interface EVMForesightDescribeResponse {
    description: string;
}

/**
 * EVM Foresight describe4337 response returned by /evm/{chain}/describe4337 endpoint
 * This interface exactly matches the actual API response structure
 */
export interface EVMForesightDescribe4337Response {
    description: string;
    type: string;
}

/**
 * EVM Pricing Chain information as returned by /evm/chains endpoint
 * This interface exactly matches the actual API response structure
 */
export interface EVMPricingChain {
    name: string;
    ecosystem: "evm";
    nativeCoin: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
    };
}

/**
 * Array of EVM pricing chains returned by getChains() method
 */
export type EVMPricingChains = EVMPricingChain[];

/**
 * Token information in EVM pricing response
 */
export interface EVMPricingToken {
    address: string;
    symbol: string;
    name: string;
}

/**
 * Price information in EVM pricing response
 */
export interface EVMPricingPrice {
    amount: string;
    currency: string;
    status: string;
}

/**
 * Base token information in pricing source
 */
export interface EVMPricingBaseToken {
    address: string;
    symbol: string;
    name: string;
}

/**
 * Exchange information in pricing source
 */
export interface EVMPricingExchange {
    name: string;
}

/**
 * Pricing source information (pricedBy field)
 */
export interface EVMPricingSource {
    poolAddress: string;
    exchange: EVMPricingExchange;
    liquidity: number;
    baseToken: EVMPricingBaseToken;
}

/**
 * Main EVM pricing response interface based on actual API response
 * This exactly matches the structure returned by GET /evm/{chain}/price/{tokenAddress}
 */
export interface EVMPricingResponse {
    chain: string;
    block: string;
    token: EVMPricingToken;
    price: EVMPricingPrice;
    pricedBy: EVMPricingSource;
    priceType: string;
    priceStatus: string;
}

/**
 * Pool-specific pricing response for the priceFromPool endpoint
 */
export interface EVMPricingPoolResponse {
    chain: string;
    exchange: EVMPricingExchange;
    poolAddress: string;
    baseToken: {
        address: string;
        symbol: string;
        name: string;
        decimals: number;
    };
    quoteToken: {
        address: string;
        symbol: string;
        name: string;
        decimals: number;
    };
    price: {
        amount: string;
    };
}

/**
 * Request interface for token prefetch
 * Based on actual API request structure
 */
export interface EVMPricingTokenPrefetchRequest {
    tokenAddress: string;
    chain: string;
    priceType: string;
    timestamp?: number;
    blockNumber?: number;
}

/**
 * Token information in prefetch result
 * Based on actual API response structure
 */
export interface EVMPricingTokenInfo {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
}

/**
 * Individual result data for each token in prefetch response
 * Based on actual API response structure
 */
export interface EVMPricingTokenPrefetchResultData {
    blockNumber: number;
    priceStatus: string;
    token: EVMPricingTokenInfo;
    price: string;
    priceType: string;
    pricedBy: any | null;
}

/**
 * Individual token result in prefetch response
 * Based on actual API response structure - matches the actual response from /evm/preFetch
 */
export interface EVMPricingTokenPrefetchResult {
    request: {
        tokenAddress: string;
        chain: string;
        priceType: string;
        timestamp: number | null;
        blockNumber: number | null;
    };
    result: EVMPricingTokenPrefetchResultData | null;
    error: string | null;
}

/**
 * Complete prefetch response structure
 * Based on actual API response structure
 */
export interface EVMPricingPreFetchResponse {
    tokens: EVMPricingTokenPrefetchResult[];
}

/**
 * Risk information detected during screening
 */
export interface EVMForesightRisk {
    type: string;
}

/**
 * Address analysis result from screen endpoint
 */
export interface EVMForesightAddressAnalysis {
    address: string;
    isContract: boolean;
    isVerified: boolean;
    isToken: boolean;
    risksDetected: EVMForesightRisk[];
}

/**
 * Token analysis result from screen endpoint
 */
export interface EVMForesightTokenAnalysis {
    address: string;
    symbol: string;
    name: string;
    isVerified: boolean;
    risksDetected: EVMForesightRisk[];
}

/**
 * Screen Response from /evm/{chain}/screen endpoint
 * Based on actual API response structure
 */
export interface EVMForesightScreenResponse {
    simulation: EVMForesightPreviewResponse;
    toAddress: EVMForesightAddressAnalysis;
    tokens: EVMForesightTokenAnalysis[];
}

/**
 * Screen4337 Response from /evm/{chain}/screen4337 endpoint
 * Based on actual API response structure
 * This differs from EVMForesightScreenResponse by using EVMForesightPreview4337Response
 * for the simulation field, which has a simpler rawTransactionData structure
 */
export interface EVMForesightScreen4337Response {
    simulation: EVMForesightPreview4337Response;
    toAddress: EVMForesightAddressAnalysis;
    tokens: EVMForesightTokenAnalysis[];
} 