// src/translate/TransactionsPage.ts

import { PageOptions } from '../types/types';
import { Translate } from './translateEVM';

export class TransactionsPage {
  private translate: Translate;
  private walletAddress: string;
  private chain: string;
  public transactions: any[];
  public nextPageKeys: PageOptions[];

  constructor(translate: Translate, initialData: any) {
    this.translate = translate;
    this.walletAddress = initialData.walletAddress;
    this.chain = initialData.chain;
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
    const response = await this.translate.getTransactions(this.chain, this.walletAddress, nextPageUrl);
    this.transactions = response.transactions;
    this.nextPageKeys = response.nextPageKeys || [];
    return this.transactions;
  }
}