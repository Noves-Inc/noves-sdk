// src/translate/TransactionsPage.ts

import { Translate } from './translateEVM';

export class TransactionsPage {
  private translate: Translate;
  private walletAddress: string;
  private chain: string;
  public transactions: any[];
  public nextPageKeys: string[];

  constructor(translate: Translate, walletAddress: string, chain: string, initialData: any) {
    this.translate = translate;
    this.walletAddress = walletAddress;
    this.chain = chain;
    this.transactions = initialData.transactions;
    this.nextPageKeys = initialData.nextPageKeys || [];
  }

  /**
   * Fetch the next page of transactions.
   * @returns {Promise<any[]>} A promise that resolves to an array of transactions.
   */
  public async next(): Promise<any[]> {
    if (this.nextPageKeys.length === 0) {
      throw new Error('No more pages available');
    }

    const nextPageUrl = this.nextPageKeys.shift();
    const response = await this.translate.request(nextPageUrl);
    this.transactions = response.response.transactions;
    this.nextPageKeys = response.response.nextPageKeys || [];
    return this.transactions;
  }

  /**
   * Manually fetch transactions for a given page key.
   * @param {string} pageKey - The page key to fetch transactions.
   * @returns {Promise<any[]>} A promise that resolves to an array of transactions.
   */
  public async getTransactions(pageKey: string): Promise<any[]> {
    const response = await this.translate.request(pageKey);
    return response.response.transactions;
  }
}