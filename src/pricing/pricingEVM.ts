// src/pricing/pricingEVM.ts

import { 
    EVMPricingChain, 
    EVMPricingChains, 
    EVMPricingResponse, 
    EVMPricingPoolResponse,
    EVMPricingTokenPrefetchRequest,
    EVMPricingTokenPrefetchResult,
    EVMPricingPreFetchResponse
} from '../types/evm';
import { createPricingClient } from '../utils/apiUtils';

const ECOSYSTEM = 'evm';

/**
 * Available pricing strategies for token pricing.
 * See https://docs.noves.fi/reference/pricing-strategies for more details.
 */
export enum PriceType {
  /** Uses the liquidity pool with the highest liquidity to determine price */
  DEX_HIGHEST_LIQUIDITY = 'dexHighestLiquidity',
  /** Uses Coingecko as a price source */
  COINGECKO = 'coingecko',
  /** Uses Chainlink oracle as a price source */
  CHAINLINK = 'chainlink',
  /** Uses a custom strategy */
  CUSTOM = 'custom'
}



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
   * @returns {Promise<EVMPricingChains>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<EVMPricingChains> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
   * This is our main / general pricing endpoint.
   * It returns the price for any token or lpToken at the given block/timestamp. 
   * If no block or timestamp is passed, the price for the latest block will be returned.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} tokenAddress - The address of the token to retrieve pricing for.
   * @param {Object} [options] - Optional parameters for the request.
   * @param {PriceType|string} [options.priceType] - The type of price to retrieve (defaults to PriceType.DEX_HIGHEST_LIQUIDITY if not specified).
   *                                               See https://docs.noves.fi/reference/pricing-strategies for all available strategies.
   *                                               You can use the PriceType enum for convenient access to common strategies.
   * @param {number} [options.timestamp] - The timestamp for which to retrieve the price.
   * @param {number} [options.blockNumber] - The block number for which to retrieve the price.
   * @returns {Promise<EVMPricingResponse>} A promise that resolves to the pricing object.
   */
  public async getPrice(
    chain: string,
    tokenAddress: string,
    options?: {
      priceType?: PriceType | string;
      timestamp?: number;
      blockNumber?: number;
    }
  ): Promise<EVMPricingResponse> {
    const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
    let url = `${validatedChain}/price/${tokenAddress}`;

    const queryParams = new URLSearchParams();
    // Use dexHighestLiquidity as default if no priceType is specified
    const priceType = options?.priceType || 'dexHighestLiquidity';
    queryParams.append('priceType', priceType);
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
   * @returns {Promise<EVMPricingPoolResponse>} A promise that resolves to the pricing object.
   */
  public async getPriceFromPool(
    chain: string,
    poolAddress: string,    
    baseTokenAddress: string,
  ): Promise<EVMPricingPoolResponse> {
    const validatedChain = chain.toLowerCase() === 'ethereum' ? 'eth' : chain.toLowerCase();
    let url = `${validatedChain}/priceFromPool/${poolAddress}/${baseTokenAddress}`;

    const result = await this.request(url);
    return result.response;
  }

  /**
   * Pre-fetch prices for multiple tokens.
   * @param {Array<EVMPricingTokenPrefetchRequest>} tokens - An array of token objects to pre-fetch prices for.
   * @returns {Promise<Array<EVMPricingTokenPrefetchResult>>} A promise that resolves to an array of pricing results.
   * @description Takes an array of tokens that need pricing. Each token needs an address, a chain identifier, and the type of price desired.
   * Use the PriceType enum for convenient access to common pricing strategies.
   * For the 'chain' field, pull the list of valid names from the /chains endpoint.
   * Block number or timestamp are optional (you only need to pass one of those, or none if you want to pre-fetch the token for current time).
   * Returns an array of results for each token that you passed. If any of the results have a status of "findingSolution", 
   * you can call the regular /price endpoint for a final answer on that token in about ~2 minutes.
   */
  public async preFetchPrice(tokens: Array<EVMPricingTokenPrefetchRequest>): Promise<Array<EVMPricingTokenPrefetchResult>> {
    const url = 'preFetch';
    const result = await this.request(url, "POST", { body: JSON.stringify({ tokens }) });
    return result.response.tokens;
  }
}