import { TranslateCOSMOS } from '../../src/translate/translateCOSMOS';
import { TransactionError } from '../../src/errors/TransactionError';
import { CosmosAddressError } from '../../src/errors/CosmosError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { COSMOSTranslateTransaction, COSMOSTranslateTransactionsResponse } from '../../src/types/cosmos';
import { PageOptions } from '../../src/types/common';

jest.setTimeout(30000);

describe('TranslateCOSMOS', () => {
  let translateCOSMOS: TranslateCOSMOS;
  let mockRequest: jest.Mock;
  const validCosmosAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
  const validChain = 'celestia';
  const validTxHash = '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateCOSMOS = new TranslateCOSMOS('test-api-key');
    (translateCOSMOS as any).makeRequest = mockRequest;
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
            name: 'TIA',
            symbol: 'TIA',
            address: 'TIA',
            decimals: 6
          },
          tier: 2
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
        expect(chain).toHaveProperty('tier');
        expect(chain.nativeCoin).toHaveProperty('name');
        expect(chain.nativeCoin).toHaveProperty('symbol');
        expect(chain.nativeCoin).toHaveProperty('address');
        expect(chain.nativeCoin).toHaveProperty('decimals');
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
        txTypeVersion: 5,
        chain: validChain,
        accountAddress: null,
        classificationData: {
          type: 'bridgeOut',
          description: 'Sent 47.6904 TIA to a bridge.'
        },
        transfers: [
          {
            action: 'paidGas',
            from: {
              name: null,
              address: validCosmosAddress
            },
            to: {
              name: null,
              address: null
            },
            amount: '0.001236',
            asset: {
              symbol: 'TIA',
              name: 'TIA',
              decimals: 6,
              address: 'utia',
              icon: null
            }
          }
        ],
        values: [],
        rawTransactionData: {
          height: 1239119,
          txhash: validTxHash,
          gas_used: 99407,
          gas_wanted: 123568,
          transactionFee: 1236,
          timestamp: 1713260330
        }
      };
      mockRequest.mockResolvedValue(mockTransaction);

      const tx = await translateCOSMOS.getTransaction(validChain, validTxHash);
      expect(tx).toBeDefined();
      expect(tx).toHaveProperty('txTypeVersion');
      expect(tx).toHaveProperty('chain');
      expect(tx).toHaveProperty('accountAddress');
      expect(tx).toHaveProperty('classificationData');
      expect(tx).toHaveProperty('transfers');
      expect(tx).toHaveProperty('values');
      expect(tx).toHaveProperty('rawTransactionData');
      expect(tx.rawTransactionData).toHaveProperty('height');
      expect(tx.rawTransactionData).toHaveProperty('txhash');
      expect(tx.rawTransactionData).toHaveProperty('gas_used');
      expect(tx.rawTransactionData).toHaveProperty('gas_wanted');
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

  describe('getTransactions', () => {
    const pageOptions: PageOptions = { pageSize: 10 };

    it('should return transactions response directly', async () => {
      const mockResponse: COSMOSTranslateTransactionsResponse = {
        account: validCosmosAddress,
        items: [
          {
            txTypeVersion: 5,
            chain: validChain,
            accountAddress: null,
            classificationData: {
              type: 'bridgeOut',
              description: 'Sent 47.6904 TIA to a bridge.'
            },
            transfers: [
              {
                action: 'paidGas',
                from: {
                  name: null,
                  address: validCosmosAddress
                },
                to: {
                  name: null,
                  address: null
                },
                amount: '0.001236',
                asset: {
                  symbol: 'TIA',
                  name: 'TIA',
                  decimals: 6,
                  address: 'utia',
                  icon: null
                }
              }
            ],
            values: [],
            rawTransactionData: {
              height: 1239119,
              txhash: validTxHash,
              gas_used: 99407,
              gas_wanted: 123568,
              transactionFee: 1236,
              timestamp: 1713260330
            }
          }
        ],
        pageSize: 10,
        hasNextPage: false,
        startBlock: null,
        endBlock: 0,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateCOSMOS.getTransactions(validChain, validCosmosAddress, pageOptions);
      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pageSize');
      expect(result).toHaveProperty('hasNextPage');
      expect(result).toHaveProperty('startBlock');
      expect(result).toHaveProperty('endBlock');
      expect(result).toHaveProperty('nextPageUrl');
      expect(result.account).toBe(validCosmosAddress);
      expect(Array.isArray(result.items)).toBe(true);
      if (result.items.length > 0) {
        result.items.forEach((tx: COSMOSTranslateTransaction) => {
          expect(tx).toMatchObject({
            rawTransactionData: expect.objectContaining({
              txhash: expect.anything() // Can be string or null
            })
          });
        });
      }
    });

    it('should handle transactions with null txhash (genesis transactions)', async () => {
      const mockResponse: COSMOSTranslateTransactionsResponse = {
        account: validCosmosAddress,
        items: [
          {
            txTypeVersion: 5,
            chain: validChain,
            accountAddress: null,
            classificationData: {
              type: 'genesisBalance',
              description: 'Starting balance of 163.19 TIA at chain genesis.'
            },
            transfers: [
              {
                action: 'received',
                from: {
                  name: null,
                  address: null
                },
                to: {
                  name: null,
                  address: validCosmosAddress
                },
                amount: '163.19',
                asset: {
                  symbol: 'TIA',
                  name: 'TIA',
                  decimals: 6,
                  address: 'utia',
                  icon: null
                }
              }
            ],
            values: [],
            rawTransactionData: {
              height: 0,
              txhash: null, // Genesis transactions have null txhash
              gas_used: 0,
              gas_wanted: 0,
              transactionFee: 0,
              timestamp: 0
            }
          }
        ],
        pageSize: 10,
        hasNextPage: false,
        startBlock: null,
        endBlock: 0,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateCOSMOS.getTransactions(validChain, validCosmosAddress, pageOptions);
      expect(result.items[0].rawTransactionData.txhash).toBeNull();
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translateCOSMOS.getTransactions(validChain, 'invalid-address', pageOptions)).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    const pageOptions: PageOptions = { pageSize: 10 };

    it('should return a valid TransactionsPage instance', async () => {
      const mockResponse = {
        items: [
          {
            txTypeVersion: 5,
            chain: validChain,
            accountAddress: null,
            classificationData: {
              type: 'bridgeOut',
              description: 'Sent 47.6904 TIA to a bridge.'
            },
            transfers: [
              {
                action: 'paidGas',
                from: {
                  name: null,
                  address: validCosmosAddress
                },
                to: {
                  name: null,
                  address: null
                },
                amount: '0.001236',
                asset: {
                  symbol: 'TIA',
                  name: 'TIA',
                  decimals: 6,
                  address: 'utia',
                  icon: null
                }
              }
            ],
            values: [],
            rawTransactionData: {
              height: 1239119,
              txhash: validTxHash,
              gas_used: 99407,
              gas_wanted: 123568,
              transactionFee: 1236,
              timestamp: 1713260330
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
        transactions.forEach((tx: COSMOSTranslateTransaction) => {
          expect(tx).toMatchObject({
            rawTransactionData: expect.objectContaining({
              txhash: expect.anything() // Can be string or null
            })
          });
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const mockFirstPage = {
        items: [
          {
            txTypeVersion: 5,
            chain: validChain,
            accountAddress: null,
            classificationData: {
              type: 'bridgeOut',
              description: 'Sent 47.6904 TIA to a bridge.'
            },
            transfers: [
              {
                action: 'paidGas',
                from: {
                  name: null,
                  address: validCosmosAddress
                },
                to: {
                  name: null,
                  address: null
                },
                amount: '0.001236',
                asset: {
                  symbol: 'TIA',
                  name: 'TIA',
                  decimals: 6,
                  address: 'utia',
                  icon: null
                }
              }
            ],
            values: [],
            rawTransactionData: {
              height: 1239119,
              txhash: validTxHash,
              gas_used: 99407,
              gas_wanted: 123568,
              transactionFee: 1236,
              timestamp: 1713260330
            }
          }
        ],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      };
      const mockSecondPage = {
        items: [
          {
            txTypeVersion: 5,
            chain: validChain,
            accountAddress: null,
            classificationData: {
              type: 'bridgeOut',
              description: 'Sent different amount TIA to a bridge.'
            },
            transfers: [
              {
                action: 'paidGas',
                from: {
                  name: null,
                  address: validCosmosAddress
                },
                to: {
                  name: null,
                  address: null
                },
                amount: '0.001500',
                asset: {
                  symbol: 'TIA',
                  name: 'TIA',
                  decimals: 6,
                  address: 'utia',
                  icon: null
                }
              }
            ],
            values: [],
            rawTransactionData: {
              height: 1239120,
              txhash: 'different-hash',
              gas_used: 99500,
              gas_wanted: 124000,
              transactionFee: 1500,
              timestamp: 1713260331
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
        nextPageId: 'test-page-id',
        nextPageUrl: 'https://translate.noves.fi/cosmos/celestia/txs/job/test-page-id'
      };
      mockRequest.mockResolvedValue(mockJob);

      const job = await translateCOSMOS.startTransactionJob(validChain, validCosmosAddress, 1, 100);
      expect(job).toBeDefined();
      expect(job).toHaveProperty('nextPageId');
      expect(job).toHaveProperty('nextPageUrl');
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
            txTypeVersion: 5,
            chain: validChain,
            accountAddress: null,
            classificationData: {
              type: 'bridgeOut',
              description: 'Sent 47.6904 TIA to a bridge.'
            },
            transfers: [
              {
                action: 'paidGas',
                from: {
                  name: null,
                  address: validCosmosAddress
                },
                to: {
                  name: null,
                  address: null
                },
                amount: '0.001236',
                asset: {
                  symbol: 'TIA',
                  name: 'TIA',
                  decimals: 6,
                  address: 'utia',
                  icon: null
                }
              }
            ],
            values: [],
            rawTransactionData: {
              height: 1239119,
              txhash: validTxHash,
              gas_used: 99407,
              gas_wanted: 123568,
              transactionFee: 1236,
              timestamp: 1713260330
            }
          }
        ],
        hasNextPage: false,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue(mockResults);

      const results = await translateCOSMOS.getTransactionJobResults(validChain, 'test-page-id');
      expect(results).toBeDefined();
      expect(results).toHaveProperty('items');
      expect(results).toHaveProperty('hasNextPage');
      expect(results).toHaveProperty('nextPageUrl');
    });

    it('should handle non-existent job ID', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Job not found'] }));
      await expect(translateCOSMOS.getTransactionJobResults(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });
  });
});