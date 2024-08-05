// src/translate/historyPage.ts

import { Pagination } from './pagination';
import { TranslateEVM } from './translateEVM';

/**
 * Pagination object for transactions.
 * 
 * @class
 */
export class HistoryPage<T> extends Pagination<T>{

  /**
   * Fetch the next page of transactions and update internal state.
   * @returns {Promise<boolean>} A promise that resolves to true if the next page was fetched successfully, false otherwise.
   */
  public async next(): Promise<boolean> {
    if (!this.nextPageKeys) {
      return false
    }
    const response = await (this.translate as TranslateEVM).History(this.chain, this.walletAddress, this.nextPageKeys);
    this.transactions = response.getTransactions() as T[];

    this.previousPageKeys = this.currentPageKeys;
    this.currentPageKeys = this.nextPageKeys;
    this.nextPageKeys = response.getNextPageKeys();

    this.pageKeys.push(this.currentPageKeys);

    return true;
  }
}