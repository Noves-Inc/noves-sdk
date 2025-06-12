// src/translate/TransactionsPage.ts

import { Pagination } from './pagination';
import { PageOptions, EnhancedCursorData } from '../types/common';

/**
 * Base interface for paginated items
 */
export interface PaginatedItem {
    // Empty interface to allow any type of item
}

/**
 * Pagination object for transactions and other paginated data.
 * 
 * @class
 */
export class TransactionsPage<T extends PaginatedItem> extends Pagination<T> {
    private currentIndex: number = 0;
    protected blockNumber?: number;
    protected tokenAddress?: string;

    constructor(translate: any, initialData: { 
        chain: string; 
        transactions: T[]; 
        currentPageKeys: PageOptions; 
        nextPageKeys: PageOptions | null;
        walletAddress?: string;
        blockNumber?: number;
        tokenAddress?: string;
        navigationHistory?: PageOptions[]; // Support for enhanced cursor navigation history
    }) {
        super(translate, initialData);
        this.blockNumber = initialData.blockNumber;
        this.tokenAddress = initialData.tokenAddress;
        
        // If navigation history is provided (from enhanced cursor), restore it
        if (initialData.navigationHistory && initialData.navigationHistory.length > 0) {
            this.pageKeys = [...initialData.navigationHistory];
        }
    }

    /**
     * Get the next page keys.
     * @returns {PageOptions | null} The next page keys or null if there is no next page.
     */
    public getNextPageKeys(): PageOptions | null {
        return this.nextPageKeys;
    }

    /**
     * Fetch the next page of transactions and update internal state.
     * @returns {Promise<boolean>} A promise that resolves to true if the next page was fetched successfully, false otherwise.
     */
    public async next(): Promise<boolean> {
        if (!this.nextPageKeys) {
            return false;
        }

        try {
            let response;
            if (this.walletAddress) {
                response = await this.translate.getTransactions(this.chain, this.walletAddress, this.nextPageKeys);
            } else if (this.blockNumber !== undefined) {
                response = await (this.translate as any).getBlockTransactions(this.chain, this.blockNumber, this.nextPageKeys);
            } else if (this.tokenAddress) {
                response = await (this.translate as any).getTokenHolders(this.chain, this.tokenAddress, this.nextPageKeys);
            } else {
                return false;
            }

            if (!response || !response.getTransactions) {
                return false;
            }

            const transactions = response.getTransactions();
            if (!Array.isArray(transactions)) {
                return false;
            }

            this.transactions = transactions as T[];
            this.previousPageKeys = this.currentPageKeys;
            this.currentPageKeys = this.nextPageKeys;
            this.nextPageKeys = response.getNextPageKeys();
            this.pageKeys.push(this.currentPageKeys);
            this.currentIndex = 0;

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Implements the async iterator protocol.
     * @returns {AsyncIterator<T>} An async iterator for the transactions.
     */
    public async *[Symbol.asyncIterator](): AsyncIterator<T> {
        while (true) {
            // Yield current transaction if available
            if (this.currentIndex < this.transactions.length) {
                yield this.transactions[this.currentIndex++];
                continue;
            }

            // Try to fetch next page if available
            if (this.nextPageKeys) {
                const hasNext = await this.next();
                if (!hasNext) {
                    break;
                }
                continue;
            }

            // No more transactions
            break;
        }
    }

    /**
     * Create a TransactionsPage from a cursor string with enhanced navigation support.
     * This is useful for cursor-based pagination where the cursor is passed between API calls.
     * Enhanced cursors will preserve navigation history for proper backward navigation.
     * @param {any} translate - The translate instance (EVM, SVM, COSMOS, etc.)
     * @param {string} chain - The chain name
     * @param {string} address - The wallet address
     * @param {string} cursor - The Base64 encoded cursor string (regular or enhanced)
     * @returns {Promise<TransactionsPage<T>>} A new TransactionsPage instance for the cursor position
     */
    public static async fromCursor<T extends PaginatedItem>(
        translate: any,
        chain: string,
        address: string,
        cursor: string
    ): Promise<TransactionsPage<T>> {
        const decodedCursor = TransactionsPage.decodeCursor(cursor);
        
        // Check if this is an enhanced cursor
        if (Pagination.isEnhancedCursor(decodedCursor)) {
            return await TransactionsPage.fromEnhancedCursor<T>(translate, chain, address, decodedCursor);
        } else {
            // Legacy cursor handling - extract PageOptions and create page normally
            const pageOptions = decodedCursor as PageOptions;
            return await translate.getTransactions(chain, address, pageOptions);
        }
    }

    /**
     * Create a TransactionsPage from an enhanced cursor with full navigation context.
     * @param {any} translate - The translate instance
     * @param {string} chain - The chain name
     * @param {string} address - The wallet address
     * @param {EnhancedCursorData} enhancedCursor - The decoded enhanced cursor data
     * @returns {Promise<TransactionsPage<T>>} A new TransactionsPage instance with navigation context
     */
    private static async fromEnhancedCursor<T extends PaginatedItem>(
        translate: any,
        chain: string,
        address: string,
        enhancedCursor: EnhancedCursorData
    ): Promise<TransactionsPage<T>> {
        // Extract PageOptions (remove _cursorMeta for API call)
        const { _cursorMeta, ...pageOptions } = enhancedCursor;
        
        // Fetch the page data using the page options
        const response = await translate.getTransactions(chain, address, pageOptions);
        
        // Get the base page data
        const transactions = response.getTransactions();
        const nextPageKeys = response.getNextPageKeys();
        
        // Create a new TransactionsPage with enhanced navigation context
        const enhancedPage = new TransactionsPage<T>(translate, {
            chain,
            walletAddress: address,
            transactions,
            currentPageKeys: pageOptions,
            nextPageKeys,
            navigationHistory: _cursorMeta ? _cursorMeta.navigationHistory : [pageOptions]
        });
        
        // Phase 3: Properly restore navigation state from cursor metadata
        if (_cursorMeta) {
            // Override the next page keys if the cursor metadata has more accurate information
            if (_cursorMeta.nextPageOptions) {
                enhancedPage.nextPageKeys = _cursorMeta.nextPageOptions;
            }
            
            // Restore the previous page keys for proper backward navigation
            const currentIndex = _cursorMeta.currentPageIndex;
            if (currentIndex > 0 && _cursorMeta.navigationHistory.length > currentIndex) {
                enhancedPage.previousPageKeys = _cursorMeta.navigationHistory[currentIndex - 1];
            }
            
            // Ensure the pageKeys array reflects the full navigation history
            // This is crucial for proper hasPrevious() and getPreviousCursor() functionality
            enhancedPage.pageKeys = [..._cursorMeta.navigationHistory];
            
            // This ensures that hasPrevious() can find the current page in the pageKeys array via JSON comparison
            const currentPageWithApiParams = response.getCurrentPageKeys ? response.getCurrentPageKeys() : pageOptions;
            enhancedPage.currentPageKeys = currentPageWithApiParams;
            
            // Update the navigation history to reflect the actual API response parameters
            if (currentIndex < enhancedPage.pageKeys.length) {
                enhancedPage.pageKeys[currentIndex] = currentPageWithApiParams;
            }
        }
        
        return enhancedPage;
    }

    /**
     * Decode a cursor string back to PageOptions or EnhancedCursorData.
     * @param {string} cursor - The Base64 encoded cursor string.
     * @returns {PageOptions | EnhancedCursorData} The decoded cursor data.
     */
    public static decodeCursor(cursor: string): PageOptions | EnhancedCursorData {
        try {
            const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
            return decoded;
        } catch (error) {
            throw new Error('Invalid cursor format');
        }
    }
}