// src/pricing/pricingEVM.ts

import { Chain, Pricing, PoolPricing } from '../types/types';
import { createPricingClient } from '../utils/apiUtils';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';

const ECOSYSTEM = 'evm';

/**
 * Class representing the EVM pricing module.
 */
export class PricingEVM {
  private request: ReturnType<typeof createPricingClient>;

  /**
   * Create a PricingEVM instance.
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
   * Returns a list with the names of the EVM blockchains currently supported by this API. 
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
    const validatedName = name.toLowerCase() === 'ethereum' ? 'eth' : name.toLowerCase();
    const result = await this.request('chains');
    const chain = result.response.find((chain: Chain) => chain.name.toLowerCase() === validatedName.toLowerCase());
    if (!chain) {
      throw new ChainNotFoundError(name);
    }
    return chain;
  }

  /**
   * This is our main / general pricing endpoint.
   * It returns the price for any token or lpToken at the given block/timestamp. 
   * If no block or timestamp is passed, the price for the latest block will be returned.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} tokenAddress - The address of the token to retrieve pricing for.
   * @param {Object} [options] - Optional parameters for the request.
   * @param {string} [options.priceType] - The type of price to retrieve (only 'dexHighestLiquidity' is supported).
   * @param {number} [options.timestamp] - The timestamp for which to retrieve the price.
   * @param {number} [options.blockNumber] - The block number for which to retrieve the price.
   * @returns {Promise<Pricing>} A promise that resolves to the pricing object.
   */
  public async getPrice(
    chain: string,
    tokenAddress: string,
    options?: {
      priceType?: 'dexHighestLiquidity';
      timestamp?: number;
      blockNumber?: number;
    }
  ): Promise<Pricing> {
    const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
    let url = `${validatedChain}/price/${tokenAddress}`;

    const queryParams = new URLSearchParams();
    if (options?.priceType === 'dexHighestLiquidity') {
      queryParams.append('priceType', options.priceType);
    }
    if (options?.timestamp !== undefined) {
      queryParams.append('timestamp', options.timestamp.toString());
    }
    if (options?.blockNumber !== undefined) {
      queryParams.append('blockNumber', options.blockNumber.toString());
    }

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const result = await this.request(url);
    return result.response;
  }

  /**
   * This is an endpoint with narrow functionality, used mostly by pricing oracles and similar systems.
   * Given a liquidity pool address and a token address, it returns the current price for the requested token (baseToken) in the pool, in terms of the other token (quoteToken) in the pool.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} poolAddress - The address of the pool to retrieve pricing for.
   * @param {string} baseTokenAddress - The address of the base token to retrieve pricing for.
   * @returns {Promise<PoolPricing>} A promise that resolves to the pricing object.
   */
  public async getPriceFromPool(
    chain: string,
    poolAddress: string,    
    baseTokenAddress: string,
  ): Promise<PoolPricing> {
    const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
    let url = `${validatedChain}/priceFromPool/${poolAddress}/${baseTokenAddress}`;

    const result = await this.request(url);
    return result.response;
  }

  /**
   * Pre-fetch prices for multiple tokens.
   * @param {Array<{
   *   tokenAddress: string | null,
   *   chain: string | null,
   *   priceType: 'dexHighestLiquidity' | 'coingecko' | null,
   *   timestamp?: number,
   *   blockNumber?: number
   * }>} tokens - An array of token objects to pre-fetch prices for.
   * @returns {Promise<Array<any>>} A promise that resolves to an array of pricing results.
   * @description Takes an array of tokens that need pricing. Each token needs an address, a chain identifier, and the type of price desired.
   * Valid values for 'priceType' are: dexHighestLiquidity, coingecko.
   * For the 'chain' field, pull the list of valid names from the /chains endpoint.
   * Block number or timestamp are optional (you only need to pass one of those, or none if you want to pre-fetch the token for current time).
   * Returns an array of results for each token that you passed. If any of the results have a status of "findingSolution", 
   * you can call the regular /price endpoint for a final answer on that token in about ~2 minutes.
   */
  public async preFetchPrice(tokens: Array<{
    tokenAddress: string | null,
    chain: string | null,
    priceType: 'dexHighestLiquidity' | 'coingecko' | null,
    timestamp?: number,
    blockNumber?: number
  }>): Promise<Array<any>> {
    const url = 'prefetch';
    const result = await this.request(url, "POST", { body: JSON.stringify(tokens) });
    return result.response;
  }
}