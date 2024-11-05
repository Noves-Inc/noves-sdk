// src/translate/paging.ts

import { PageOptions } from '../types/types';
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
    protected nextPageKeys: PageOptions;
    protected previousPageKeys: PageOptions | null;
    protected pageKeys: PageOptions[];

    constructor(translate: TranslateEVM | TranslateSVM | TranslateUTXO | TranslateCOSMOS | TranslateTVM | TranslatePOLKADOT, initialData: any) {
        this.translate = translate;
        this.walletAddress = initialData.walletAddress;
        this.chain = initialData.chain;
        this.transactions = initialData.transactions;
        this.currentPageKeys = initialData.currentPageKeys;
        this.nextPageKeys = initialData.nextPageKeys;
        this.previousPageKeys = null;
        this.pageKeys = [initialData.currentPageKeys];
    }

    public getTransactions(): T[] {
        return this.transactions;
    }

    public getCurrentPageKeys(): PageOptions {
        return this.currentPageKeys;
    }

    public getNextPageKeys(): PageOptions {
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
}