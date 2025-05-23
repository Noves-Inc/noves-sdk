import { TranslateCOSMOS } from '../../src/translate/translateCOSMOS';
import { TransactionError } from '../../src/errors/TransactionError';
import { CosmosAddressError } from '../../src/errors/CosmosError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { Transaction, CosmosTokenBalance, PageOptions, CosmosBalancesResponse } from '../../src/types/types';

jest.setTimeout(30000);

describe('TranslateCOSMOS', () => {
  let translateCOSMOS: TranslateCOSMOS;
  let mockRequest: jest.Mock;
  const apiKey = process.env.API_KEY;
  const validCosmosAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
  const validChain = 'celestia';
  const validTxHash = '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateCOSMOS = new TranslateCOSMOS(apiKey || 'test-api-key');
    (translateCOSMOS as any).makeRequest = mockRequest;
  });

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }
    translateCOSMOS = new TranslateCOSMOS(apiKey);
  });

  it('should create an instance with a valid API key', () => {
    expect(translateCOSMOS).toBeInstanceOf(TranslateCOSMOS);
  });

  it('should throw an error if API key is not provided', () => {
    expect(() => new TranslateCOSMOS('')).toThrow('API key is required');
  });

  describe('getChains', () => {
    it('should get list of supported chains', async () => {
      const mockChains = [
        {
          name: 'celestia',
          ecosystem: 'cosmos',
          nativeCoin: {
            symbol: 'TIA',
            name: 'Celestia',
            decimals: 6
          }
        }
      ];
      mockRequest.mockResolvedValue(mockChains);

      const chains = await translateCOSMOS.getChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
      chains.forEach(chain => {
        expect(chain).toHaveProperty('name');
        expect(chain).toHaveProperty('ecosystem');
        expect(chain).toHaveProperty('nativeCoin');
      });
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid API Key'] }));
      await expect(translateCOSMOS.getChains()).rejects.toThrow(TransactionError);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details', async () => {
      const mockTransaction = {
        txTypeVersion: 1,
        chain: validChain,
        accountAddress: validCosmosAddress,
        classificationData: {
          type: 'transfer',
          description: 'Token transfer'
        },
        rawTransactionData: {
          transactionHash: validTxHash,
          blockNumber: 123456,
          timestamp: 1234567890
        }
      };
      mockRequest.mockResolvedValue(mockTransaction);

      const tx = await translateCOSMOS.getTransaction(validChain, validTxHash);
      expect(tx).toBeDefined();
      expect(tx).toHaveProperty('txTypeVersion');
      expect(tx).toHaveProperty('chain');
      expect(tx).toHaveProperty('accountAddress');
      expect(tx).toHaveProperty('classificationData');
      expect(tx).toHaveProperty('rawTransactionData');
    });

    it('should handle rate limiting errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Rate limit exceeded'] }));
      await expect(translateCOSMOS.getTransaction(validChain, validTxHash)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateCOSMOS.getTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    const pageOptions: PageOptions = { pageSize: 10 };

    it('should return a valid TransactionsPage instance', async () => {
      const mockResponse = {
        items: [
          {
            txTypeVersion: 1,
            chain: validChain,
            accountAddress: validCosmosAddress,
            classificationData: {
              type: 'transfer',
              description: 'Token transfer'
            },
            rawTransactionData: {
              transactionHash: validTxHash,
              blockNumber: 123456,
              timestamp: 1234567890
            }
          }
        ],
        hasNextPage: false,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateCOSMOS.Transactions(validChain, validCosmosAddress, pageOptions);
      expect(result).toBeInstanceOf(TransactionsPage);
      
      const transactions = result.getTransactions();
      expect(Array.isArray(transactions)).toBe(true);
      if (transactions.length > 0) {
        transactions.forEach((tx: Transaction) => {
          expect(tx).toMatchObject({
            rawTransactionData: expect.objectContaining({
              transactionHash: expect.any(String)
            })
          });
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const mockFirstPage = {
        items: [
          {
            txTypeVersion: 1,
            chain: validChain,
            accountAddress: validCosmosAddress,
            classificationData: {
              type: 'transfer',
              description: 'Token transfer'
            },
            rawTransactionData: {
              transactionHash: validTxHash,
              blockNumber: 123456,
              timestamp: 1234567890
            }
          }
        ],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      };
      const mockSecondPage = {
        items: [
          {
            txTypeVersion: 1,
            chain: validChain,
            accountAddress: validCosmosAddress,
            classificationData: {
              type: 'transfer',
              description: 'Token transfer'
            },
            rawTransactionData: {
              transactionHash: 'different-hash',
              blockNumber: 123457,
              timestamp: 1234567891
            }
          }
        ],
        hasNextPage: false,
        nextPageUrl: null
      };
      mockRequest
        .mockResolvedValueOnce(mockFirstPage)
        .mockResolvedValueOnce(mockSecondPage);

      const result = await translateCOSMOS.Transactions(validChain, validCosmosAddress, { pageSize: 5 });
      const firstPage = result.getTransactions();
      expect(Array.isArray(firstPage)).toBe(true);
      expect(firstPage.length).toBeLessThanOrEqual(5);

      if (await result.next()) {
        const secondPage = result.getTransactions();
        expect(Array.isArray(secondPage)).toBe(true);
        expect(secondPage.length).toBeLessThanOrEqual(5);
        expect(JSON.stringify(firstPage)).not.toBe(JSON.stringify(secondPage));
      }
    });

    it('should handle invalid address gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translateCOSMOS.Transactions(validChain, 'invalid-address', pageOptions)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenBalances', () => {
    it('should get token balances successfully', async () => {
      const mockBalances = [
        {
          balance: '1000000000',
          token: {
            symbol: 'ATOM',
            name: 'Cosmos',
            decimals: 6,
            address: 'cosmos1...',
            icon: null
          }
        }
      ];

      mockRequest.mockResolvedValue(mockBalances);

      const response = await translateCOSMOS.getTokenBalances(validChain, validCosmosAddress);
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
      response.forEach((balance) => {
        expect(balance).toHaveProperty('balance');
        expect(balance).toHaveProperty('token');
        expect(balance.token).toHaveProperty('symbol');
        expect(balance.token).toHaveProperty('name');
        expect(balance.token).toHaveProperty('decimals');
        expect(balance.token).toHaveProperty('address');
        expect(balance.token).toHaveProperty('icon');
      });
    });

    it('should handle invalid address', async () => {
      await expect(translateCOSMOS.getTokenBalances(validChain, 'invalid-address')).rejects.toThrow(CosmosAddressError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translateCOSMOS.getTokenBalances(validChain, validCosmosAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle empty response', async () => {
      mockRequest.mockResolvedValue([]);
      const response = await translateCOSMOS.getTokenBalances(validChain, validCosmosAddress);
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(0);
    });
  });

  describe('startTransactionJob', () => {
    it('should start a transaction job', async () => {
      const mockJob = {
        jobId: 'test-job-id',
        status: 'pending'
      };
      mockRequest.mockResolvedValue(mockJob);

      const job = await translateCOSMOS.startTransactionJob(validChain, validCosmosAddress, 1, 100);
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');
      expect(job).toHaveProperty('status');
    });

    it('should handle invalid address', async () => {
      await expect(translateCOSMOS.startTransactionJob(validChain, 'invalid-address')).rejects.toThrow(CosmosAddressError);
    });
  });

  describe('getTransactionJobResults', () => {
    it('should get transaction job results', async () => {
      const mockResults = {
        items: [
          {
            txTypeVersion: 1,
            chain: validChain,
            accountAddress: validCosmosAddress,
            classificationData: {
              type: 'transfer',
              description: 'Token transfer'
            },
            rawTransactionData: {
              transactionHash: validTxHash,
              blockNumber: 123456,
              timestamp: 1234567890
            }
          }
        ],
        hasNextPage: false
      };
      mockRequest.mockResolvedValue(mockResults);

      const results = await translateCOSMOS.getTransactionJobResults(validChain, 'test-job-id');
      expect(results).toBeDefined();
      expect(results).toHaveProperty('items');
      expect(results).toHaveProperty('hasNextPage');
    });

    it('should handle non-existent job ID', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Job not found'] }));
      await expect(translateCOSMOS.getTransactionJobResults(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });
  });
});