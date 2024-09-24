import { TranslateCOSMOS } from '../../src/translate/translateCOSMOS';
import { createTranslateClient } from '../../src/utils/apiUtils';
import { TransactionError } from '../../src/errors/TransactionError';
import { TransactionsPage } from '../../src/translate/transactionsPage';

jest.mock('../../src/utils/apiUtils');
jest.setTimeout(10000);

describe('TranslateCOSMOS', () => {
  let translateCOSMOS: TranslateCOSMOS;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createTranslateClient as jest.Mock).mockReturnValue(mockRequest);
    translateCOSMOS = new TranslateCOSMOS(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance with a valid API key', () => {
    expect(translateCOSMOS).toBeInstanceOf(TranslateCOSMOS);
    expect(createTranslateClient).toHaveBeenCalledWith('cosmos', mockApiKey);
  });

  it('should throw an error if API key is not provided', () => {
    expect(() => new TranslateCOSMOS('')).toThrow('API key is required');
  });

  describe('getChains', () => {
    it('should return a list of chains', async () => {
      const mockChains = [{ name: 'cosmos' }, { name: 'osmosis' }];
      mockRequest.mockResolvedValueOnce({ response: mockChains });

      const result = await translateCOSMOS.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getTransaction', () => {
    const mockChain = 'cosmos';
    const mockTxHash = 'mock-tx-hash';

    it('should return transaction details', async () => {
      const mockTransaction = { hash: mockTxHash, details: 'mock-details' };
      mockRequest.mockResolvedValueOnce({ response: mockTransaction });

      const result = await translateCOSMOS.getTransaction(mockChain, mockTxHash);

      expect(result).toEqual(mockTransaction);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/tx/${mockTxHash}`);
    });

    it('should throw TransactionError on validation errors', async () => {
      const mockError = new Response(JSON.stringify({ status: 400, errors: ['Invalid transaction'] }));
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.getTransaction(mockChain, mockTxHash)).rejects.toThrow(TransactionError);
    });

    it('should throw generic error on non-validation errors', async () => {
      const mockError = new Error('Network error');
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.getTransaction(mockChain, mockTxHash)).rejects.toThrow('Network error');
    });
  });

  describe('Transactions', () => {
    const mockChain = 'cosmos';
    const mockAccountAddress = 'mock-account-address';
    const mockPageOptions = { pageSize: 10 };

    it('should return a TransactionsPage instance', async () => {
      const mockResponse = {
        response: {
          items: [{ hash: 'tx1' }, { hash: 'tx2' }],
          hasNextPage: true,
          nextPageUrl: 'https://api.example.com/next-page',
        },
      };
      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await translateCOSMOS.Transactions(mockChain, mockAccountAddress, mockPageOptions);

      expect(result).toBeInstanceOf(TransactionsPage);
      expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining(`${mockChain}/txs/${mockAccountAddress}`));
    });

    it('should throw TransactionError on validation errors', async () => {
      const mockError = new Response(JSON.stringify({ status: 400, errors: ['Invalid account'] }));
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.Transactions(mockChain, mockAccountAddress, mockPageOptions)).rejects.toThrow(TransactionError);
    });

    it('should throw generic error on non-validation errors', async () => {
      const mockError = new Error('Network error');
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.Transactions(mockChain, mockAccountAddress, mockPageOptions)).rejects.toThrow('Network error');
    });
  });
});