// src/translate/historyPage.ts

import { Pagination } from './pagination';
import { TranslateEVM } from './translateEVM';
import { PageOptions } from '../types/common';

/**
 * Pagination object for transactions.
 * 
 * @class
 */
export class HistoryPage<T> extends Pagination<T>{

  /**
   * Get the current page of transactions.
   * @returns {T[]} The current page of transactions.
   */
  public getTransactions(): T[] {
    return this.transactions || [];
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
      const response = await (this.translate as TranslateEVM).getHistory(this.chain, this.walletAddress, this.nextPageKeys);
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

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the previous page keys.
   * @returns {PageOptions | null} The previous page keys or null if there is no previous page.
   */
  public getPreviousPageKeys(): PageOptions | null {
    return this.previousPageKeys;
  }

  /**
   * Get all page keys.
   * @returns {PageOptions[]} All page keys.
   */
  public getPageKeys(): PageOptions[] {
    return this.pageKeys;
  }
}