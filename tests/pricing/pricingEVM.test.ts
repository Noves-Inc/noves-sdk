import { PricingEVM } from '../../src/pricing/pricingEVM';
import { createPricingClient } from '../../src/utils/apiUtils';

jest.mock('../../src/utils/apiUtils', () => ({
  createPricingClient: jest.fn(),
}));

describe('PricingEVM', () => {
  let pricingEVM: PricingEVM;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createPricingClient as jest.Mock).mockReturnValue(mockRequest);
    pricingEVM = new PricingEVM(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new PricingEVM('')).toThrow('API key is required');
    });

    it('should create a PricingEVM instance with a valid API key', () => {
      expect(pricingEVM).toBeInstanceOf(PricingEVM);
      expect(createPricingClient).toHaveBeenCalledWith('evm', mockApiKey);
    });
  });

  describe('getChains', () => {
    it('should return a list of chains', async () => {
      const mockChains = [
        {
          name: "eth",
          ecosystem: "evm",
          nativeCoin: {
            name: "ETH",
            symbol: "ETH",
            address: "ETH",
            decimals: 18
          }
        },
        {
          name: "bsc",
          ecosystem: "evm",
          nativeCoin: {
            name: "BNB",
            symbol: "BNB",
            address: "BNB",
            decimals: 18
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingEVM.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getPrice', () => {
    it('should return a price for a token', async () => {
      const mockPrice = {
        chain: 'eth',
        block: '22640795',
        token: {
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          symbol: 'WETH',
          name: 'Wrapped Ether'
        },
        price: {
          amount: '2482.5646628243689774470371336',
          currency: 'USD',
          status: 'resolved'
        },
        pricedBy: {
          poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
          exchange: {
            name: 'Uniswap'
          },
          liquidity: 110641728.42236452025287110906,
          baseToken: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            name: 'USD Coin'
          }
        },
        priceType: 'dexHighestLiquidity',
        priceStatus: 'resolved'
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingEVM.getPrice('eth', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('eth/price/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2?priceType=dexHighestLiquidity');
    });

    it('should transform "ethereum" to "eth"', async () => {
      const mockPrice = { /* price data */ };
      mockRequest.mockResolvedValue({ response: mockPrice });

      await pricingEVM.getPrice('ethereum', '0x1234567890123456789012345678901234567890');

      expect(mockRequest).toHaveBeenCalledWith('eth/price/0x1234567890123456789012345678901234567890?priceType=dexHighestLiquidity');
    });

    it('should append query parameters correctly', async () => {
      const mockPrice = { /* price data */ };
      mockRequest.mockResolvedValue({ response: mockPrice });

      await pricingEVM.getPrice(
        'eth',
        '0x1234567890123456789012345678901234567890',
        {
          priceType: 'dexHighestLiquidity',
          timestamp: 1625097600,
          blockNumber: 12345678
        }
      );

      expect(mockRequest).toHaveBeenCalledWith(
        'eth/price/0x1234567890123456789012345678901234567890?priceType=dexHighestLiquidity&timestamp=1625097600&blockNumber=12345678'
      );
    });
  });

  describe('getPriceFromPool', () => {
    it('should return the price from a specific pool', async () => {
      const mockPoolPrice = {
        chain: 'eth',
        exchange: {
          name: 'Uniswap'
        },
        poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
        baseToken: {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'WETH',
          name: 'Wrapped Ether',
          decimals: 18
        },
        quoteToken: {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6
        },
        price: {
          amount: '2426.971529'
        }
      };
      mockRequest.mockResolvedValue({ response: mockPoolPrice });

      const result = await pricingEVM.getPriceFromPool(
        'eth',
        '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      );

      expect(result).toEqual(mockPoolPrice);
      expect(mockRequest).toHaveBeenCalledWith(
        'eth/priceFromPool/0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      );
    });

    it('should transform "ethereum" to "eth"', async () => {
      const mockPoolPrice = { /* pool price data */ };
      mockRequest.mockResolvedValue({ response: mockPoolPrice });

      await pricingEVM.getPriceFromPool(
        'ethereum',
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901'
      );

      expect(mockRequest).toHaveBeenCalledWith(
        'eth/priceFromPool/0x1234567890123456789012345678901234567890/0x2345678901234567890123456789012345678901'
      );
    });
  });

  describe('preFetchPrice', () => {
    it('should pre-fetch prices for multiple tokens', async () => {
      const mockTokens = [
        {
          tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          chain: 'eth',
          priceType: 'dexHighestLiquidity'
        },
        {
          tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          chain: 'eth',
          priceType: 'coingecko',
          timestamp: 1625097600
        }
      ];
      const mockResults = [
        {
          request: {
            tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            chain: 'eth',
            priceType: 'dexHighestLiquidity',
            timestamp: null,
            blockNumber: 22640917
          },
          result: {
            blockNumber: 22640917,
            priceStatus: 'resolved',
            token: {
              symbol: 'USDC',
              name: 'USD Coin',
              decimals: 6,
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
            },
            price: '0.99973',
            priceType: 'ChainlinkStablePricer',
            pricedBy: null
          },
          error: null
        },
        {
          request: {
            tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            chain: 'eth',
            priceType: 'coingecko',
            timestamp: 1625097600,
            blockNumber: null
          },
          result: {
            blockNumber: 22640918,
            priceStatus: 'resolved',
            token: {
              symbol: 'WBTC',
              name: 'Wrapped BTC',
              decimals: 8,
              address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
            },
            price: '64250.00',
            priceType: 'coingecko',
            pricedBy: null
          },
          error: null
        }
      ];
      mockRequest.mockResolvedValue({ response: { tokens: mockResults } });

      const result = await pricingEVM.preFetchPrice(mockTokens);

      expect(result).toEqual(mockResults);
      expect(mockRequest).toHaveBeenCalledWith('preFetch', 'POST', {
        body: JSON.stringify({ tokens: mockTokens })
      });
    });

    it('should handle tokens with findingSolution status', async () => {
      const mockTokens = [
        {
          tokenAddress: '0x1234567890123456789012345678901234567890',
          chain: 'eth',
          priceType: 'dexHighestLiquidity'
        }
      ];
      const mockResults = [
        {
          request: {
            tokenAddress: '0x1234567890123456789012345678901234567890',
            chain: 'eth',
            priceType: 'dexHighestLiquidity',
            timestamp: null,
            blockNumber: 22640917
          },
          result: {
            blockNumber: 22640917,
            priceStatus: 'findingSolution',
            token: {
              symbol: 'TEST',
              name: 'Test Token',
              decimals: 18,
              address: '0x1234567890123456789012345678901234567890'
            },
            price: '0',
            priceType: 'dexHighestLiquidity',
            pricedBy: null
          },
          error: null
        }
      ];
      mockRequest.mockResolvedValue({ response: { tokens: mockResults } });

      const result = await pricingEVM.preFetchPrice(mockTokens);

      expect(result).toEqual(mockResults);
      expect(result[0].result?.priceStatus).toBe('findingSolution');
    });

    it('should handle error responses', async () => {
      const mockTokens = [
        {
          tokenAddress: '0xinvalidaddress',
          chain: 'eth',
          priceType: 'dexHighestLiquidity'
        }
      ];
      const mockResults = [
        {
          request: {
            tokenAddress: '0xinvalidaddress',
            chain: 'eth',
            priceType: 'dexHighestLiquidity',
            timestamp: null,
            blockNumber: null
          },
          result: null,
          error: 'Invalid token address'
        }
      ];
      mockRequest.mockResolvedValue({ response: { tokens: mockResults } });

      const result = await pricingEVM.preFetchPrice(mockTokens);

      expect(result).toEqual(mockResults);
      expect(result[0].error).toBe('Invalid token address');
      expect(result[0].result).toBeNull();
    });
  });
});
