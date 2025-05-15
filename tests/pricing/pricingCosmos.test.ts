import { PricingCosmos, PriceType } from '../../src/pricing/pricingCosmos';
import { createPricingClient } from '../../src/utils/apiUtils';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';

jest.mock('../../src/utils/apiUtils', () => ({
  createPricingClient: jest.fn(),
}));

describe('PricingCosmos', () => {
  let pricingCosmos: PricingCosmos;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createPricingClient as jest.Mock).mockReturnValue(mockRequest);
    pricingCosmos = new PricingCosmos(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new PricingCosmos('')).toThrow('API key is required');
    });

    it('should create a PricingCosmos instance with a valid API key', () => {
      expect(pricingCosmos).toBeInstanceOf(PricingCosmos);
      expect(createPricingClient).toHaveBeenCalledWith('cosmos', mockApiKey);
    });
  });

  describe('getChains', () => {
    it('should return a list of chains', async () => {
      const mockChains = [{ name: 'secret', ecosystem: 'cosmos', nativeCoin: { name: 'SCRT', symbol: 'SCRT', address: 'SCRT', decimals: 6 } }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingCosmos.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [{ name: 'secret', ecosystem: 'cosmos', nativeCoin: { name: 'SCRT', symbol: 'SCRT', address: 'SCRT', decimals: 6 } }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingCosmos.getChain('secret');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingCosmos.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  describe('getPrice', () => {
    it('should return price for a token', async () => {
      const mockPrice = { price: 1.5, timestamp: 1234567890 };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingCosmos.getPrice('secret', 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek');

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('secret/price/secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek');
    });

    it('should include price type in request when specified', async () => {
      const mockPrice = { price: 1.5, timestamp: 1234567890 };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingCosmos.getPrice('secret', 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek', {
        priceType: PriceType.DEX_HIGHEST_LIQUIDITY
      });

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('secret/price/secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek?priceType=dexHighestLiquidity');
    });

    it('should include timestamp in request when specified', async () => {
      const mockPrice = { price: 1.5, timestamp: 1234567890 };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingCosmos.getPrice('secret', 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek', {
        timestamp: 1234567890
      });

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('secret/price/secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek?timestamp=1234567890');
    });

    it('should include both price type and timestamp in request when both are specified', async () => {
      const mockPrice = { price: 1.5, timestamp: 1234567890 };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingCosmos.getPrice('secret', 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek', {
        priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
        timestamp: 1234567890
      });

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('secret/price/secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek?priceType=dexHighestLiquidity&timestamp=1234567890');
    });
  });

  describe('getPriceFromPool', () => {
    it('should return price from pool', async () => {
      const mockPoolPrice = {
        chain: 'secret',
        exchange: {
          name: 'Shade Protocol'
        },
        poolAddress: 'secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj',
        baseToken: {
          address: 'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm',
          symbol: 'SHD',
          name: 'Shade',
          decimals: 8
        },
        quoteToken: {
          address: 'secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd',
          symbol: 'SILK',
          name: 'Silk Stablecoin',
          decimals: 6
        },
        price: {
          amount: '0.742376'
        }
      };
      mockRequest.mockResolvedValue({ response: mockPoolPrice });

      const result = await pricingCosmos.getPriceFromPool(
        'secret',
        'secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj',
        'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
      );

      expect(result).toEqual(mockPoolPrice);
      expect(mockRequest).toHaveBeenCalledWith(
        'secret/priceFromPool/secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj/secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
      );
    });

    it('should handle null values in response', async () => {
      const mockPoolPrice = {
        chain: null,
        exchange: {
          name: null
        },
        poolAddress: null,
        baseToken: {
          address: null,
          symbol: null,
          name: null,
          decimals: null
        },
        quoteToken: {
          address: null,
          symbol: null,
          name: null,
          decimals: null
        },
        price: {
          amount: null
        }
      };
      mockRequest.mockResolvedValue({ response: mockPoolPrice });

      const result = await pricingCosmos.getPriceFromPool(
        'secret',
        'secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj',
        'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
      );

      expect(result).toEqual(mockPoolPrice);
    });
  });
});
