import { TranslateEVM } from "../../src/translate/translateEVM";
import { TransactionError } from "../../src/errors/TransactionError";
import { PageOptions } from "../../src/types/common";
import { TransactionsPage } from "../../src/translate/transactionsPage";
import { HistoryPage } from "../../src/translate/historyPage";

jest.setTimeout(30000);

describe('TranslateEVM', () => {
  let translateEVM: TranslateEVM;
  let mockRequest: jest.Mock;
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const validTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const validChain = 'ethereum';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateEVM = new TranslateEVM('test-api-key');
    (translateEVM as any).makeRequest = mockRequest;
  });

  describe('getChains', () => {
    it('should get list of supported chains', async () => {
      const mockResponse = [
        {
          name: 'eth',
          ecosystem: 'evm' as const,
          evmChainId: 1,
          nativeCoin: {
            name: 'ETH',
            symbol: 'ETH',
            address: 'ETH',
            decimals: 18
          },
          tier: 1
        },
        {
          name: 'bsc',
          ecosystem: 'evm' as const,
          evmChainId: 56,
          nativeCoin: {
            name: 'BNB',
            symbol: 'BNB',
            address: 'BNB',
            decimals: 18
          },
          tier: 1
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateEVM.getChains();

      expect(mockRequest).toHaveBeenCalledWith('chains');
      expect(result).toEqual(mockResponse);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('ecosystem');
      expect(result[0]).toHaveProperty('evmChainId');
      expect(result[0]).toHaveProperty('nativeCoin');
      expect(result[0]).toHaveProperty('tier');
      expect(result[0].nativeCoin).toHaveProperty('name');
      expect(result[0].nativeCoin).toHaveProperty('symbol');
      expect(result[0].nativeCoin).toHaveProperty('address');
      expect(result[0].nativeCoin).toHaveProperty('decimals');
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
        values: [],
        rawTransactionData: {
          transactionHash: validTxHash,
          fromAddress: validAddress,
          toAddress: validAddress,
          blockNumber: 12345678,
          gas: 21000,
          gasUsed: 21000,
          gasPrice: 20000000000,
          transactionFee: {
            amount: "0.00042",
            token: {
              symbol: "ETH",
              name: "ETH",
              decimals: 18,
              address: "ETH"
            }
          },
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
          source: {
            type: 'human'
          },
          description: 'Transfer of ETH',
          protocol: {
            name: null
          }
        },
        transfers: [],
        values: [],
        rawTransactionData: {
          transactionHash: '0xabc',
          fromAddress: '0x123',
          toAddress: '0x456',
          blockNumber: 123,
          gas: 21000,
          gasUsed: 21000,
          gasPrice: 20000000000,
          transactionFee: {
            amount: "0.00042",
            token: {
              symbol: "ETH",
              name: "ETH",
              decimals: 18,
              address: "ETH"
            }
          },
          timestamp: 1234567890
        }
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
          transactionFee: {
            amount: "0.00042",
            token: {
              symbol: "ETH",
              name: "ETH",
              decimals: 18,
              address: "ETH"
            }
          },
          timestamp: 1234567890
        }
      };

      mockRequest.mockResolvedValue(mockTransaction);

      const result = await translateEVM.getTransaction(validChain, '0xabc', 2);
      expect(result).toEqual(mockTransaction);
      expect(result.txTypeVersion).toBe(2);
    });

    it('should get approval transaction details in v2 format with approved field', async () => {
      const mockApprovalTransaction = {
        txTypeVersion: 2,
        chain: 'eth',
        accountAddress: '0x123',
        classificationData: {
          type: 'approveToken',
          source: {
            type: 'human'
          },
          description: 'Approved USDT for trade by 0x1111.',
          protocol: {
            name: 'Tether'
          },
          sent: [
            {
              action: 'paidGas',
              from: {
                name: 'This wallet',
                address: '0x123'
              },
              to: {
                name: null,
                address: null
              },
              amount: '0.00065186604229563',
              token: {
                symbol: 'ETH',
                name: 'ETH',
                decimals: 18,
                address: 'ETH'
              }
            }
          ],
          received: [],
          approved: {
            spender: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
            amount: '115792089237316195423570985008687907853269984665640564039457584007913129.639935',
            token: {
              symbol: 'USDT',
              name: 'Tether USD',
              decimals: 6,
              address: '0xdac17f958d2ee523a2206206994597c13d831ec7'
            }
          }
        },
        rawTransactionData: {
          transactionHash: '0xdef',
          fromAddress: '0x123',
          toAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          blockNumber: 15289479,
          gas: 56232,
          gasUsed: 48897,
          gasPrice: 13331411790,
          transactionFee: {
            amount: '0.00065186604229563',
            token: {
              symbol: 'ETH',
              name: 'ETH',
              decimals: 18,
              address: 'ETH'
            }
          },
          timestamp: 1659799131
        }
      };

      mockRequest.mockResolvedValue(mockApprovalTransaction);

      const result = await translateEVM.getTransaction(validChain, '0xdef', 2);
      expect(result).toEqual(mockApprovalTransaction);
      expect(result.txTypeVersion).toBe(2);
      if ('approved' in result.classificationData) {
        expect(result.classificationData.approved).toBeDefined();
        expect(result.classificationData.approved?.spender).toBe('0x1111111254fb6c44bAC0beD2854e76F90643097d');
      }
    });

    it('should get approval transaction details in v5 format with approved field', async () => {
      const mockApprovalTransaction = {
        txTypeVersion: 5,
        chain: 'eth',
        accountAddress: '0x123',
        classificationData: {
          type: 'approveToken',
          source: {
            type: 'human'
          },
          description: 'Approved USDT for trade by 0x1111.',
          protocol: {
            name: 'Tether'
          },
          approved: {
            spender: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
            amount: '115792089237316195423570985008687907853269984665640564039457584007913129.639935',
            token: {
              symbol: 'USDT',
              name: 'Tether USD',
              decimals: 6,
              address: '0xdac17f958d2ee523a2206206994597c13d831ec7'
            }
          }
        },
        transfers: [
          {
            action: 'paidGas',
            from: {
              name: 'This wallet',
              address: '0x123'
            },
            to: {
              name: null,
              address: null
            },
            amount: '0.00065186604229563',
            token: {
              symbol: 'ETH',
              name: 'ETH',
              decimals: 18,
              address: 'ETH'
            }
          }
        ],
        values: [],
        rawTransactionData: {
          transactionHash: '0xghi',
          fromAddress: '0x123',
          toAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          blockNumber: 15289479,
          gas: 56232,
          gasUsed: 48897,
          gasPrice: 13331411790,
          transactionFee: {
            amount: '0.00065186604229563',
            token: {
              symbol: 'ETH',
              name: 'ETH',
              decimals: 18,
              address: 'ETH'
            }
          },
          timestamp: 1659799131
        }
      };

      mockRequest.mockResolvedValue(mockApprovalTransaction);

      const result = await translateEVM.getTransaction(validChain, '0xghi', 5);
      expect(result).toEqual(mockApprovalTransaction);
      expect(result.txTypeVersion).toBe(5);
      if ('approved' in result.classificationData) {
        expect(result.classificationData.approved).toBeDefined();
        expect(result.classificationData.approved?.spender).toBe('0x1111111254fb6c44bAC0beD2854e76F90643097d');
      }
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
      const mockResponse = [
        {
          balance: '1000000000000000000',
          usdValue: '1800.00',
          token: {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            address: 'ETH',
            price: '1800.00'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateEVM.getTokenBalances(validChain, validAddress);
      expect(result).toEqual(mockResponse);
    });

    it('should get token balances with specific tokens', async () => {
      const mockResponse = [
        {
          balance: '1000000',
          token: {
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const specificTokens = ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'];
      const result = await translateEVM.getTokenBalances(validChain, validAddress, specificTokens);
      expect(result).toEqual(mockResponse);
    });

    it('should get token balances with custom parameters', async () => {
      const mockResponse = [
        {
          balance: '1000000000000000000',
          usdValue: '1800.00',
          token: {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            address: 'ETH',
            price: '1800.00'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateEVM.getTokenBalances(
        validChain,
        validAddress,
        undefined,
        12345678, // block
        true,     // includePrices
        false,    // excludeZeroPrices
        true      // excludeSpam
      );
      expect(result).toEqual(mockResponse);
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

    it('should handle tokens with null values', async () => {
      const mockResponse = [
        {
          balance: '1000.0',
          usdValue: null,
          token: {
            symbol: 'SPAM',
            name: 'Spam Token',
            decimals: 18,
            address: '0x123456789abcdef',
            price: null
          }
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateEVM.getTokenBalances(validChain, validAddress);
      expect(result).toEqual(mockResponse);
      expect(result[0].usdValue).toBeNull();
      expect(result[0].token.price).toBeNull();
    });

    it('should handle POST request without usdValue field', async () => {
      const mockResponse = [
        {
          balance: '129.1960665220077568',
          token: {
            symbol: 'ENS',
            name: 'Ethereum Name Service',
            decimals: 18,
            address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const specificTokens = ['0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'];
      const result = await translateEVM.getTokenBalances(validChain, validAddress, specificTokens);
      expect(result).toEqual(mockResponse);
      expect(result[0].usdValue).toBeUndefined();
      expect(result[0].token.price).toBeUndefined();
    });
  });

  describe('getHistory', () => {
    it('should get history with default options', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const history = await translateEVM.getHistory(validChain, validAddress);
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
      const history = await translateEVM.getHistory(validChain, validAddress, pageOptions);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should handle pagination correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      });
      const pageOptions: PageOptions = { pageSize: 5 };
      const history = await translateEVM.getHistory(validChain, validAddress, pageOptions);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should handle invalid address', async () => {
      await expect(translateEVM.getHistory(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid chain', async () => {
      await expect(translateEVM.getHistory('invalid-chain', validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid page size', async () => {
      const pageOptions: PageOptions = { pageSize: 101 }; // Max is 100
      await expect(translateEVM.getHistory(validChain, validAddress, pageOptions)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid sort order', async () => {
      const pageOptions: PageOptions = { sort: 'invalid' as any };
      await expect(translateEVM.getHistory(validChain, validAddress, pageOptions)).rejects.toThrow(TransactionError);
    });
  });

  describe('History (deprecated)', () => {
    it('should work as backward compatibility wrapper', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const history = await translateEVM.History(validChain, validAddress);
      expect(history).toBeInstanceOf(HistoryPage);
    });
  });

  describe('getTxTypes', () => {
    it('should get transaction types', async () => {
      mockRequest.mockResolvedValue({
        version: 1,
        transactionTypes: [
          {
            type: 'addLiquidity',
            description: 'The user enters a liquidity pool by adding one or more tokens to the pool.'
          },
          {
            type: 'swap',
            description: 'Reported when two or more fungible tokens are traded in the transaction, typically by using a decentralized exchange protocol.'
          }
        ]
      });
      const result = await translateEVM.getTxTypes();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('transactionTypes');
      expect(result).toHaveProperty('version');
      expect(Array.isArray(result.transactionTypes)).toBe(true);
      expect(result.transactionTypes).toHaveLength(2);
      expect(result.transactionTypes[0]).toHaveProperty('type');
      expect(result.transactionTypes[0]).toHaveProperty('description');
      expect(result.version).toBe(1);
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
        jobId: 'test-job-id',
        nextPageUrl: 'https://api.example.com/next-page'
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
        items: [],
        pageSize: 100,
        hasNextPage: false,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue(mockResultsResponse);
      const results = await translateEVM.getTransactionJobResults(validChain, job.jobId, { pageSize: 100 });
      expect(results).toBeDefined();
      expect(results).toHaveProperty('items');
      expect(results).toHaveProperty('pageSize');
      expect(results).toHaveProperty('hasNextPage');
      expect(results).toHaveProperty('nextPageUrl');
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
        jobId: 'test-job-id',
        nextPageUrl: 'https://api.example.com/next-page'
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488
      );

      const mockResultsResponse = {
        items: [],
        pageSize: 50,
        hasNextPage: false,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue(mockResultsResponse);
      const pageOptions = { pageSize: 50, pageNumber: 1, ascending: false };
      const results = await translateEVM.getTransactionJobResults(validChain, job.jobId, pageOptions);
      expect(results).toBeDefined();
      expect(results).toHaveProperty('items');
      expect(results).toHaveProperty('pageSize');
      expect(results).toHaveProperty('hasNextPage');
      expect(results).toHaveProperty('nextPageUrl');
    });

    it('should delete a transaction job', async () => {
      const mockJobResponse = {
        jobId: 'test-job-id',
        nextPageUrl: 'https://api.example.com/next-page'
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

      const mockDeleteResponse = {
        message: `Job ${job.jobId} deleted`
      };
      mockRequest.mockResolvedValue(mockDeleteResponse);
      const deleteResult = await translateEVM.deleteTransactionJob(validChain, job.jobId);
      expect(deleteResult).toBeDefined();
      expect(deleteResult).toHaveProperty('message');
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
      const result = await translateEVM.getTransactions(validChain, validAddress, pageOptions);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle pagination correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page',
        pageSize: 5
      });
      const result = await translateEVM.getTransactions(validChain, validAddress, { pageSize: 5 });
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
      const result = await translateEVM.getTransactions(validChain, validAddress, options);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle invalid address gracefully', async () => {
      try {
        await translateEVM.getTransactions(validChain, 'invalid-address', pageOptions);
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
        await translateEVM.getTransactions(validChain, 'invalid-address', pageOptions);
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
        eventLogs: [{
          decodedName: "Transfer",
          decodedSignature: "Transfer(address,address,uint256)",
          logIndex: 132,
          address: "0x90f802C7E8fb5D40B0De583e34C065A3bd2020D8",
          params: [
            {
              name: "from",
              type: "address",
              value: "0xA1EFa0adEcB7f5691605899d13285928AE025844"
            },
            {
              name: "to", 
              type: "address",
              value: "0xaD270aDA5Ce83C6B87976E33D829763f03fD59f1"
            },
            {
              name: "value",
              type: "uint256",
              value: 22447923696829373668181
            }
          ],
          raw: {
            eventSignature: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000a1efa0adecb7f5691605899d13285928ae025844",
              "0x000000000000000000000000ad270ada5ce83c6b87976e33d829763f03fd59f1"
            ],
            data: "0x0000000000000000000000000000000000000000000004c0e7859411bc54db55"
          }
        }],
        internalTxs: [],
        txReceipt: {
          blockNumber: 12345678,
          blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          status: 1,
          gasUsed: 21000,
          cumulativeGasUsed: 21000
        },
        decodedInput: {
          functionName: "execute",
          parameters: [
            {
              parameter: {
                name: "_target",
                type: "address",
                order: 1,
                internalType: null,
                serpentSignature: null,
                structTypeName: null,
                indexed: false
              },
              dataIndexStart: 0,
              result: "0x2FCc6f96418764439f8Dc26aF559Ed5CdDAeefaC"
            }
          ]
        }
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
          txHash: validTxHash,
          description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
          type: 'addLiquidity'
        },
        {
          txHash: validTxHash,
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
          body: JSON.stringify([validTxHash, validTxHash])
        })
      );
    });

    it('should describe multiple transactions with viewAsAccountAddress', async () => {
      const mockResponse = [
        {
          txHash: validTxHash,
          description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
          type: 'addLiquidity'
        },
        {
          txHash: validTxHash,
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
          body: JSON.stringify([validTxHash, validTxHash])
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