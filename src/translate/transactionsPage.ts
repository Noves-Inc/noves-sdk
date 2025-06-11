// src/translate/TransactionsPage.ts

import { Pagination } from './pagination';
import { PageOptions } from '../types/common';

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
    }) {
        super(translate, initialData);
        this.blockNumber = initialData.blockNumber;
        this.tokenAddress = initialData.tokenAddress;
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
     * Create a TransactionsPage from a cursor string.
     * This is useful for cursor-based pagination where the cursor is passed between API calls.
     * @param {any} translate - The translate instance (EVM, SVM, COSMOS, etc.)
     * @param {string} chain - The chain name
     * @param {string} address - The wallet address
     * @param {string} cursor - The Base64 encoded cursor string
     * @returns {Promise<TransactionsPage<T>>} A new TransactionsPage instance for the cursor position
     */
    public static async fromCursor<T extends PaginatedItem>(
        translate: any,
        chain: string,
        address: string,
        cursor: string
    ): Promise<TransactionsPage<T>> {
        const pageOptions = TransactionsPage.decodeCursor(cursor);
        return await translate.getTransactions(chain, address, pageOptions);
    }

    /**
     * Decode a cursor string back to PageOptions.
     * @param {string} cursor - The Base64 encoded cursor string.
     * @returns {PageOptions} The decoded page options.
     */
    public static decodeCursor(cursor: string): PageOptions {
        try {
            return JSON.parse(Buffer.from(cursor, 'base64').toString());
        } catch (error) {
            throw new Error('Invalid cursor format');
        }
    }
}