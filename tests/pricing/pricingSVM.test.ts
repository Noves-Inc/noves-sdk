import { PricingSVM, PriceType } from '../../src/pricing/pricingSVM';
import { createPricingClient } from '../../src/utils/apiUtils';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';

jest.mock('../../src/utils/apiUtils', () => ({
  createPricingClient: jest.fn(),
}));

describe('PricingSVM', () => {
  let pricingSVM: PricingSVM;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createPricingClient as jest.Mock).mockReturnValue(mockRequest);
    pricingSVM = new PricingSVM(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new PricingSVM('')).toThrow('API key is required');
    });

    it('should create a PricingSVM instance with a valid API key', () => {
      expect(pricingSVM).toBeInstanceOf(PricingSVM);
      expect(createPricingClient).toHaveBeenCalledWith('svm', mockApiKey);
    });
  });

  describe('getChains', () => {
    it('should return a list of chains', async () => {
      const mockChains = [
        {
          name: "solana",
          ecosystem: "svm",
          nativeCoin: {
            name: "SOL",
            symbol: "SOL",
            address: "SOL",
            decimals: 9
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingSVM.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [
        {
          name: "solana",
          ecosystem: "svm",
          nativeCoin: {
            name: "SOL",
            symbol: "SOL",
            address: "SOL",
            decimals: 9
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingSVM.getChain('solana');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should transform "Solana" to "solana" when looking for a chain', async () => {
      const mockChains = [
        {
          name: "solana",
          ecosystem: "svm",
          nativeCoin: {
            name: "SOL",
            symbol: "SOL",
            address: "SOL",
            decimals: 9
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingSVM.getChain('Solana');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingSVM.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  describe('getPrice', () => {
    it('should return a price for a token', async () => {
      const mockPrice = {
        chain: 'solana',
        token: {
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          name: 'USD Coin'
        },
        price: {
          amount: '1.0',
          currency: 'USD',
          status: 'success'
        },
        pricedBy: 'dex',
        priceType: 'dexHighestLiquidity',
        priceStatus: 'success'
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingSVM.getPrice('solana', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith('solana/price/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?priceType=dexHighestLiquidity');
    });

    it('should transform "Solana" to "solana"', async () => {
      const mockPrice = { /* price data */ };
      mockRequest.mockResolvedValue({ response: mockPrice });

      await pricingSVM.getPrice('Solana', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

      expect(mockRequest).toHaveBeenCalledWith('solana/price/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?priceType=dexHighestLiquidity');
    });

    it('should append query parameters correctly', async () => {
      const mockPrice = { /* price data */ };
      mockRequest.mockResolvedValue({ response: mockPrice });

      await pricingSVM.getPrice(
        'solana',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        {
          priceType: 'dexHighestLiquidity',
          timestamp: 1625097600
        }
      );

      expect(mockRequest).toHaveBeenCalledWith(
        'solana/price/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?priceType=dexHighestLiquidity&timestamp=1625097600'
      );
    });

    it('should use weighted volume average price type correctly', async () => {
      const mockPrice = {
        chain: 'solana',
        token: {
          address: 'So11111111111111111111111111111111111111112',
          symbol: 'WSOL',
          name: 'Wrapped SOL'
        },
        price: {
          amount: '171.31',
          currency: 'USD',
          status: 'resolved'
        },
        priceType: 'weightedVolumeAverage',
        priceStatus: 'resolved'
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingSVM.getPrice(
        'solana',
        'So11111111111111111111111111111111111111112',
        {
          priceType: PriceType.WEIGHTED_VOLUME_AVERAGE
        }
      );

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith(
        'solana/price/So11111111111111111111111111111111111111112?priceType=weightedVolumeAverage'
      );
    });
  });
}); 