// src/foresight/foresight.ts

import { TransactionError } from '../errors/TransactionError';
import { EVMTranslateStateOverrides } from '../types/evm';
import { 
  EVMForesightChains, 
  EVMForesightDescribeResponse, 
  EVMForesightDescribe4337Response, 
  EVMTranslateUserOperation, 
  EVMForesightPreviewResponse, 
  EVMForesightPreview4337Response,
  EVMTranslateUnsignedTransaction,
  EVMForesightScreenResponse,
  EVMForesightScreen4337Response
} from '../types/evm';
import { ForesightUrlScreenResponse } from '../types/common';
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
   * @returns {Promise<EVMForesightChains>} A promise that resolves to an array of chains.
   */
   public async getChains(): Promise<EVMForesightChains> {
    const result = await this.request('evm/chains');
    return result.response;
  }

  /**
   * Takes an unsigned transaction object and returns a fully classified transaction, 
   * including an enriched English description of the action that is about to take place, and all relevant asset transfers tagged.
   * 
   * Optionally, it takes a stateOverrides object, which allows you to customize the state of the chain before the transaction is previewed. 
   * Useful for more advanced applications. You can skip this object to preview the transaction in the "real" state of the chain.
   * @param {string} chain - The chain name.
   * @param {EVMTranslateUnsignedTransaction} unsignedTransaction - The unsigned transaction object, modeled after the standard format used by multiple EVM wallets.
        * @param {EVMTranslateStateOverrides} stateOverrides - OPTIONAL. The state overrides object allows you to customize the state of the chain before the transaction is previewed.
   * @param {string} viewAsAccountAddress - OPTIONAL The account address from which perspective the transaction will be previewed. Leave blank to use the raw 'from' of the transaction object.
   * @param {number} block - OPTIONAL. The block number to preview the transaction at. Leave blank to use the latest block number.
   * @returns {Promise<EVMForesightPreviewResponse>} A promise that resolves to the transaction preview details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
      public async preview(chain: string, unsignedTransaction: EVMTranslateUnsignedTransaction, stateOverrides?: EVMTranslateStateOverrides, viewAsAccountAddress?: string, block?: number): Promise<EVMForesightPreviewResponse> {
    try {
      let endpoint = `evm/${chain}/preview`;
      const queryParams = new URLSearchParams();
      
      if (block) {
        queryParams.append('block', block.toString());
      }
      if (viewAsAccountAddress) {
        queryParams.append('viewAsAccountAddress', viewAsAccountAddress);
      }
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      const body = {
        transaction: unsignedTransaction,
        stateOverrides: stateOverrides || {}
      };

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
   * @param {EVMTranslateUserOperation} userOperation - The ERC-4337 userOp object, in exactly the same format that would be submitted to a bundler for transaction execution.
   * @param {number} block - OPTIONAL. The block number to preview the userOp at. Leave blank to preview the userOp in the current state of the chain.
   * @returns {Promise<EVMForesightPreview4337Response>} A promise that resolves to the transaction preview details.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async preview4337(chain: string, userOperation: EVMTranslateUserOperation, block?: number): Promise<EVMForesightPreview4337Response> {
    try {
      let endpoint = `evm/${chain}/preview4337`;
      endpoint += block ? `?block=${block}` : '';

      const result = await this.request(endpoint, "POST", { body: JSON.stringify({ userOp: userOperation }) });
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
   * @param {EVMTranslateUnsignedTransaction} unsignedTransaction - The unsigned transaction object, modeled after the standard format used by multiple EVM wallets.
   * @returns {Promise<EVMForesightDescribeResponse>} A promise that resolves to the transaction description.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describe(chain: string, unsignedTransaction: EVMTranslateUnsignedTransaction): Promise<EVMForesightDescribeResponse> {
    try {
      let endpoint = `evm/${chain}/describe`;

      const result = await this.request(endpoint, "POST", { body: JSON.stringify({ transaction: unsignedTransaction }) });
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
   * Validates that the response contains all required fields.
   * @param {any} response - The response to validate.
   * @param {string[]} requiredFields - Array of required field names.
   * @returns {boolean} True if all required fields are present.
   */
  private validateResponse(response: any, requiredFields: string[]): boolean {
    return requiredFields.every(field => response && typeof response[field] === 'string');
  }

  /**
   * Returns a description of what will happen if the ERC-4337 userOp object executes.
   * 
   * @param {string} chain - The chain name.
   * @param {EVMTranslateUserOperation} userOperation - The ERC-4337 userOp object, in exactly the same format that would be submitted to a bundler for transaction execution.
   * @returns {Promise<EVMForesightDescribe4337Response>} A promise that resolves to the transaction description and type.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async describe4337(chain: string, userOperation: EVMTranslateUserOperation): Promise<EVMForesightDescribe4337Response> {
    try {
      let endpoint = `evm/${chain}/describe4337`;

      const result = await this.request(endpoint, "POST", { body: JSON.stringify({ userOp: userOperation }) });
      
      if (!this.validateResponse(result.response, ['description', 'type'])) {
        throw new TransactionError({ message: ['Invalid response format'] });
      }
      
      return result.response;
    } catch (error) {
      if (error instanceof Response) {
        const errorResponse = await error.json();
        if (errorResponse.status === 400 && errorResponse.errors) {
          throw new TransactionError(errorResponse.errors);
        }
      }
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError({ message: ['Failed to describe user operation'] });
    }
  }

  /**
   * Screens a transaction for potential risks and provides detailed analysis.
   * @param {string} chain - The chain name.
   * @param {EVMTranslateUnsignedTransaction} unsignedTransaction - The unsigned transaction object to screen.
   * @returns {Promise<EVMForesightScreenResponse>} A promise that resolves to the transaction screening results.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async screen(chain: string, unsignedTransaction: EVMTranslateUnsignedTransaction): Promise<EVMForesightScreenResponse> {
    try {
      const endpoint = `evm/${chain}/screen`;

      const result = await this.request(endpoint, "POST", { 
        body: JSON.stringify({ transaction: unsignedTransaction }) 
      });
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
   * Screens an ERC-4337 user operation for potential risks and provides detailed analysis.
   * @param {string} chain - The chain name.
   * @param {EVMTranslateUserOperation} userOperation - The ERC-4337 userOp object to screen.
   * @returns {Promise<EVMForesightScreen4337Response>} A promise that resolves to the user operation screening results.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async screen4337(chain: string, userOperation: EVMTranslateUserOperation): Promise<EVMForesightScreen4337Response> {
    try {
      const endpoint = `evm/${chain}/screen4337`;

      const result = await this.request(endpoint, "POST", { 
        body: JSON.stringify({ userOp: userOperation }) 
      });
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
   * Screens a URL for potential risks and provides detailed analysis.
   * @param {string} url - The URL to screen.
   * @returns {Promise<ForesightUrlScreenResponse>} A promise that resolves to the URL screening results.
   * @throws {TransactionError} If there are validation errors in the request.
   */
  public async screenUrl(url: string): Promise<ForesightUrlScreenResponse> {
    try {
      const endpoint = `url/screen?url=${encodeURIComponent(url)}`;

      const result = await this.request(endpoint);
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