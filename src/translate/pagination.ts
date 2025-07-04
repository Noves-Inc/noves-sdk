// src/translate/paging.ts

import { PageOptions, EnhancedCursorData, CursorNavigationMeta } from '../types/common';
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

    /**
     * Maximum number of pages to keep in navigation history to prevent cursor growth.
     * This limits backward navigation but prevents 413 errors on deep pagination.
     * Users can still navigate forward indefinitely.
     */
    private static readonly DEFAULT_MAX_NAVIGATION_HISTORY = 10;

    /**
     * Warning threshold for cursor size in KB.
     * If cursor exceeds this size, a warning will be logged.
     */
    private static readonly CURSOR_SIZE_WARNING_THRESHOLD_KB = 5;

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
     * Check if there's a next page available.
     * @returns {boolean} True if there's a next page, false otherwise.
     */
    public hasNext(): boolean {
        return !!this.nextPageKeys;
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
     * Get the next page cursor as an enhanced encoded string with navigation metadata.
     * @returns {string | null} Base64 encoded enhanced cursor for the next page, or null if no next page.
     */
    public getNextCursor(): string | null {
        if (!this.nextPageKeys) return null;
        
        const currentIndex = this.getCurrentPageIndex();
        const enhancedCursorData = this.createEnhancedCursor(
            this.nextPageKeys,
            currentIndex + 1
        );
        
        return this.encodeEnhancedCursor(enhancedCursorData);
    }

    /**
     * Get the previous page cursor as an enhanced encoded string with navigation metadata.
     * @returns {string | null} Base64 encoded enhanced cursor for the previous page, or null if no previous page.
     */
    public getPreviousCursor(): string | null {
        if (!this.hasPrevious()) return null;
        
        const currentIndex = this.getCurrentPageIndex();
        if (currentIndex <= 0) return null;
        
        const previousPageOptions = this.pageKeys[currentIndex - 1];
        const enhancedCursorData = this.createEnhancedCursor(
            previousPageOptions,
            currentIndex - 1
        );
        
        return this.encodeEnhancedCursor(enhancedCursorData);
    }

    /**
     * Create an enhanced cursor with navigation metadata.
     * @param {PageOptions} targetPageOptions - The page options for the target page
     * @param {number} targetPageIndex - The index of the target page in navigation history
     * @returns {EnhancedCursorData} Enhanced cursor data with navigation metadata
     */
    protected createEnhancedCursor(targetPageOptions: PageOptions, targetPageIndex: number): EnhancedCursorData {
        // Get the maximum navigation history size from PageOptions or use default
        const maxHistorySize = this.getMaxNavigationHistorySize();
        
        // Calculate the start index to limit navigation history
        const startIndex = Math.max(0, targetPageIndex + 1 - maxHistorySize);
        
        // Build limited navigation history
        const navigationHistory = this.pageKeys.slice(startIndex, targetPageIndex + 1);
        
        // Ensure we have the target page in our history
        const adjustedTargetIndex = targetPageIndex - startIndex;
        if (navigationHistory.length <= adjustedTargetIndex) {
            navigationHistory[adjustedTargetIndex] = targetPageOptions;
        }

        const cursorMeta: CursorNavigationMeta = {
            currentPageIndex: adjustedTargetIndex,
            navigationHistory: [...navigationHistory],
            canGoBack: targetPageIndex > 0,
            canGoForward: targetPageIndex < this.pageKeys.length - 1 || !!this.nextPageKeys,
            previousPageOptions: adjustedTargetIndex > 0 ? navigationHistory[adjustedTargetIndex - 1] : null,
            nextPageOptions: targetPageIndex === this.getCurrentPageIndex() ? this.nextPageKeys : 
                             targetPageIndex < this.pageKeys.length - 1 ? this.pageKeys[targetPageIndex + 1] : null,
            // Store the original page index for proper navigation
            originalPageIndex: targetPageIndex,
            // Store the start index so we can reconstruct the full context if needed
            historyStartIndex: startIndex
        };

        return {
            ...targetPageOptions,
            _cursorMeta: cursorMeta
        };
    }

    /**
     * Get the maximum navigation history size.
     * @returns {number} Maximum number of pages to keep in navigation history
     */
    protected getMaxNavigationHistorySize(): number {
        // Check if maxNavigationHistory is set in current page options
        const currentPageMaxHistory = this.currentPageKeys.maxNavigationHistory;
        if (typeof currentPageMaxHistory === 'number' && currentPageMaxHistory > 0) {
            return currentPageMaxHistory;
        }
        
        return Pagination.DEFAULT_MAX_NAVIGATION_HISTORY;
    }

    /**
     * Get the current page index in the navigation history.
     * @returns {number} Current page index (0-based)
     */
    protected getCurrentPageIndex(): number {
        return this.pageKeys.findIndex(keys => 
            JSON.stringify(keys) === JSON.stringify(this.currentPageKeys)
        );
    }

    /**
     * Encode enhanced cursor data as a Base64 string.
     * @param {EnhancedCursorData} enhancedCursorData - The enhanced cursor data to encode
     * @returns {string} Base64 encoded cursor string
     */
    protected encodeEnhancedCursor(enhancedCursorData: EnhancedCursorData): string {
        const jsonString = JSON.stringify(enhancedCursorData);
        const base64String = Buffer.from(jsonString).toString('base64');
        
        // Monitor cursor size and warn if it's getting large
        const sizeKB = Buffer.byteLength(base64String, 'utf8') / 1024;
        if (sizeKB > Pagination.CURSOR_SIZE_WARNING_THRESHOLD_KB) {
            console.warn(`[Noves SDK] Cursor size is ${sizeKB.toFixed(2)}KB (${enhancedCursorData._cursorMeta?.navigationHistory?.length || 0} pages in history). Consider reducing maxNavigationHistory to prevent potential 413 errors.`);
        }
        
        return base64String;
    }

    /**
     * Encode PageOptions as a cursor string (legacy method for backward compatibility).
     * @param {PageOptions} pageKeys - The page options to encode.
     * @returns {string} Base64 encoded cursor string.
     */
    private encodeCursor(pageKeys: PageOptions): string {
        return Buffer.from(JSON.stringify(pageKeys)).toString('base64');
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

    /**
     * Check if a decoded cursor is an enhanced cursor with navigation metadata.
     * @param {any} decodedCursor - The decoded cursor data
     * @returns {boolean} True if the cursor is enhanced, false otherwise
     */
    public static isEnhancedCursor(decodedCursor: any): decodedCursor is EnhancedCursorData {
        return decodedCursor && typeof decodedCursor === 'object' && '_cursorMeta' in decodedCursor;
    }
}