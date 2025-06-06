import { UTXOPricingChainsResponse, UTXOPricingPrice } from '../types/utxo';
import { createPricingClient } from '../utils/apiUtils';

const ECOSYSTEM = 'utxo';

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
 * Class representing the UTXO pricing module.
 */
export class PricingUTXO {
  private request: ReturnType<typeof createPricingClient>;

  /**
   * Create a PricingUTXO instance.
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
   * Returns a list with the names of the UTXO blockchains currently supported by this API. 
   * Use the provided chain name when calling other methods.
   * @returns {Promise<UTXOPricingChainsResponse>} A promise that resolves to an array of chains.
   */
  public async getChains(): Promise<UTXOPricingChainsResponse> {
    const result = await this.request('chains');
    return result.response;
  }

  /**
   * This is our main / general pricing endpoint.
   * It returns the price for any token at the given timestamp.
   * If no timestamp is passed, the price for the latest block will be returned.
   * @param {string} chain - The name of the chain to retrieve pricing for.
   * @param {string} token - The token identifier to retrieve pricing for.
   * @param {Object} [options] - Optional parameters for the request.
   * @param {PriceType|string} [options.priceType] - The type of price to retrieve (defaults to PriceType.WEIGHTED_VOLUME_AVERAGE if not specified).
   *                                               See https://docs.noves.fi/reference/pricing-strategies for all available strategies.
   *                                               You can use the PriceType enum for convenient access to common strategies.
   * @param {number} [options.timestamp] - The timestamp for which to retrieve the price.
   * @returns {Promise<UTXOPricingPrice>} A promise that resolves to the pricing object.
   */
  public async getPrice(
    chain: string,
    token: string,
    options?: {
      priceType?: PriceType | string;
      timestamp?: number;
    }
  ): Promise<UTXOPricingPrice> {
    // Handle common chain name variants
    const chainName = chain.toLowerCase() === 'bitcoin' ? 'btc' : chain.toLowerCase();
    
    const priceType = options?.priceType || PriceType.WEIGHTED_VOLUME_AVERAGE;
    
    let endpoint = `${chainName}/price/${token}?priceType=${priceType}`;
    
    if (options?.timestamp) {
      endpoint += `&timestamp=${options.timestamp}`;
    }
    
    const result = await this.request(endpoint);
    return result.response;
  }
} 