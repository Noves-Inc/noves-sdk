import { PricingUTXO, PriceType } from '../../src/pricing/pricingUTXO';
import { createPricingClient } from '../../src/utils/apiUtils';

jest.mock('../../src/utils/apiUtils', () => ({
  createPricingClient: jest.fn(),
}));

describe('PricingUTXO', () => {
  let pricingUTXO: PricingUTXO;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createPricingClient as jest.Mock).mockReturnValue(mockRequest);
    pricingUTXO = new PricingUTXO(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new PricingUTXO('')).toThrow('API key is required');
    });

    it('should create a PricingUTXO instance with a valid API key', () => {
      expect(pricingUTXO).toBeInstanceOf(PricingUTXO);
      expect(createPricingClient).toHaveBeenCalledWith('utxo', mockApiKey);
    });
  });

  describe('getChains', () => {
    it('should return a list of UTXO chains', async () => {
      const mockChains = [
        {
          name: "btc",
          ecosystem: "utxo",
          nativeCoin: {
            name: "BTC",
            symbol: "BTC",
            address: "BTC",
            decimals: 8
          }
        },
        {
          name: "cardano",
          ecosystem: "utxo",
          nativeCoin: {
            name: "ADA",
            symbol: "ADA",
            address: "ADA",
            decimals: 6
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingUTXO.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should handle empty chains response', async () => {
      const mockChains: any[] = [];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingUTXO.getChains();

      expect(result).toEqual(mockChains);
      expect(result).toHaveLength(0);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockRequest.mockRejectedValue(mockError);

      await expect(pricingUTXO.getChains()).rejects.toThrow('API Error');
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getPrice', () => {
    it('should return pricing data for a token with default options', async () => {
      const mockPriceResponse = {
        chain: "btc",
        token: {
          symbol: "BTC",
          name: "Bitcoin",
          address: "btc",
          decimals: 8
        },
        price: {
          amount: "103780.71410240",
          currency: "USD",
          status: "resolved"
        },
        priceType: "weightedVolumeAverage",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const result = await pricingUTXO.getPrice('btc', 'bitcoin');

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith('btc/price/bitcoin?priceType=weightedVolumeAverage');
    });

    it('should handle bitcoin chain name variant', async () => {
      const mockPriceResponse = {
        chain: "btc",
        token: {
          symbol: "BTC",
          name: "Bitcoin",
          address: "btc",
          decimals: 8
        },
        price: {
          amount: "103780.71410240",
          currency: "USD",
          status: "resolved"
        },
        priceType: "weightedVolumeAverage",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const result = await pricingUTXO.getPrice('bitcoin', 'bitcoin');

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith('btc/price/bitcoin?priceType=weightedVolumeAverage');
    });

    it('should use custom price type when provided', async () => {
      const mockPriceResponse = {
        chain: "btc",
        token: {
          symbol: "BTC",
          name: "Bitcoin",
          address: "btc",
          decimals: 8
        },
        price: {
          amount: "103780.71410240",
          currency: "USD",
          status: "resolved"
        },
        priceType: "coingecko",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const result = await pricingUTXO.getPrice('btc', 'bitcoin', { 
        priceType: PriceType.COINGECKO 
      });

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith('btc/price/bitcoin?priceType=coingecko');
    });

    it('should include timestamp parameter when provided', async () => {
      const mockPriceResponse = {
        chain: "btc",
        token: {
          symbol: "BTC",
          name: "Bitcoin",
          address: "btc",
          decimals: 8
        },
        price: {
          amount: "103780.71410240",
          currency: "USD",
          status: "resolved"
        },
        priceType: "weightedVolumeAverage",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const timestamp = 1640995200;
      const result = await pricingUTXO.getPrice('btc', 'bitcoin', { 
        timestamp 
      });

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith(`btc/price/bitcoin?priceType=weightedVolumeAverage&timestamp=${timestamp}`);
    });

    it('should include both price type and timestamp when provided', async () => {
      const mockPriceResponse = {
        chain: "btc",
        token: {
          symbol: "BTC",
          name: "Bitcoin",
          address: "btc",
          decimals: 8
        },
        price: {
          amount: "103780.71410240",
          currency: "USD",
          status: "resolved"
        },
        priceType: "dexHighestLiquidity",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const timestamp = 1640995200;
      const result = await pricingUTXO.getPrice('btc', 'bitcoin', { 
        priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
        timestamp 
      });

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith(`btc/price/bitcoin?priceType=dexHighestLiquidity&timestamp=${timestamp}`);
    });

    it('should handle custom price type string', async () => {
      const mockPriceResponse = {
        chain: "btc",
        token: {
          symbol: "BTC",
          name: "Bitcoin",
          address: "btc",
          decimals: 8
        },
        price: {
          amount: "103780.71410240",
          currency: "USD",
          status: "resolved"
        },
        priceType: "custom",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const result = await pricingUTXO.getPrice('btc', 'bitcoin', { 
        priceType: 'custom' 
      });

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith('btc/price/bitcoin?priceType=custom');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockRequest.mockRejectedValue(mockError);

      await expect(pricingUTXO.getPrice('btc', 'bitcoin')).rejects.toThrow('API Error');
      expect(mockRequest).toHaveBeenCalledWith('btc/price/bitcoin?priceType=weightedVolumeAverage');
    });

    it('should handle other chain types correctly', async () => {
      const mockPriceResponse = {
        chain: "ltc",
        token: {
          symbol: "LTC",
          name: "Litecoin",
          address: "ltc",
          decimals: 8
        },
        price: {
          amount: "85.50",
          currency: "USD",
          status: "resolved"
        },
        priceType: "weightedVolumeAverage",
        priceStatus: "resolved"
      };
      mockRequest.mockResolvedValue({ response: mockPriceResponse });

      const result = await pricingUTXO.getPrice('ltc', 'litecoin');

      expect(result).toEqual(mockPriceResponse);
      expect(mockRequest).toHaveBeenCalledWith('ltc/price/litecoin?priceType=weightedVolumeAverage');
    });
  });
}); 