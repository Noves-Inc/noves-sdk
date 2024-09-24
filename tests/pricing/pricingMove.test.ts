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
      const mockChains = [{ name: 'aptos', ecosystem: 'move' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingMove.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [{ name: 'aptos', ecosystem: 'move' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingMove.getChain('aptos');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingMove.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  // Add more tests for getPriceFromPool method
});
