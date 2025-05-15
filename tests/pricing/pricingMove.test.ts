import { PricingMove } from '../../src/pricing/pricingMove';
import { createPricingClient } from '../../src/utils/apiUtils';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';

jest.mock('../../src/utils/apiUtils', () => ({
  createPricingClient: jest.fn(),
}));

describe('PricingMove', () => {
  let pricingMove: PricingMove;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createPricingClient as jest.Mock).mockReturnValue(mockRequest);
    pricingMove = new PricingMove(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new PricingMove('')).toThrow('API key is required');
    });

    it('should create a PricingMove instance with a valid API key', () => {
      expect(pricingMove).toBeInstanceOf(PricingMove);
      expect(createPricingClient).toHaveBeenCalledWith('move', mockApiKey);
    });
  });

  describe('getChains', () => {
    it('should return a list of chains', async () => {
      const mockChains = [
        {
          name: "sui",
          ecosystem: "move",
          nativeCoin: {
            name: "SUI",
            symbol: "SUI",
            address: "SUI",
            decimals: 9
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingMove.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [
        {
          name: "sui",
          ecosystem: "move",
          nativeCoin: {
            name: "SUI",
            symbol: "SUI",
            address: "SUI",
            decimals: 9
          }
        }
      ];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingMove.getChain('sui');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingMove.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  describe('getPriceFromPool', () => {
    it('should get price from pool', async () => {
      const mockPrice = {
        chain: "sui",
        exchange: { name: "Aftermath Finance" },
        poolAddress: "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
        baseToken: {
          address: "0x2::sui::SUI",
          symbol: "SUI",
          name: "Sui",
          decimals: 9
        },
        quoteToken: {
          address: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
          symbol: "BUCK",
          name: "Bucket USD",
          decimals: 9
        },
        price: { amount: "3.857618395" }
      };
      mockRequest.mockResolvedValue({ response: mockPrice });

      const result = await pricingMove.getPriceFromPool(
        'sui',
        '0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026',
        '0x2::sui::SUI'
      );

      expect(result).toEqual(mockPrice);
      expect(mockRequest).toHaveBeenCalledWith(
        'sui/priceFromPool/0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026/0x2::sui::SUI'
      );
    });
  });
});
