// src/pricing/pricingCosmos.ts

import { COSMOSPricingChain, COSMOSPricingChainsResponse, COSMOSPricingPoolPricing } from '../types/cosmos';
import { createPricingClient } from '../utils/apiUtils';

const ECOSYSTEM = 'cosmos';

/**
 * Class representing the Cosmos pricing module.
 */
export class PricingCosmos {
  private request: ReturnType<typeof createPricingClient>;

  /**
   * Create a PricingCosmos instance.
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
   * Returns a list with the names of the Cosmos blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<COSMOSPricingChainsResponse>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<COSMOSPricingChainsResponse> {
    const result = await this.request('chains');
    return result.response;
  }



  /**
   * Given a liquidity pool address and a token address, returns the current price for the requested token (baseToken) in the pool, 
   * in terms of the other token (quoteToken) in the pool.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} poolAddress - The address of the pool to retrieve pricing for.
   * @param {string} baseTokenAddress - The address of the base token to retrieve pricing for.
   * @returns {Promise<COSMOSPricingPoolPricing>} A promise that resolves to the pricing object.
   */
  public async getPriceFromPool(
    chain: string,
    poolAddress: string,    
    baseTokenAddress: string,
  ): Promise<COSMOSPricingPoolPricing> {
    let url = `${chain}/priceFromPool/${poolAddress}/${baseTokenAddress}`;

    const result = await this.request(url);
    return result.response;
  }
}
