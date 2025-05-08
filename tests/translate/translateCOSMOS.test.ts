import { TranslateCOSMOS } from '../../src/translate/translateCOSMOS';
import { createTranslateClient } from '../../src/utils/apiUtils';
import { TransactionError } from '../../src/errors/TransactionError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { CosmosAddressError, CosmosTransactionJobError } from '../../src/errors/CosmosError';

jest.mock('../../src/utils/apiUtils');
jest.setTimeout(10000);

describe('TranslateCOSMOS', () => {
  let translateCOSMOS: TranslateCOSMOS;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();
  const validCosmosAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';

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

      const result = await translateCOSMOS.Transactions(mockChain, validCosmosAddress, mockPageOptions);

      expect(result).toBeInstanceOf(TransactionsPage);
      expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining(`${mockChain}/txs/${validCosmosAddress}`));
    });

    it('should throw TransactionError on validation errors', async () => {
      const mockError = new Response(JSON.stringify({ status: 400, errors: ['Invalid account'] }));
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.Transactions(mockChain, validCosmosAddress, mockPageOptions)).rejects.toThrow(TransactionError);
    });

    it('should throw generic error on non-validation errors', async () => {
      const mockError = new Error('Network error');
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.Transactions(mockChain, validCosmosAddress, mockPageOptions)).rejects.toThrow('Network error');
    });
  });

  describe('getTokenBalances', () => {
    const mockChain = 'cosmoshub';

    it('should return token balances', async () => {
      const mockBalances = {
        accountAddress: validCosmosAddress,
        balances: [{
          token: {
            symbol: 'ATOM',
            name: 'Cosmos',
            decimals: 6,
            address: 'uatom'
          },
          balance: '1000000'
        }]
      };
      mockRequest.mockResolvedValueOnce({ response: mockBalances });

      const result = await translateCOSMOS.getTokenBalances(mockChain, validCosmosAddress);

      expect(result).toEqual(mockBalances);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/tokens/balancesOf/${validCosmosAddress}`);
    });

    it('should throw CosmosAddressError for invalid address', async () => {
      await expect(translateCOSMOS.getTokenBalances(mockChain, 'invalid-address'))
        .rejects.toThrow(CosmosAddressError);
    });

    it('should throw TransactionError on validation errors', async () => {
      const mockError = new Response(JSON.stringify({ status: 400, errors: ['Invalid address'] }));
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.getTokenBalances(mockChain, validCosmosAddress))
        .rejects.toThrow(TransactionError);
    });
  });

  describe('startTransactionJob', () => {
    const mockChain = 'cosmoshub';

    it('should start a transaction job', async () => {
      const mockJob = {
        jobId: 'job123',
        status: 'pending',
        pageId: 'page123'
      };
      mockRequest.mockResolvedValueOnce({ response: mockJob });

      const result = await translateCOSMOS.startTransactionJob(mockChain, validCosmosAddress);

      expect(result).toEqual(mockJob);
      expect(mockRequest).toHaveBeenCalledWith(
        `${mockChain}/txs/job/start`,
        'POST',
        expect.objectContaining({
          body: JSON.stringify({ accountAddress: validCosmosAddress })
        })
      );
    });

    it('should throw CosmosAddressError for invalid address', async () => {
      await expect(translateCOSMOS.startTransactionJob(mockChain, 'invalid-address'))
        .rejects.toThrow(CosmosAddressError);
    });

    it('should throw TransactionError on validation errors', async () => {
      const mockError = new Response(JSON.stringify({ status: 400, errors: ['Invalid address'] }));
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.startTransactionJob(mockChain, validCosmosAddress))
        .rejects.toThrow(TransactionError);
    });
  });

  describe('getTransactionJobResults', () => {
    const mockChain = 'cosmoshub';
    const mockPageId = 'page123';

    it('should return job results', async () => {
      const mockResults = {
        items: [{ hash: 'tx1' }, { hash: 'tx2' }],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      };
      mockRequest.mockResolvedValueOnce({ response: mockResults });

      const result = await translateCOSMOS.getTransactionJobResults(mockChain, mockPageId);

      expect(result).toEqual(mockResults);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/txs/job/${mockPageId}`);
    });

    it('should throw CosmosTransactionJobError if job failed', async () => {
      const mockFailedJob = {
        status: 'failed',
        error: 'Job failed'
      };
      mockRequest.mockResolvedValueOnce({ response: mockFailedJob });

      await expect(translateCOSMOS.getTransactionJobResults(mockChain, mockPageId))
        .rejects.toThrow(CosmosTransactionJobError);
    });

    it('should throw TransactionError on validation errors', async () => {
      const mockError = new Response(JSON.stringify({ status: 400, errors: ['Invalid page ID'] }));
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(translateCOSMOS.getTransactionJobResults(mockChain, mockPageId))
        .rejects.toThrow(TransactionError);
    });
  });
});