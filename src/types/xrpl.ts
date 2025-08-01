import { PaginatedItem } from '../translate/transactionsPage';

/**
 * XRPL-specific types for the Noves SDK
 * Based on actual API responses from XRPL endpoints
 */

/**
 * XRPL Chain information as returned by /xrpl/chains endpoint
 * This interface exactly matches the actual API response structure
 */
export interface XRPLTranslateChain {
    name: string;
    tier: number;
    nativeCoin: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
    };
}

/**
 * Array of XRPL chains returned by getChains() method
 */
export type XRPLTranslateChains = XRPLTranslateChain[];

/**
 * XRPL token information with issuer field specific to XRPL
 */
export interface XRPLTranslateToken {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    issuer: string | null;
}

/**
 * XRPL address information with optional name
 */
export interface XRPLTranslateAddress {
    name: string | null;
    address: string | null;
}

/**
 * XRPL transfer information for transfers array
 */
export interface XRPLTranslateTransfer {
    action: string;
    amount: string;
    from: XRPLTranslateAddress;
    to: XRPLTranslateAddress;
    token: XRPLTranslateToken;
}

/**
 * Protocol information structure for XRPL
 */
export interface XRPLTranslateProtocol {
    name: string | null;
}

/**
 * Source information structure for XRPL
 */
export interface XRPLTranslateSource {
    type: string;
}

/**
 * Classification data for XRPL transactions
 */
export interface XRPLTranslateClassificationData {
    type: string;
    description: string;
    protocol: XRPLTranslateProtocol;
    source: XRPLTranslateSource;
}

/**
 * Raw transaction data for XRPL transactions
 * Based on actual API response structure
 */
export interface XRPLTranslateRawTransactionData {
    signature: string;
    account: string;
    type: string;
    fee: string;
    sequence: number;
    destination?: string;
    result: string;
    ledger_index: number;
    validated?: boolean;
}

/**
 * XRPL Transaction structure (uses txTypeVersion 6)
 */
export interface XRPLTranslateTransaction extends PaginatedItem {
    txTypeVersion: 6;
    chain: string;
    accountAddress: string;
    classificationData: XRPLTranslateClassificationData;
    transfers: XRPLTranslateTransfer[];
    values: Record<string, any>;
    rawTransactionData: XRPLTranslateRawTransactionData;
    timestamp: number;
}

/**
 * XRPL transactions response with pagination settings
 */
export interface XRPLTranslateTransactionsResponse {
    items: XRPLTranslateTransaction[];
    nextPageSettings: {
        marker: string;
        pageSize: number;
        nextPageUrl: string;
    };
}

/**
 * XRPL balance information for a single token
 */
export interface XRPLTranslateBalance {
    balance: string;
    token: XRPLTranslateToken;
}

/**
 * XRPL balances response structure
 */
export interface XRPLTranslateBalancesResponse {
    accountAddress: string;
    timestamp: number;
    balances: XRPLTranslateBalance[];
}

/**
 * XRPL transaction type union based on actual XRPL transaction types
 * Comprehensive list covering all supported transaction classifications
 */
export type XRPLTransactionType = 
    | 'activateAccount'
    | 'addLiquidity'
    | 'burnNFT'
    | 'buyNFT'
    | 'cancelNFTListing'
    | 'cancelOrder'
    | 'closeAccount'
    | 'createNFTListing'
    | 'createOrder'
    | 'error'
    | 'failed'
    | 'mintNFT'
    | 'placeNFTBid'
    | 'receiveToken'
    | 'removeLiquidity'
    | 'sellNFT'
    | 'sendToken'
    | 'setRegularKey'
    | 'swap'
    | 'unclassified'
    | 'updateAccount'
    | 'vote';   