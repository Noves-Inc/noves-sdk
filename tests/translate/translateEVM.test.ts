import { TranslateEVM } from "../../src/translate/translateEVM";
import { TransactionError } from "../../src/errors/TransactionError";
import { PageOptions } from "../../src/types/types";
import { TransactionsPage } from "../../src/translate/transactionsPage";
import { HistoryPage } from "../../src/translate/historyPage";

jest.setTimeout(30000);

describe('TranslateEVM', () => {
  let translateEVM: TranslateEVM;
  let mockRequest: jest.Mock;
  const apiKey = process.env.API_KEY;
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const validTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const validChain = 'ethereum';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateEVM = new TranslateEVM('test-api-key');
    (translateEVM as any).makeRequest = mockRequest;
  });

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }
    translateEVM = new TranslateEVM(apiKey);
  });

  describe('getChains', () => {
    it('should get list of supported chains', async () => {
      const mockResponse = {
        chains: [
          { name: 'eth', ecosystem: 'evm' },
          { name: 'bsc', ecosystem: 'evm' },
        ],
      };

      mockRequest.mockResolvedValue(mockResponse.chains);

      const result = await translateEVM.getChains();

      expect(mockRequest).toHaveBeenCalledWith('chains');
      expect(result).toEqual(mockResponse.chains);
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid API Key'] }));
      await expect(translateEVM.getChains()).rejects.toThrow(TransactionError);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details', async () => {
      const mockResponse = {
        txTypeVersion: 5,
        chain: validChain,
        accountAddress: validAddress,
        classificationData: {
          type: 'placeOrder',
          source: {
            type: 'human'
          },
          description: 'Placed a new order in a decentralized exchange.',
          protocol: { name: null }
        },
        transfers: [
          {
            action: 'sent',
            from: {
              name: null,
              address: validAddress
            },
            to: {
              name: null,
              address: '0x1234567890123456789012345678901234567890'
            },
            amount: '1.0',
            token: {
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              address: '0x0000000000000000000000000000000000000000'
            }
          }
        ],
        rawTransactionData: {
          transactionHash: validTxHash,
          fromAddress: validAddress,
          toAddress: validAddress,
          blockNumber: 12345678,
          gas: 21000,
          gasUsed: 21000,
          gasPrice: 20000000000,
          transactionFee: 0.00042,
          timestamp: 1234567890
        }
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateEVM.getTransaction(validChain, validTxHash);

      expect(mockRequest).toHaveBeenCalledWith(`eth/tx/${validTxHash}?v5Format=true`);
      expect(result).toEqual(mockResponse);
      expect(result.txTypeVersion).toBe(5);
    });

    it('should get transaction details in v5 format', async () => {
      const mockTransaction = {
        txTypeVersion: 5,
        chain: 'eth',
        accountAddress: '0x123',
        classificationData: {
          type: 'transfer',
          source: 'blockchain',
          description: 'Transfer of ETH',
          protocol: 'ethereum'
        },
        rawTransactionData: {
          hash: '0xabc',
          blockNumber: 123,
          from: '0x123',
          to: '0x456',
          value: '1000000000000000000'
        },
        transfers: []
      };

      mockRequest.mockResolvedValue(mockTransaction);

      const result = await translateEVM.getTransaction(validChain, '0xabc', 5);
      expect(result).toEqual(mockTransaction);
      expect(result.txTypeVersion).toBe(5);
    });

    it('should get transaction details in v2 format', async () => {
      const mockTransaction = {
        txTypeVersion: 2,
        chain: 'eth',
        accountAddress: '0x123',
        classificationData: {
          type: 'transfer',
          source: {
            type: 'human'
          },
          description: 'Transfer of ETH',
          protocol: {
            name: null
          },
          sent: [
            {
              action: 'sent',
              from: {
                name: null,
                address: '0x123'
              },
              to: {
                name: null,
                address: '0x456'
              },
              amount: '1.0',
              token: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18,
                address: '0x0000000000000000000000000000000000000000'
              }
            }
          ],
          received: []
        },
        rawTransactionData: {
          transactionHash: '0xabc',
          fromAddress: '0x123',
          toAddress: '0x456',
          blockNumber: 123,
          gas: 21000,
          gasUsed: 21000,
          gasPrice: 20000000000,
          transactionFee: 0.00042,
          timestamp: 1234567890
        }
      };

      mockRequest.mockResolvedValue(mockTransaction);

      const result = await translateEVM.getTransaction(validChain, '0xabc', 2);
      expect(result).toEqual(mockTransaction);
      expect(result.txTypeVersion).toBe(2);
    });

    it('should throw error for invalid txTypeVersion', async () => {
      await expect(translateEVM.getTransaction(validChain, '0xabc', 3))
        .rejects
        .toThrow(TransactionError);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ 
        message: ['The field chain is invalid'] 
      }));
      await expect(translateEVM.getTransaction('invalidChain', '0xabc')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translateEVM.getTransaction(validChain, '0xabc')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateEVM.getTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenBalances', () => {
    it('should get token balances successfully', async () => {
      const mockResponse = {
        items: [
          {
            balance: '1000000000000000000',
            usdValue: '1800.00',
            token: {
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              address: '0x0000000000000000000000000000000000000000'
            }
          }
        ],
      };

      mockRequest.mockResolvedValue(mockResponse.items);

      const result = await translateEVM.getTokenBalances(validChain, validAddress);
      expect(result).toEqual(mockResponse.items);
    });

    it('should get token balances with specific tokens', async () => {
      const mockResponse = {
        items: [
          {
            balance: '1000000',
            usdValue: '1.00',
            token: {
              symbol: 'USDC',
              name: 'USD Coin',
              decimals: 6,
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
            }
          }
        ],
      };

      mockRequest.mockResolvedValue(mockResponse.items);

      const specificTokens = ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'];
      const result = await translateEVM.getTokenBalances(validChain, validAddress, specificTokens);
      expect(result).toEqual(mockResponse.items);
    });

    it('should get token balances with custom parameters', async () => {
      const mockResponse = {
        items: [
          {
            balance: '1000000000000000000',
            usdValue: '1800.00',
            token: {
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              address: '0x0000000000000000000000000000000000000000'
            }
          }
        ],
      };

      mockRequest.mockResolvedValue(mockResponse.items);

      const result = await translateEVM.getTokenBalances(
        validChain,
        validAddress,
        undefined,
        12345678, // block
        true,     // includePrices
        false,    // excludeZeroPrices
        true      // excludeSpam
      );
      expect(result).toEqual(mockResponse.items);
    });

    it('should handle invalid address', async () => {
      await expect(translateEVM.getTokenBalances(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translateEVM.getTokenBalances(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle empty response', async () => {
      mockRequest.mockResolvedValue([]);
      const balances = await translateEVM.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBe(0);
    });
  });

  describe('History', () => {
    it('should get history with default options', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const history = await translateEVM.History(validChain, validAddress);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should get history with all query parameters', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const pageOptions: PageOptions = {
        pageSize: 100,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false
      };
      const history = await translateEVM.History(validChain, validAddress, pageOptions);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should handle pagination correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      });
      const pageOptions: PageOptions = { pageSize: 5 };
      const history = await translateEVM.History(validChain, validAddress, pageOptions);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should handle invalid address', async () => {
      await expect(translateEVM.History(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid chain', async () => {
      await expect(translateEVM.History('invalid-chain', validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid page size', async () => {
      const pageOptions: PageOptions = { pageSize: 101 }; // Max is 100
      await expect(translateEVM.History(validChain, validAddress, pageOptions)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid sort order', async () => {
      const pageOptions: PageOptions = { sort: 'invalid' as any };
      await expect(translateEVM.History(validChain, validAddress, pageOptions)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTxTypes', () => {
    it('should get transaction types', async () => {
      mockRequest.mockResolvedValue({
        transactionTypes: [
          {
            id: 1,
            name: 'Transfer',
            description: 'Transfer of tokens'
          }
        ],
        version: 1
      });
      const result = await translateEVM.getTxTypes();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('transactionTypes');
      expect(result).toHaveProperty('version');
      expect(Array.isArray(result.transactionTypes)).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['API error'] }));
      await expect(translateEVM.getTxTypes()).rejects.toThrow(TransactionError);
    });

    it('should validate response structure', async () => {
      mockRequest.mockResolvedValue({ invalid: 'structure' });
      await expect(translateEVM.getTxTypes()).rejects.toThrow(TransactionError);
    });
  });

  describe('Transaction Job', () => {
    it('should start and get transaction job results', async () => {
      const mockJobResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'pending',
          nextPageUrl: 'https://api.example.com/next-page'
        }
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488,
        false,
        true
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');
      expect(job).toHaveProperty('nextPageUrl');

      const mockResultsResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'completed',
          results: {
            transactions: [],
            totalCount: 0
          }
        }
      };
      mockRequest.mockResolvedValue(mockResultsResponse);
      const results = await translateEVM.getTransactionJobResults(validChain, job.jobId, { pageSize: 100 });
      expect(results).toBeDefined();
      expect(results).toHaveProperty('jobId');
      expect(results).toHaveProperty('status');
    });

    it('should handle invalid address in startTransactionJob', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translateEVM.startTransactionJob(
        validChain,
        'invalid-address',
        14637919,
        15289488
      )).rejects.toThrow(TransactionError);
    });

    it('should handle non-existent job ID', async () => {
      await expect(translateEVM.getTransactionJobResults(validChain, 'nonexistent-id')).rejects.toThrow();
    });

    it('should handle pagination in getTransactionJobResults', async () => {
      const mockJobResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'pending',
          nextPageUrl: 'https://api.example.com/next-page'
        }
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488
      );

      const mockResultsResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'completed',
          results: {
            transactions: [],
            totalCount: 0
          }
        }
      };
      mockRequest.mockResolvedValue(mockResultsResponse);
      const pageOptions = { pageSize: 50, pageNumber: 1, ascending: false };
      const results = await translateEVM.getTransactionJobResults(validChain, job.jobId, pageOptions);
      expect(results).toBeDefined();
      expect(results).toHaveProperty('jobId');
      expect(results).toHaveProperty('status');
    });

    it('should delete a transaction job', async () => {
      const mockJobResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'pending',
          nextPageUrl: 'https://api.example.com/next-page'
        }
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488,
        false,
        true
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');

      mockRequest.mockResolvedValue({ response: undefined });
      await expect(translateEVM.deleteTransactionJob(validChain, job.jobId)).resolves.not.toThrow();
    });

    it('should handle non-existent job ID when deleting', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Job not found'] }));
      await expect(translateEVM.deleteTransactionJob(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    const pageOptions: PageOptions = { pageSize: 10 };

    it('should return a valid TransactionsPage instance', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null,
        pageSize: 10
      });
      const result = await translateEVM.Transactions(validChain, validAddress, pageOptions);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle pagination correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page',
        pageSize: 5
      });
      const result = await translateEVM.Transactions(validChain, validAddress, { pageSize: 5 });
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle query parameters correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null,
        pageSize: 10
      });
      const options: PageOptions = {
        pageSize: 10,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false
      };
      const result = await translateEVM.Transactions(validChain, validAddress, options);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle invalid address gracefully', async () => {
      try {
        await translateEVM.Transactions(validChain, 'invalid-address', pageOptions);
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });

    it('should handle invalid chain gracefully', async () => {
      try {
        await translateEVM.Transactions(validChain, 'invalid-address', pageOptions);
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });
  });

  describe('getRawTransaction', () => {
    it('should get raw transaction details', async () => {
      const mockResponse = {
        network: 'ethereum',
        rawTx: {
          transactionHash: validTxHash,
          hash: validTxHash,
          transactionIndex: 0,
          type: 0,
          blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          blockNumber: 12345678,
          from: validAddress,
          to: validAddress,
          gas: 21000,
          gasPrice: 20000000000,
          value: 1000000000000000000,
          input: '0x',
          nonce: 0,
          r: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          s: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          v: '0x1b',
          networkEnum: 1,
          timestamp: 1234567890,
          gasUsed: 21000,
          transactionFee: 420000000000000
        },
        rawTraces: [],
        eventLogs: [],
        internalTxs: [],
        txReceipt: {
          blockNumber: 12345678,
          blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          status: 1,
          gasUsed: 21000,
          cumulativeGasUsed: 21000
        },
        decodedInput: {}
      };
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.getRawTransaction(validChain, validTxHash);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`eth/raw/tx/${validTxHash}`);
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateEVM.getRawTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });
  });

  describe('describeTransaction', () => {
    it('should describe a transaction', async () => {
      const mockResponse = {
        description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
        type: 'addLiquidity'
      };
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransaction(validChain, validTxHash);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`eth/describeTx/${validTxHash}`);
    });

    it('should describe a transaction with viewAsAccountAddress', async () => {
      const mockResponse = {
        description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
        type: 'addLiquidity'
      };
      const viewAsAddress = '0x1234567890123456789012345678901234567890';
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransaction(validChain, validTxHash, viewAsAddress);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `eth/describeTx/${validTxHash}?viewAsAccountAddress=${encodeURIComponent(viewAsAddress)}`
      );
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateEVM.describeTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['API error'] }));
      await expect(translateEVM.describeTransaction(validChain, validTxHash)).rejects.toThrow(TransactionError);
    });
  });

  describe('describeTransactions', () => {
    it('should describe multiple transactions', async () => {
      const mockResponse = [
        {
          description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
          type: 'addLiquidity'
        },
        {
          description: 'Swapped 1.5 ETH for 2,500 USDC.',
          type: 'swap'
        }
      ];
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransactions(validChain, [validTxHash, validTxHash]);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        'eth/describeTxs',
        'POST',
        expect.objectContaining({
          body: JSON.stringify({ txHashes: [validTxHash, validTxHash] })
        })
      );
    });

    it('should describe multiple transactions with viewAsAccountAddress', async () => {
      const mockResponse = [
        {
          description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
          type: 'addLiquidity'
        },
        {
          description: 'Swapped 1.5 ETH for 2,500 USDC.',
          type: 'swap'
        }
      ];
      const viewAsAddress = '0x1234567890123456789012345678901234567890';
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransactions(validChain, [validTxHash, validTxHash], viewAsAddress);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `eth/describeTxs?viewAsAccountAddress=${encodeURIComponent(viewAsAddress)}`,
        'POST',
        expect.objectContaining({
          body: JSON.stringify({ txHashes: [validTxHash, validTxHash] })
        })
      );
    });

    it('should handle invalid hashes', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hashes'] }));
      await expect(translateEVM.describeTransactions(validChain, ['invalid-hash'])).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['API error'] }));
      await expect(translateEVM.describeTransactions(validChain, [validTxHash])).rejects.toThrow(TransactionError);
    });
  });
});