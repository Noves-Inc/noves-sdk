/**
 * TVM (Tron Virtual Machine) specific types for the Noves SDK
 */

/**
 * Native coin/token information for TVM chains
 */
export interface TVMTranslateNativeCoin {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}

/**
 * TVM chain information as returned by the /tvm/chains endpoint
 */
export interface TVMTranslateChain {
    name: string;
    ecosystem: string;
    nativeCoin: TVMTranslateNativeCoin;
    tier: number;
}

/**
 * Token information for TVM transactions
 */
export interface TVMTranslateToken {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
}

/**
 * Address information for TVM transactions
 */
export interface TVMTranslateAddress {
    name: string | null;
    address: string | null;
}

/**
 * Transfer information for TVM transactions
 */
export interface TVMTranslateTransfer {
    action: string;
    from: TVMTranslateAddress;
    to: TVMTranslateAddress;
    amount: string;
    token: TVMTranslateToken;
}

/**
 * Classification protocol information for TVM transactions
 */
export interface TVMTranslateProtocol {
    name: string | null;
}

/**
 * Classification source information for TVM transactions
 */
export interface TVMTranslateSource {
    type: string;
}

/**
 * Transaction fee information for TVM transactions
 */
export interface TVMTranslateTransactionFee {
    amount: string;
    token: TVMTranslateToken;
}

/**
 * Raw transaction data for TVM transactions
 */
export interface TVMTranslateRawTransactionData {
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    blockNumber: number;
    gas: number;
    gasUsed: number;
    gasPrice: number;
    transactionFee: TVMTranslateTransactionFee;
    timestamp: number;
}

/**
 * Classification data for TVM transactions (v2 format)
 */
export interface TVMTranslateClassificationDataV2 {
    type: string;
    source: TVMTranslateSource;
    description: string;
    protocol: TVMTranslateProtocol;
    sent: TVMTranslateTransfer[];
    received: TVMTranslateTransfer[];
}

/**
 * Classification data for TVM transactions (v5 format)
 */
export interface TVMTranslateClassificationDataV5 {
    type: string;
    source: TVMTranslateSource;
    description: string;
    protocol: TVMTranslateProtocol;
}

/**
 * TVM transaction structure (v2 format - legacy)
 */
export interface TVMTranslateTransactionV2 {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: TVMTranslateClassificationDataV2;
    rawTransactionData: TVMTranslateRawTransactionData;
}

/**
 * TVM transaction structure (v5 format - current)
 */
export interface TVMTranslateTransactionV5 {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    timestamp: number;
    classificationData: TVMTranslateClassificationDataV5;
    transfers: TVMTranslateTransfer[];
    values: any[]; // Array of values, structure may vary
    rawTransactionData: TVMTranslateRawTransactionData;
}

/**
 * Union type for both transaction formats
 */
export type TVMTranslateTransactionResponse = TVMTranslateTransactionV2 | TVMTranslateTransactionV5;

/**
 * TVM transactions response structure for paginated results
 */
export interface TVMTranslateTransactionsResponse {
    items: TVMTranslateTransactionV2[];
    pageSize: number;
    hasNextPage: boolean;
    nextPageUrl?: string;
}

/**
 * Response from starting a TVM balance job
 * Returned by POST /tvm/{chain}/balances/job/start
 */
export interface TVMTranslateStartBalanceJobResponse {
    jobId: string;
    resultUrl: string;
}

/**
 * Token information in balance job results
 */
export interface TVMTranslateBalanceToken {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
}

/**
 * TVM balance job result
 * Returned by GET /tvm/{chain}/balances/job/{jobId}
 */
export interface TVMTranslateBalanceJobResult {
    chain: string;
    accountAddress: string;
    token: TVMTranslateBalanceToken;
    amount: string;
    blockNumber: number;
}

/**
 * Parameters for starting a TVM balance job
 */
export interface TVMTranslateStartBalanceJobParams {
    chain: string;
    tokenAddress: string;
    accountAddress: string;
    blockNumber: number;
}

// Legacy aliases for backward compatibility
export type TVMNativeCoin = TVMTranslateNativeCoin;
export type TVMToken = TVMTranslateToken;
export type TVMAddress = TVMTranslateAddress;
export type TVMTransfer = TVMTranslateTransfer;
export type TVMProtocol = TVMTranslateProtocol;
export type TVMSource = TVMTranslateSource;
export type TVMTransactionFee = TVMTranslateTransactionFee;
export type TVMRawTransactionData = TVMTranslateRawTransactionData;
export type TVMClassificationData = TVMTranslateClassificationDataV2;
export type TVMTransaction = TVMTranslateTransactionV2;

// Additional backward compatibility aliases
export type TVMTranslateTransaction = TVMTranslateTransactionV2;
export type TVMTranslateClassificationData = TVMTranslateClassificationDataV2; 