// src/translate/paging.ts

import { PageOptions } from '../types/common';
import { TranslateEVM } from './translateEVM';
import { TranslateSVM } from './translateSVM';
import { TranslateUTXO } from './translateUTXO';
import { TranslateCOSMOS } from './translateCOSMOS';
import { TranslateTVM } from './translateTVM';
import { TranslatePOLKADOT } from './translatePOLKADOT';
/**
 * Abstract class for managing the state of transactions and providing methods for pagination.
 * 
 * @abstract
 * @class
 */
export abstract class Pagination<T> {
    protected translate: TranslateEVM | TranslateSVM | TranslateUTXO | TranslateCOSMOS | TranslateTVM | TranslatePOLKADOT;
    protected walletAddress: string;
    protected chain: string;
    protected transactions: T[];
    protected currentPageKeys: PageOptions;
    protected nextPageKeys: PageOptions | null;
    protected previousPageKeys: PageOptions | null;
    protected pageKeys: PageOptions[];

    constructor(translate: TranslateEVM | TranslateSVM | TranslateUTXO | TranslateCOSMOS | TranslateTVM | TranslatePOLKADOT, initialData: any) {
        this.translate = translate;
        this.walletAddress = initialData.walletAddress;
        this.chain = initialData.chain;
        this.transactions = initialData.transactions || [];
        this.currentPageKeys = initialData.currentPageKeys;
        this.nextPageKeys = initialData.nextPageKeys;
        this.previousPageKeys = null;
        this.pageKeys = [initialData.currentPageKeys];
    }

    /**
     * Get the current page of transactions.
     * @returns {T[]} The current page of transactions.
     */
    public getTransactions(): T[] {
        return this.transactions || [];
    }

    public getCurrentPageKeys(): PageOptions {
        return this.currentPageKeys;
    }

    /**
     * Get the next page keys.
     * @returns {PageOptions | null} The next page keys or null if there is no next page.
     */
    public getNextPageKeys(): PageOptions | null {
        return this.nextPageKeys;
    }

    public getPreviousPageKeys(): PageOptions | null {
        return this.previousPageKeys;
    }

    public getPageKeys(): PageOptions[] {
        return this.pageKeys;
    }

    public getPageKeyByIndex(index: number): PageOptions | undefined {
        return this.pageKeys[index];
    }

    /**
     * Abstract method to fetch the next page of transactions and update internal state.
     * @returns {Promise<boolean>} A promise that resolves to true if the next page was fetched successfully, false otherwise.
     */
    public abstract next(): Promise<boolean>;

    /**
     * Fetch the previous page of transactions and update internal state.
     * @returns {Promise<boolean>} A promise that resolves to true if the previous page was fetched successfully, false otherwise.
     */
    public async previous(): Promise<boolean> {
        // Find the current page index in the pageKeys array
        const currentIndex = this.pageKeys.findIndex(keys => 
            JSON.stringify(keys) === JSON.stringify(this.currentPageKeys)
        );
        
        // Check if there's a previous page
        if (currentIndex <= 0) {
            return false; // Already at the first page
        }
        
        const previousKeys = this.pageKeys[currentIndex - 1];
        
        try {
            let response;
            // Call the appropriate getTransactions method based on the ecosystem
            if ('getTransactions' in this.translate) {
                response = await (this.translate as any).getTransactions(this.chain, this.walletAddress, previousKeys);
            } else {
                // Fallback for older SDK versions
                response = await (this.translate as any).Transactions(this.chain, this.walletAddress, previousKeys);
            }

            if (!response || !response.getTransactions) {
                return false;
            }

            const transactions = response.getTransactions();
            if (!Array.isArray(transactions)) {
                return false;
            }

            this.transactions = transactions;
            this.previousPageKeys = currentIndex > 1 ? this.pageKeys[currentIndex - 2] : null;
            this.currentPageKeys = previousKeys;
            this.nextPageKeys = response.getNextPageKeys();

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if there's a previous page available.
     * @returns {boolean} True if there's a previous page, false otherwise.
     */
    public hasPrevious(): boolean {
        const currentIndex = this.pageKeys.findIndex(keys => 
            JSON.stringify(keys) === JSON.stringify(this.currentPageKeys)
        );
        return currentIndex > 0;
    }

    /**
     * Get cursor information for external pagination systems.
     * @returns {object} Cursor information including next/previous availability and cursor strings.
     */
    public getCursorInfo(): {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextCursor: string | null;
        previousCursor: string | null;
    } {
        return {
            hasNextPage: !!this.nextPageKeys,
            hasPreviousPage: this.hasPrevious(),
            nextCursor: this.getNextCursor(),
            previousCursor: this.getPreviousCursor()
        };
    }

    /**
     * Get the next page cursor as an encoded string.
     * @returns {string | null} Base64 encoded cursor for the next page, or null if no next page.
     */
    public getNextCursor(): string | null {
        if (!this.nextPageKeys) return null;
        return this.encodeCursor(this.nextPageKeys);
    }

    /**
     * Get the previous page cursor as an encoded string.
     * @returns {string | null} Base64 encoded cursor for the previous page, or null if no previous page.
     */
    public getPreviousCursor(): string | null {
        if (!this.hasPrevious()) return null;
        const currentIndex = this.pageKeys.findIndex(keys => 
            JSON.stringify(keys) === JSON.stringify(this.currentPageKeys)
        );
        if (currentIndex <= 0) return null;
        return this.encodeCursor(this.pageKeys[currentIndex - 1]);
    }

    /**
     * Encode PageOptions as a cursor string.
     * @param {PageOptions} pageKeys - The page options to encode.
     * @returns {string} Base64 encoded cursor string.
     */
    private encodeCursor(pageKeys: PageOptions): string {
        return Buffer.from(JSON.stringify(pageKeys)).toString('base64');
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