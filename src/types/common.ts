/**
 * Common types shared across all ecosystems
 */

export interface ApiResponse {
    succeeded: boolean;
    response: any;
}

/**
 * Represents the available options for a page of transactions.
 * 
 * All ecosystems use nextPageUrl-based pagination that is handled automatically by the SDK.
 * When you call getTransactions() or similar methods, the SDK will return a TransactionsPage
 * object that you can use to iterate through pages using the next() method.
 * 
 * These options are for filtering and configuring the initial request only.
 * Pagination between pages is handled internally via nextPageUrl parsing.
 * 
 * @interface PageOptions
 */
export interface PageOptions {
    /**
     * The starting block number to filter by. (Optional)
     */
    startBlock?: number;

    /**
     * The ending block number to filter by. (Optional)
     */
    endBlock?: number;

    /**
     * The starting timestamp for the transaction page in milliseconds. (Optional)
     */
    startTimestamp?: number;

    /**
     * The ending timestamp for the transaction page in milliseconds. (Optional)
     */
    endTimestamp?: number;

    /**
     * The sort order for the transaction page. Valid options are 'desc' (descending) or 'asc' (ascending). (Optional)
     */
    sort?: 'desc' | 'asc';

    /**
     * The account address to view transactions from. (Optional)
     */
    viewAsAccountAddress?: string;

    /**
     * The number of transactions to retrieve per page. Defaults to 10. (Optional)
     * Maximum page sizes vary by ecosystem: EVM (50), SVM/UTXO (100).
     */
    pageSize?: number;

    /**
     * Whether to retrieve live data or paginate through historical data. Defaults to false. (Optional)
     * Only applicable for EVM chains.
     */
    liveData?: boolean;

    /**
     * Whether to view transactions as the sender. (Optional)
     * Only applicable for EVM chains.
     */
    viewAsTransactionSender?: boolean;

    /**
     * Whether to use v5 format for transaction responses. (Optional)
     * Only applicable for EVM chains. Defaults to false (v2 format).
     */
    v5Format?: boolean;

    /**
     * The number of epochs to retrieve staking transactions for. (Optional)
     * Only applicable for SVM staking transactions.
     */
    numberOfEpochs?: number;

    /**
     * Whether to include token prices in the response. (Optional)
     */
    includePrices?: boolean;

    /**
     * Whether to exclude tokens with zero prices. (Optional)
     */
    excludeZeroPrices?: boolean;
}

/**
 * Risk detection information for URL screening
 */
export interface UrlRisk {
    /**
     * The type of risk detected (e.g., "blacklisted")
     */
    type: string;
}

/**
 * Response from the URL screening endpoint
 */
export interface ForesightUrlScreenResponse {
    /**
     * The domain that was screened
     */
    domain: string;
    
    /**
     * Array of risks detected for this URL
     */
    risksDetected: UrlRisk[];
} 