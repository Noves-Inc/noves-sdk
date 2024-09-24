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
      const mockChains = [{ name: 'cosmoshub', ecosystem: 'cosmos' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingCosmos.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [{ name: 'cosmoshub', ecosystem: 'cosmos' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingCosmos.getChain('cosmoshub');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingCosmos.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  // Add more tests for getPriceFromPool method
});
