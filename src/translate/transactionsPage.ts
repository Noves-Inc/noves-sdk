// src/translate/TransactionsPage.ts

import { Pagination } from './pagination';

/**
 * Pagination object for transactions.
 * 
 * @class
 */
export class TransactionsPage<T> extends Pagination<T>{

  /**
   * Fetch the next page of transactions and update internal state.
   * @returns {Promise<boolean>} A promise that resolves to true if the next page was fetched successfully, false otherwise.
   */
  public async next(): Promise<boolean> {
    if (!this.nextPageKeys) {
      return false
    }
    const response = await this.translate.Transactions(this.chain, this.walletAddress, this.nextPageKeys);
    this.transactions = response.getTransactions() as T[];

    this.previousPageKeys = this.currentPageKeys;
    this.currentPageKeys = this.nextPageKeys;
    this.nextPageKeys = response.getNextPageKeys();

    this.pageKeys.push(this.currentPageKeys);

    return true;
  }
}