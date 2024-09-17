// src/pricing/pricingMove.ts

import { Chain, PoolPricing } from '../types/types';
import { createPricingClient } from '../utils/apiUtils';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';

const ECOSYSTEM = 'move';

/**
 * Class representing the Cosmos pricing module.
 */
export class PricingMove {
  private request: ReturnType<typeof createPricingClient>;

  /**
   * Create a PricingMove instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.request = createPricingClient(ECOSYSTEM, apiKey);
  }

  /**
   * Returns a list with the names of the Move blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<Chain[]> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
   * Get a chain by its name.
   * @param {string} name - The name of the chain to retrieve.
   * @returns {Promise<Chain>} A promise that resolves to the chain object or undefined if not found.
   * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
   */
  public async getChain(name: string): Promise<Chain> {
    const result = await this.request('chains');
    const chain = result.response.find((chain: Chain) => chain.name.toLowerCase() === name.toLowerCase());
    if (!chain) {
      throw new ChainNotFoundError(name);
    }
    return chain;
  }

  /**
   * Given a liquidity pool address and a token address, returns the current price for the requested token (baseToken) in the pool, 
   * in terms of the other token (quoteToken) in the pool.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} poolAddress - The address of the pool to retrieve pricing for.
   * @param {string} baseTokenAddress - The address of the base token to retrieve pricing for.
   * @returns {Promise<Pricing>} A promise that resolves to the pricing object.
   */
  public async getPriceFromPool(
    chain: string,
    poolAddress: string,    
    baseTokenAddress: string,
  ): Promise<PoolPricing> {
    let url = `${chain}/priceFromPool/${poolAddress}/${baseTokenAddress}`;

    const result = await this.request(url);
    return result.response;
  }
}
