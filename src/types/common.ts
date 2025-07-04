/**
 * Common types shared across all ecosystems
 */

export interface ApiResponse {
    succeeded: boolean;
    response: any;
}

/**
 * Navigation metadata embedded within enhanced cursors for stateless pagination.
 * This allows cursors to be self-contained with full navigation context.
 */
export interface CursorNavigationMeta {
    /**
     * Current page index in the navigation sequence (0-based)
     */
    currentPageIndex: number;
    
    /**
     * Complete navigation history - array of PageOptions for each page visited
     * Index 0 = first page, Index 1 = second page, etc.
     */
    navigationHistory: PageOptions[];
    
    /**
     * Whether backward navigation is possible from this cursor
     */
    canGoBack: boolean;
    
    /**
     * Whether forward navigation is possible from this cursor
     */
    canGoForward: boolean;
    
    /**
     * PageOptions for the previous page (null if on first page)
     */
    previousPageOptions: PageOptions | null;
    
    /**
     * PageOptions for the next page (null if no next page)
     */
    nextPageOptions: PageOptions | null;

    /**
     * Original page index before navigation history truncation.
     * Used for proper navigation when history is limited.
     */
    originalPageIndex?: number;

    /**
     * Start index of the navigation history slice.
     * Used to reconstruct full context when needed.
     */
    historyStartIndex?: number;
}

/**
 * Enhanced cursor data that includes navigation metadata.
 * This extends PageOptions with navigation context for stateless pagination.
 */
export interface EnhancedCursorData extends PageOptions {
    /**
     * Navigation metadata for cursor-based pagination.
     * When present, enables full backward/forward navigation from cursors.
     */
    _cursorMeta?: CursorNavigationMeta;
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

    /**
     * Transaction cursor token for pagination. (Internal use - set by API responses)
     * This parameter is used by the API to exclude already-seen transactions.
     */
    ignoreTransactions?: string;

    /**
     * Page key for TVM pagination cursor. (Internal use - set by API responses)
     * This parameter is used by TVM chains for pagination.
     */
    pageKey?: string;

    /**
     * Page number for offset-based pagination. (Internal use - set by API responses)
     * This parameter is used for job-based pagination in UTXO.
     */
    pageNumber?: number;

    /**
     * Sort order for job-based pagination. (Internal use - set by API responses)
     * This parameter is used for job-based pagination in UTXO.
     */
    ascending?: boolean;

    /**
     * Maximum number of pages to keep in navigation history for cursor-based pagination.
     * This limits backward navigation but prevents cursor growth and 413 errors.
     * Defaults to 10 if not specified. Set to a higher value if you need deeper backward navigation.
     * @default 10
     */
    maxNavigationHistory?: number;
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