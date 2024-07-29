// src/translate/TransactionsPage.ts

import { Transaction, PageOptions } from '../types/types';
import { Translate } from './translateEVM';

/**
 * This class manages the state of transactions and provides methods for pagination.
 * * 
 * @class
 */
export class TransactionsPage<T> {
  private translate: Translate;
  private walletAddress: string;
  private chain: string;
  private transactions: T[];
  private currentPageKeys: PageOptions;
  private nextPageKeys: PageOptions;
  private previousPageKeys: PageOptions | null;
  private pageKeys: PageOptions[];

  /**
   * Creates an instance of TransactionsPage.
   * @param {Translate} translate - The Translate instance for making API requests.
   * @param {Object} initialData - The initial data for the transactions page.
   */
  constructor(translate: Translate, initialData: any) {
    this.translate = translate;
    this.walletAddress = initialData.walletAddress;
    this.chain = initialData.chain;
    this.transactions = [];
    this.currentPageKeys = initialData.currentPageKeys;
    this.nextPageKeys = initialData.nextPageKeys;
    this.previousPageKeys = null;
    this.pageKeys = [initialData.currentPageKeys];
  }

  /**
   * Get the current transactions.
   * @returns {Transaction[]} The current array of transactions.
   */
  public getTransactions(): T[] {
    return this.transactions;
  }

  /**
   * Get the current page keys.
   * @returns {PageOptions} The current page keys.
   */
  public getCurrentPageKeys(): PageOptions {
    return this.currentPageKeys;
  }

  /**
   * Get the next page keys.
   * @returns {PageOptions} The next page keys.
   */
  public getNextPageKeys(): PageOptions {
    return this.nextPageKeys;
  }

  /**
   * Get the previous page keys.
   * @returns {PageOptions | null} The previous page keys or null if not available.
   */
  public getPreviousPageKeys(): PageOptions | null {
    return this.previousPageKeys;
  }

  /**
   * Get all page keys that have been fetched.
   * @returns {PageOptions[]} An array of all fetched page keys.
   */
  public getPageKeys(): PageOptions[] {
    return this.pageKeys;
  }

  /**
   * Get a specific page key by its index.
   * @param {number} index - The index of the desired page key.
   * @returns {PageOptions | undefined} The page key at the specified index, or undefined if not available.
   */
  public getPageKeyByIndex(index: number): PageOptions | undefined {
    return this.pageKeys[index];
  }

  /**
   * Fetch the next page of transactions and update internal state.
   * @returns {Promise<boolean>} A promise that resolves to true if the next page was fetched successfully, false otherwise.
   */
  public async next(): Promise<boolean> {
    if (!this.nextPageKeys) {
      return false
    }
    const response = await this.translate.Transactions(this.chain, this.walletAddress, this.nextPageKeys);
    this.transactions = response.transactions as T[];
    
    this.previousPageKeys = this.currentPageKeys;
    this.currentPageKeys = this.nextPageKeys;
    this.nextPageKeys = response.nextPageKeys;

    this.pageKeys.push(this.currentPageKeys);

    return true;
  }
}