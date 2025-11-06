/**
 * Move ecosystem specific types for the Noves SDK
 */

// ===== MOVE PRICING TYPES =====

/**
 * Native coin information for Move chains (pricing API)
 */
export interface MOVEPricingNativeCoin {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}

/**
 * Move chain information as returned by the /move/chains endpoint
 */
export interface MOVEPricingChain {
    name: string;
    ecosystem: string;
    nativeCoin: MOVEPricingNativeCoin;
}

/**
 * Exchange information for Move pool pricing
 */
export interface MOVEPricingExchange {
    name: string;
}

/**
 * Token information for Move pool pricing
 */
export interface MOVEPricingToken {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
}

/**
 * Price information for Move pool pricing
 */
export interface MOVEPricingPrice {
    amount: string;
}

/**
 * Pool pricing response structure for Move chains
 * Based on actual API response structure from the Move Pricing API
 */
export interface MOVEPricingPoolResponse {
    chain: string;
    exchange: MOVEPricingExchange;
    poolAddress: string;
    baseToken: MOVEPricingToken;
    quoteToken: MOVEPricingToken;
    price: MOVEPricingPrice;
}

// ===== MOVE TRANSLATE TYPES =====

/**
 * Native coin information for Move chains (translate API)
 */
export interface MOVETranslateNativeCoin {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}

/**
 * Move chain information as returned by the /move/chains endpoint
 */
export interface MOVETranslateChain {
    name: string;
    ecosystem: string;
    nativeCoin: MOVETranslateNativeCoin;
    tier: number;
}

/**
 * Array of Move chains
 */
export type MOVETranslateChains = MOVETranslateChain[];

/**
 * Transaction type information
 */
export interface MOVETranslateTransactionType {
    type: string;
    description: string;
}

/**
 * Transaction types response structure
 */
export interface MOVETranslateTransactionTypesResponse {
    version: number;
    transactionTypes: MOVETranslateTransactionType[];
}

/**
 * Protocol information in classification data
 */
export interface MOVETranslateProtocol {
    name: string | null;
}

/**
 * Source information in classification data
 */
export interface MOVETranslateSource {
    type: string;
}

/**
 * Classification data for Move transactions
 */
export interface MOVETranslateClassificationData {
    type: string;
    description: string;
    protocol: MOVETranslateProtocol;
    source: MOVETranslateSource;
}

/**
 * Token information in transfers
 */
export interface MOVETranslateToken {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    icon: string | null;
    issuer: string | null;
}

/**
 * Address information in transfers
 */
export interface MOVETranslateAddress {
    address: string;
    name: string | null;
}

/**
 * Transfer information in Move transactions
 */
export interface MOVETranslateTransfer {
    action: string;
    amount: string;
    token: MOVETranslateToken;
    nft: any | null;
    from: MOVETranslateAddress;
    to: MOVETranslateAddress | null;
}

/**
 * Values information in Move transactions (for successful transactions)
 */
export interface MOVETranslateValues {
    commandTypes?: string[];
    failed?: boolean;
    failureReason?: string;
    gasUsed?: string;
    timestamp?: string;
    checkpoint?: string;
}

/**
 * Raw transaction data for Move transactions
 */
export interface MOVETranslateRawTransactionData {
    digest: string;
    signer: string;
    checkpoint: string;
    gasUsed: string;
}

/**
 * Complete Move transaction structure
 */
export interface MOVETranslateTransaction {
    txTypeVersion: number;
    chain: string;
    timestamp: number;
    classificationData: MOVETranslateClassificationData;
    transfers: MOVETranslateTransfer[];
    values: MOVETranslateValues[];
    rawTransactionData: MOVETranslateRawTransactionData;
}

/**
 * Paginated transactions response structure
 */
export interface MOVETranslateTransactionsResponse {
    items: MOVETranslateTransaction[];
    page: number;
    pageSize: number;
    nextPageUrl: string | null;
}