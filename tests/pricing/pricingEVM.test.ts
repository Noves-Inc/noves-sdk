import { PricingEVM } from '../../src/pricing/pricingEVM';
import { createPricingClient } from '../../src/utils/apiUtils';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';

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

  describe('getChain', () => {
    it('should return a specific chain', async () => {
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

      const result = await pricingEVM.getChain('eth');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should transform "ethereum" to "eth" when looking for a chain', async () => {
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
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingEVM.getChain('ethereum');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingEVM.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  describe('getPrice', () => {
    it('should return a price for a token', async () => {
      const mockPrice = {
        chain: 'eth',
        block: '12345678',
        token: {
          address: '0x1234567890123456789012345678901234567890',
          symbol: 'TOKEN',
          name: 'Test Token'
        },
        price: {
          amount: '1.234',
          currency: 'USD',
          status: 'success'
        },
        pricedBy: 'dex',
        priceType: 'dexHighestLiquidity',
        priceStatus: 'success'
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingEVM.getPrice('eth', '0x1234567890123456789012345678901234567890');

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('eth/price/0x1234567890123456789012345678901234567890?priceType=dexHighestLiquidity');
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
          name: 'Uniswap V3'
        },
        poolAddress: '0x1234567890123456789012345678901234567890',
        baseToken: {
          address: '0x2345678901234567890123456789012345678901',
          symbol: 'BASE',
          name: 'Base Token',
          decimals: 18
        },
        quoteToken: {
          address: '0x3456789012345678901234567890123456789012',
          symbol: 'QUOTE',
          name: 'Quote Token',
          decimals: 18
        },
        price: {
          amount: '1.234'
        }
      };
      mockRequest.mockResolvedValue({ response: mockPoolPrice });

      const result = await pricingEVM.getPriceFromPool(
        'eth',
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901'
      );

      expect(result).toEqual(mockPoolPrice);
      expect(mockRequest).toHaveBeenCalledWith(
        'eth/priceFromPool/0x1234567890123456789012345678901234567890/0x2345678901234567890123456789012345678901'
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
          tokenAddress: '0x1234567890123456789012345678901234567890',
          chain: 'eth',
          priceType: 'dexHighestLiquidity' as const
        },
        {
          tokenAddress: '0x2345678901234567890123456789012345678901',
          chain: 'bsc',
          priceType: 'coingecko' as const,
          timestamp: 1625097600
        }
      ];
      const mockResults = [
        { /* price data for token 1 */ },
        { /* price data for token 2 */ }
      ];
      mockRequest.mockResolvedValue({ response: { tokens: mockResults } });

      const result = await pricingEVM.preFetchPrice(mockTokens);

      expect(result).toEqual(mockResults);
      expect(mockRequest).toHaveBeenCalledWith('preFetch', 'POST', {
        body: JSON.stringify({ tokens: mockTokens })
      });
    });
  });
});
