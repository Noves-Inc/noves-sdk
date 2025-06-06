import { PricingCosmos } from '../../src/pricing/pricingCosmos';
import { createPricingClient } from '../../src/utils/apiUtils';
import { COSMOSPricingChain, COSMOSPricingPoolPricing } from '../../src/types/cosmos';

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
      const mockChains: COSMOSPricingChain[] = [
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



  describe('getPriceFromPool', () => {
    it('should get price from pool', async () => {
      const mockPrice: COSMOSPricingPoolPricing = {
        chain: "secret",
        exchange: { name: null },
        poolAddress: "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj",
        baseToken: {
          address: "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          symbol: "SHD",
          name: "Shade",
          decimals: 8
        },
        quoteToken: {
          address: "secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
          symbol: "SILK",
          name: "Silk Stablecoin",
          decimals: 6
        },
        price: { amount: "0.613678" }
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingCosmos.getPriceFromPool(
        'secret', 
        'secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj', 
        'secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm'
      );

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('secret/priceFromPool/secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj/secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm');
    });
  });
});
