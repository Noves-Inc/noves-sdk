// src/translate/TransactionsPage.ts

import { Transaction, PageOptions } from '../types/types';
import { Translate } from './translateEVM';

/**
 * This class manages the state of transactions and provides methods for pagination.
 * * 
 * @class
 */
export class TransactionsPage {
  private translate: Translate;
  private walletAddress: string;
  private chain: string;
  private transactions: Transaction[];
  private currentPageKeys: PageOptions;
  private nextPageKeys: PageOptions;
  private previousPageKeys: PageOptions | null;

  /**
   * Creates an instance of TransactionsPage.
   * @param {Translate} translate - The Translate instance for making API requests.
   * @param {Object} initialData - The initial data for the transactions page.
   */
  constructor(translate: Translate, initialData: any) {
    this.translate = translate;
    this.walletAddress = initialData.walletAddress;
    this.chain = initialData.chain;
    this.transactions = initialData.transactions;
    this.currentPageKeys = initialData.currentPageKeys;
    this.nextPageKeys = initialData.nextPageKeys;
    this.previousPageKeys = null;
  }

  /**
   * Get the current transactions.
   * @returns {Transaction[]} The current array of transactions.
   */
  public getTransactions(): Transaction[] {
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
   * Fetch the next page of transactions and update internal state.
   * @returns {Promise<boolean>} A promise that resolves to true if the next page was fetched successfully, false otherwise.
   */
  public async next(): Promise<boolean> {
    if (!this.nextPageKeys) {
      return false
    }

    const response = await this.translate.Transactions(this.chain, this.walletAddress, this.nextPageKeys);
    this.transactions = response.transactions;
    
    this.previousPageKeys = this.currentPageKeys;
    this.currentPageKeys = this.nextPageKeys;
    this.nextPageKeys = response.nextPageKeys;

    return true;
  }
}