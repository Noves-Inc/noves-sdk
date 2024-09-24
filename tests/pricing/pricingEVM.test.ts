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
      const mockChains = [{ name: 'ethereum', evmChainId: 1, ecosystem: 'evm' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingEVM.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getChain', () => {
    it('should return a specific chain', async () => {
      const mockChains = [{ name: 'eth', evmChainId: 1, ecosystem: 'evm' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await pricingEVM.getChain('eth');

      expect(result).toEqual(mockChains[0]);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should throw ChainNotFoundError if chain is not found', async () => {
      mockRequest.mockResolvedValue({ response: [] });

      await expect(pricingEVM.getChain('invalid-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  // Add more tests for getPrice, getPriceFromPool, and preFetchPrice methods
});
