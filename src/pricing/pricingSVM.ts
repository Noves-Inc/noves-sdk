import { SVMPricingChainsResponse, SVMPricingPrice } from '../types/svm';
import { createPricingClient } from '../utils/apiUtils';
import { RetryConfig } from '../types/common';

const ECOSYSTEM = 'svm';

/**
 * Available pricing strategies for token pricing.
 * See https://docs.noves.fi/reference/pricing-strategies for more details.
 */
export enum PriceType {
  /** Uses the liquidity pool with the highest liquidity to determine price */
  DEX_HIGHEST_LIQUIDITY = 'dexHighestLiquidity',
  /** Uses Coingecko as a price source */
  COINGECKO = 'coingecko',
  /** Uses a custom strategy */
  CUSTOM = 'custom',
  /** Uses a weighted volume average across exchanges */
  WEIGHTED_VOLUME_AVERAGE = 'weightedVolumeAverage'
}

/**
 * Class representing the SVM pricing module.
 */
export class PricingSVM {
  private request: ReturnType<typeof createPricingClient>;

  /**
   * Create a PricingSVM instance.
   * @param {string} apiKey - The API key to authenticate requests.
   * @param {Partial<RetryConfig>} [retryConfig] - Optional retry configuration for enhanced resilience.
   * @throws Will throw an error if the API key is not provided.
   */
  constructor(apiKey: string, retryConfig?: Partial<RetryConfig>) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.request = createPricingClient(ECOSYSTEM, apiKey, retryConfig);
  }

  /**
   * Returns a list with the names of the SVM blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<SVMPricingChainsResponse>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<SVMPricingChainsResponse> {
    const result = await this.request('chains');
    return result.response;
  }



  /**
   * This is our main / general pricing endpoint.
   * It returns the price for any token at the given timestamp.
   * If no timestamp is passed, the price for the latest block will be returned.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} tokenAddress - The address of the token to retrieve pricing for.
   * @param {Object} [options] - Optional parameters for the request.
   * @param {PriceType|string} [options.priceType] - The type of price to retrieve (defaults to PriceType.DEX_HIGHEST_LIQUIDITY if not specified).
   *                                               See https://docs.noves.fi/reference/pricing-strategies for all available strategies.
   *                                               You can use the PriceType enum for convenient access to common strategies.
   * @param {number} [options.timestamp] - The timestamp for which to retrieve the price.
   * @returns {Promise<Pricing>} A promise that resolves to the pricing object.
   */
  public async getPrice(
    chain: string,
    tokenAddress: string,
    options?: {
      priceType?: PriceType | string;
      timestamp?: number;
    }
  ): Promise<SVMPricingPrice> {
    // Handle common chain name variants
    const chainName = chain.toLowerCase() === 'solana' ? 'solana' : chain.toLowerCase();
    
    const priceType = options?.priceType || PriceType.DEX_HIGHEST_LIQUIDITY;
    
    let endpoint = `${chainName}/price/${tokenAddress}?priceType=${priceType}`;
    
    if (options?.timestamp) {
      endpoint += `&timestamp=${options.timestamp}`;
    }
    
    const result = await this.request(endpoint);
    return result.response;
  }
} 