// src/foresight/foresight.ts

import { TransactionError } from '../errors/TransactionError';
import { Chain, StateOverrides, Transaction, UnsignedTransaction, UserOperation } from '../types/types';
import { createForesightClient } from '../utils/apiUtils';

/**
 * Class representing the foresight transaction pre-sign API.
 */
export class Foresight {
  private request: ReturnType<typeof createForesightClient>;

  /**
   * Create a Foresight instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.request = createForesightClient(apiKey);
  }

   /**
   * Returns a list with the names of the EVM blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
   public async getChains(): Promise<Chain[]> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
   * Takes an unsigned transaction object and returns a fully classified transaction, 
   * including an enriched English description of the action that is about to take place, and all relevant asset transfers tagged.
   * 
   * Optionally, it takes a stateOverrides object, which allows you to customize the state of the chain before the transaction is previewed. 
   * Useful for more advanced applications. You can skip this object to preview the transaction in the "real" state of the chain.
   * @param {string} chain - The chain name.
   * @param {UnsignedTransaction} unsignedTransaction - The unsigned transaction object, modeled after the standard format used by multiple EVM wallets.
   * @param {StateOverrides} stateOverrides - OPTIONAL. The state overrides object allows you to customize the state of the chain before the transaction is previewed.
   * @param {string} viewAsAccountAddress - OPTIONAL The account address from which perspective the transaction will be previewed. Leave blank to use the raw 'from' of the transaction object.
   * @param {number} block - OPTIONAL. The block number to preview the transaction at. Leave blank to use the latest block number.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async preview(chain: string, unsignedTransaction: UnsignedTransaction, stateOverrides?: StateOverrides, viewAsAccountAddress?: string, block?: number): Promise<Transaction> {
    try {
      let endpoint = `${chain}/preview`;
      endpoint += block ? `?block=${block}` : '';
      endpoint += viewAsAccountAddress ? `?viewAsAccountAddress=${viewAsAccountAddress}` : '';

      const body = stateOverrides ? { ...unsignedTransaction, stateOverrides } : unsignedTransaction;

      const result = await this.request(endpoint, "POST", { body: JSON.stringify(body) });
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      throw error;
    }
  }

  /**
   * Takes an ERC-4337 userOp object, and returns a classified transaction previewing what will happen if the userOp is executed.
   * 
   * It includes an English description plus all relevant asset transfers tagged from the perspective of the userOp's 'sender' (the user).
   * @param {string} chain - The chain name.
   * @param {UserOperation} userOperation - The ERC-4337 userOp object, in exactly the same format that would be submitted to a bundler for transaction execution.
   * @param {number} block - OPTIONAL. The block number to preview the userOp at. Leave blank to preview the userOp in the current state of the chain.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async preview4337(chain: string, userOperation: UserOperation, block?: number): Promise<Transaction> {
    try {
      let endpoint = `${chain}/preview4337`;
      endpoint += block ? `?block=${block}` : '';

      const result = await this.request(endpoint, "POST", { body: JSON.stringify(userOperation) });
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      throw error;
    }
  }

  /**
   * Returns a description of the action that will take place if the transaction executes.
   * 
   * @param {string} chain - The chain name.
   * @param {UnsignedTransaction} unsignedTransaction - The unsigned transaction object, modeled after the standard format used by multiple EVM wallets.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describe(chain: string, unsignedTransaction: UnsignedTransaction): Promise<Transaction> {
    try {
      let endpoint = `${chain}/describe`;

      const result = await this.request(endpoint, "POST", { body: JSON.stringify(unsignedTransaction) });
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      throw error;
    }
  }

  /**
   * Returns a description of what will happen if the ERC-4337 userOp object executes.
   * 
   * @param {string} chain - The chain name.
   * @param {UserOperation} userOperation - The ERC-4337 userOp object, in exactly the same format that would be submitted to a bundler for transaction execution.
   * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describe4337(chain: string, userOperation: UserOperation): Promise<Transaction> {
    try {
      let endpoint = `${chain}/describe4337`;

      const result = await this.request(endpoint, "POST", { body: JSON.stringify(userOperation) });
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      throw error;
    }
  }
}