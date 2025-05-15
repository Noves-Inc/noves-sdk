import { PricingCosmos } from '../../src/pricing/pricingCosmos';
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
      const mockChains = [
        {
          name: "secret",
          ecosystem: "cosmos",
          nativeCoin: {
            name: "SCRT",
            symbol: "SCRT",
            address: "SCRT",
            decimals: 6
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingCosmos.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [
        {
          name: "secret",
          ecosystem: "cosmos",
          nativeCoin: {
            name: "SCRT",
            symbol: "SCRT",
            address: "SCRT",
            decimals: 6
          }
        }
      ];
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

  describe('getPriceFromPool', () => {
    it('should get price from pool', async () => {
      const mockPrice = {
        chain: "secret",
        exchange: { name: "Osmosis" },
        poolAddress: "0x...",
        baseToken: {
          address: "0x...",
          symbol: "SCRT",
          name: "Secret",
          decimals: 6
        },
        quoteToken: {
          address: "0x...",
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6
        },
        price: { amount: "1.5" }
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingCosmos.getPriceFromPool('secret', '0x...', '0x...');

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('secret/priceFromPool/0x.../0x...');
    });
  });
});
