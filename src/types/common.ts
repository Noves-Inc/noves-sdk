/**
 * Common types shared across all ecosystems
 */

import { ErrorType } from '../errors/ErrorTypes';

export interface ApiResponse {
    succeeded: boolean;
    response: any;
    httpStatusCode?: number;
    errorType?: string;
}

/**
 * Comprehensive configuration interface for the retry mechanism.
 * Provides fine-grained control over retry behavior across all SDK modules.
 */
export interface RetryConfig {
    /** Enable or disable the retry mechanism. Default: false (for backward compatibility) */
    enabled: boolean;
    
    /** Maximum number of attempts including the initial request. Default: 3 */
    maxAttempts: number;
    
    /** Base delay in milliseconds before the first retry. Default: 1000ms */
    baseDelay: number;
    
    /** Maximum delay in milliseconds between retries. Default: 30000ms (30 seconds) */
    maxDelay: number;
    
    /** Exponential backoff multiplier. Default: 2 */
    exponentialBase: number;
    
    /** Whether to add jitter to delay calculations. Default: true */
    jitter: boolean;
    
    /** Jitter factor as a percentage of the calculated delay. Default: 0.1 (10%) */
    jitterFactor: number;
    
    /** Array of error types that should trigger a retry */
    retryableErrors: ErrorType[];
    
    /** Array of HTTP status codes that should trigger a retry */
    retryableStatusCodes: number[];
    
    /** Whether to respect Retry-After headers from the server. Default: true */
    respectRetryAfter: boolean;
    
    /** Number of consecutive failures before opening the circuit breaker. Default: 5 */
    circuitBreakerThreshold: number;
    
    /** Time in milliseconds before attempting to close the circuit breaker. Default: 60000ms (1 minute) */
    circuitBreakerResetTime: number;
    
    /** Callback function called before each retry attempt */
    onRetry?: (attempt: number, error: any, delay: number) => void;
    
    /** Callback function called when a request succeeds after retries */
    onSuccess?: (attempt: number) => void;
    
    /** Callback function called when all retry attempts are exhausted */
    onFailure?: (attempts: number, finalError: any) => void;
}

/**
 * Context information for tracking retry attempts and circuit breaker state.
 * Used internally by the retry engine to maintain state across operations.
 */
export interface RetryContext {
    /** Unique identifier for this operation type (e.g., "translate-evm", "pricing-svm") */
    operationId: string;
    
    /** Timestamp when the operation started */
    startTime: number;
    
    /** Number of consecutive failures for this operation type */
    failures: number;
    
    /** Timestamp of the last failure for this operation type */
    lastFailureTime: number;
    
    /** Whether the circuit breaker is currently open for this operation */
    circuitOpen: boolean;
}

/**
 * Interface for the core retry engine that handles retry logic.
 */
export interface RetryEngine {
    /**
     * Execute a request function with retry logic applied.
     * @param requestFn Function that makes the actual request
     * @param config Retry configuration to use
     * @param context Retry context for tracking state
     * @returns Promise that resolves with the request result
     */
    executeWithRetry<T>(
        requestFn: () => Promise<T>,
        config: RetryConfig,
        context: RetryContext
    ): Promise<T>;
    
    /**
     * Calculate the delay before the next retry attempt.
     * @param attempt Current attempt number (1-based)
     * @param config Retry configuration
     * @param retryAfter Optional Retry-After header value in seconds
     * @returns Delay in milliseconds
     */
    calculateDelay(attempt: number, config: RetryConfig, retryAfter?: number): number;
    
    /**
     * Determine if an error should trigger a retry.
     * @param error The error that occurred
     * @param attempt Current attempt number (1-based)
     * @param config Retry configuration
     * @returns True if the error should be retried
     */
    shouldRetry(error: any, attempt: number, config: RetryConfig): boolean;
    
    /**
     * Check if the circuit breaker is open for the given context.
     * @param context Retry context
     * @returns True if the circuit breaker is open
     */
    isCircuitOpen(context: RetryContext): boolean;
    
    /**
     * Record a failure for circuit breaker tracking.
     * @param context Retry context to update
     */
    recordFailure(context: RetryContext): void;
    
    /**
     * Record a success for circuit breaker tracking.
     * @param context Retry context to update
     */
    recordSuccess(context: RetryContext): void;
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

    /**
     * Marker token for XRPL pagination. (Internal use - set by API responses)
     * This parameter is used by XRPL chains for pagination.
     */
    marker?: string;
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

/**
 * Enhanced factory options for SDK initialization
 */
export interface SDKOptions {
  apiKey: string;
  retryConfig?: RetryConfig | string;
  environment?: 'production' | 'development' | 'testing';
} 