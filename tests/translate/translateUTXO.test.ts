import { TranslateUTXO } from "../../src/translate/translateUTXO";
import { TransactionError } from "../../src/errors/TransactionError";
import { UTXOTranslateChain } from "../../src/types/utxo";

jest.setTimeout(10000);

describe('TranslateUTXO', () => {
  let translate: TranslateUTXO;
  let mockRequest: jest.Mock;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockRequest = jest.fn();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    translate = new TranslateUTXO('test-api-key');
    (translate as any).request = mockRequest;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getChains', () => {
    it('should fetch chains successfully', async () => {
      const mockChains = [
        {
          "name": "avalanche-p-chain",
          "ecosystem": "utxo",
          "nativeCoin": {
            "address": "AVAX",
            "decimals": 9,
            "name": "AVAX",
            "symbol": "AVAX"
          },
          "tier": 2
        },
        {
          "name": "avalanche-x-chain",
          "ecosystem": "utxo",
          "nativeCoin": {
            "address": "AVAX",
            "decimals": 9,
            "name": "AVAX",
            "symbol": "AVAX"
          },
          "tier": 2
        },
        {
          "name": "btc",
          "ecosystem": "utxo",
          "nativeCoin": {
            "address": "BTC",
            "decimals": 8,
            "name": "BTC",
            "symbol": "BTC"
          },
          "tier": 2
        },
        {
          "name": "cardano",
          "ecosystem": "utxo",
          "nativeCoin": {
            "address": "ADA",
            "decimals": 6,
            "name": "ADA",
            "symbol": "ADA"
          },
          "tier": 2
        }
      ];

      mockRequest.mockResolvedValue({ response: mockChains });

      const response = await translate.getChains();
      expect(response).toEqual(mockChains);
      expect(response.length).toBe(4);
      expect(response[0].ecosystem).toBe('utxo');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }));
      await expect(translate.getChains()).rejects.toThrow(TransactionError);
    });
  });



  describe('getAddressesByMasterKey', () => {
    it('should fetch derived addresses successfully with xpub', async () => {
      const mockAddresses = [
        '1FZMpLkc9W9hqv5dFvtTPqDwzEP8tZvm7z',
        '1NPBJiJSvdPrRtYt2Y9732Hvvhs5tCAiw9',
        '1AD83uQSNhQ3FMeiigaRAxkGowrnVpHXPk'
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAddresses
      });

      const response = await translate.getAddressesByMasterKey('xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz');
      expect(response).toEqual(mockAddresses);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://translate.noves.fi/uxto/btc/addresses/xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'apiKey': 'test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should fetch derived addresses successfully with ypub', async () => {
      const mockAddresses = [
        '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL',
        '3FcoNNfPJSfo58w9Zv5B1DmJBMe4Up17HF',
        '36UsxVpZcQjydzke8NpvXTCDd1mvB7NM5p'
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAddresses
      });

      const response = await translate.getAddressesByMasterKey('ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNpj8ahQn9dDfJdLUKD1Bou4EQvjnyWYCJ8VGzHoLYpqJHYJg9Q7GvgEBXEZj6vDFkJ9pq8ABCD');
      expect(response).toEqual(mockAddresses);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://translate.noves.fi/uxto/btc/addresses/ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNpj8ahQn9dDfJdLUKD1Bou4EQvjnyWYCJ8VGzHoLYpqJHYJg9Q7GvgEBXEZj6vDFkJ9pq8ABCD',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'apiKey': 'test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should fetch derived addresses successfully with zpub', async () => {
      const mockAddresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        'bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c'
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAddresses
      });

      const response = await translate.getAddressesByMasterKey('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXgh3SsEF3C9vLpqHrwfbK6W1H2WdBLiHGvKJ8Q2Dpt6SbGwuL7X4VzNq3a');
      expect(response).toEqual(mockAddresses);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://translate.noves.fi/uxto/btc/addresses/zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXgh3SsEF3C9vLpqHrwfbK6W1H2WdBLiHGvKJ8Q2Dpt6SbGwuL7X4VzNq3a',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'apiKey': 'test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle validation errors for invalid master key format', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          status: 400,
          errors: { masterKey: ['Invalid master key format'] }
        })
      });

      await expect(translate.getAddressesByMasterKey('invalid-master-key')).rejects.toThrow(TransactionError);
    });

    it('should handle validation errors for non-Bitcoin master key', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          status: 400,
          errors: { masterKey: ['Not a valid Bitcoin extended public key'] }
        })
      });

      await expect(translate.getAddressesByMasterKey('xpub123')).rejects.toThrow(TransactionError);
    });

    it('should handle internal server error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          status: 500,
          error: 'Internal server error'
        })
      });

      await expect(translate.getAddressesByMasterKey('xpub123')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => null
      });
      await expect(translate.getAddressesByMasterKey('xpub123')).rejects.toThrow(TransactionError);
    });
  });

  describe('getAddressesByXpub (deprecated)', () => {
    it('should still work for backward compatibility', async () => {
      const mockAddresses = [
        '1FZMpLkc9W9hqv5dFvtTPqDwzEP8tZvm7z',
        '1NPBJiJSvdPrRtYt2Y9732Hvvhs5tCAiw9',
        '1AD83uQSNhQ3FMeiigaRAxkGowrnVpHXPk'
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAddresses
      });

      const response = await translate.getAddressesByXpub('xpub123');
      expect(response).toEqual(mockAddresses);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://translate.noves.fi/uxto/btc/addresses/xpub123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'apiKey': 'test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('getTransactions', () => {
    const mockAddress = '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL';
    const mockTransactionReceive = {
      txTypeVersion: 2,
      chain: 'btc',
      accountAddress: mockAddress,
      classificationData: {
        type: 'receiveToken',
        source: {
          type: 'human'
        },
        description: '',
        protocol: {},
        sent: [],
        received: [
          {
            action: 'receiveToken',
            from: {
              name: '',
              address: '3FcoNNfPJSfo58w9Zv5B1DmJBMe4Up17HF'
            },
            to: {
              name: null,
              address: mockAddress
            },
            amount: '0.00016199',
            token: {
              symbol: 'BTC',
              name: 'Bitcoin',
              decimals: 8,
              address: 'BTC'
            }
          }
        ],
        utxo: {
          summary: {
            inputs: [
              {
                senders: ['3FcoNNfPJSfo58w9Zv5B1DmJBMe4Up17HF'],
                totalSent: {
                  amount: '0.00024735',
                  token: {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    decimals: 8,
                    address: 'BTC'
                  }
                }
              }
            ],
            outputs: [
              {
                receivers: ['36UsxVpZcQjydzke8NpvXTCDd1mvB7NM5p', mockAddress],
                totalReceived: {
                  amount: '0.00023769',
                  token: {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    decimals: 8,
                    address: 'BTC'
                  }
                }
              }
            ]
          }
        }
      },
      rawTransactionData: {
        transactionHash: '002dbd999b8f3c9d3c3cb57875a0e83512d072df03eeca0c6089374cc1168c78',
        blockNumber: 868128,
        transactionFee: {
          amount: '0.00000966',
          token: {
            symbol: 'BTC',
            name: 'Bitcoin',
            decimals: 8,
            address: 'BTC'
          }
        },
        timestamp: 1730310693
      }
    };

    const mockTransactionSend = {
      txTypeVersion: 2,
      chain: 'btc',
      accountAddress: mockAddress,
      classificationData: {
        type: 'sendToken',
        source: {
          type: 'human'
        },
        description: '',
        protocol: {},
        sent: [
          {
            action: 'paidGas',
            from: {
              name: null,
              address: mockAddress
            },
            to: {
              name: 'Miners',
              address: null
            },
            amount: '0.00001288',
            token: {
              symbol: 'BTC',
              name: 'Bitcoin',
              decimals: 8,
              address: 'BTC'
            }
          }
        ],
        received: [],
        utxo: {
          summary: {
            inputs: [
              {
                senders: [mockAddress],
                totalSent: {
                  amount: '0.00377184',
                  token: {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    decimals: 8,
                    address: 'BTC'
                  }
                }
              }
            ],
            outputs: [
              {
                receivers: ['bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', mockAddress],
                totalReceived: {
                  amount: '0.00375896',
                  token: {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    decimals: 8,
                    address: 'BTC'
                  }
                }
              }
            ]
          }
        }
      },
      rawTransactionData: {
        transactionHash: '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e',
        blockNumber: 862699,
        transactionFee: {
          amount: '0.00001288',
          token: {
            symbol: 'BTC',
            name: 'Bitcoin',
            decimals: 8,
            address: 'BTC'
          }
        },
        timestamp: 1727202127
      }
    };

    it('should fetch transactions with default parameters', async () => {
      const mockResponse = {
        items: [mockTransactionReceive],
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: false,
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.getTransactions('btc', mockAddress);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      expect(mockRequest).toHaveBeenCalledWith(
        'btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
      );
    });

    it('should fetch transactions with all optional parameters', async () => {
      const pageOptions = {
        pageSize: 5,
        startBlock: 865798,
        endBlock: 868128,
        startTimestamp: 1729018695,
        endTimestamp: 1730310693,
        sort: 'desc' as const
      };

      const mockResponse = {
        items: [mockTransactionReceive],
        pageNumber: 1,
        pageSize: 5,
        hasNextPage: true,
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?endBlock=865798&pageSize=5'
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.getTransactions('btc', mockAddress, pageOptions);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      expect(mockRequest).toHaveBeenCalledWith(
        'btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?pageSize=5&startBlock=865798&endBlock=868128&startTimestamp=1729018695&endTimestamp=1730310693&sort=desc'
      );
    });

    it('should handle pagination correctly', async () => {
      const mockResponse = {
        items: [mockTransactionReceive],
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: true,
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?endBlock=865798&pageSize=10'
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.getTransactions('btc', mockAddress);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      expect(transactions.getNextPageKeys()).toBeTruthy();
    });

    it('should handle transactions with null addresses (miners)', async () => {
      const mockResponse = {
        items: [mockTransactionSend],
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: false,
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.getTransactions('btc', mockAddress);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      
      // Test that null addresses are properly handled
      const txs = transactions.getTransactions();
      const sentTransfer = txs[0].classificationData.sent[0];
      expect(sentTransfer.to.address).toBeNull();
      expect(sentTransfer.to.name).toBe('Miners');
    });

    it('should throw TransactionError for invalid pageSize', async () => {
      const pageOptions = {
        pageSize: 101 // Max is 100
      };

      await expect(translate.getTransactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError for invalid sort value', async () => {
      const pageOptions = {
        sort: 'invalid' as any
      };

      await expect(translate.getTransactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError for invalid block range', async () => {
      const pageOptions = {
        startBlock: 868128,
        endBlock: 865798 // startBlock > endBlock
      };

      await expect(translate.getTransactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError for invalid timestamp range', async () => {
      const pageOptions = {
        startTimestamp: 1730310693,
        endTimestamp: 1729018695 // startTimestamp > endTimestamp
      };

      await expect(translate.getTransactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { accountAddress: ['Invalid address format'] }
      }), { status: 400 }));

      await expect(translate.getTransactions('btc', 'invalid-address'))
        .rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions (deprecated)', () => {
    const mockAddress = '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL';
    const mockTransaction = {
      txTypeVersion: 2,
      chain: 'btc',
      accountAddress: mockAddress,
      classificationData: {
        type: 'receiveToken',
        source: { type: 'human' },
        description: '',
        protocol: {},
        sent: [],
        received: [],
        utxo: {
          summary: {
            inputs: [],
            outputs: []
          }
        }
      },
      rawTransactionData: {
        transactionHash: 'test-hash',
        blockNumber: 123456,
        transactionFee: {
          amount: '0.00001',
          token: {
            symbol: 'BTC',
            name: 'Bitcoin',
            decimals: 8,
            address: 'BTC'
          }
        },
        timestamp: 1234567890
      }
    };

    it('should work as alias for getTransactions', async () => {
      const mockResponse = {
        items: [mockTransaction],
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: false,
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.Transactions('btc', mockAddress);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      expect(mockRequest).toHaveBeenCalledWith(
        'btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
      );
    });
  });

  describe('getTransaction', () => {
    it('should fetch transaction details successfully', async () => {
      const mockTransaction = {
        txTypeVersion: 2,
        chain: 'btc',
        accountAddress: '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL',
        classificationData: {
          type: 'sendToken',
          source: {
            type: 'human'
          },
          description: '',
          protocol: {},
          sent: [
            {
              action: 'paidGas',
              from: {
                name: null,
                address: '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
              },
              to: {
                name: 'Miners',
                address: null
              },
              amount: '0.00001288',
              token: {
                symbol: 'BTC',
                name: 'Bitcoin',
                decimals: 8,
                address: 'BTC'
              }
            }
          ],
          received: [],
          utxo: {
            summary: {
              inputs: [
                {
                  senders: ['3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'],
                  totalSent: {
                    amount: '0.00377184',
                    token: {
                      symbol: 'BTC',
                      name: 'Bitcoin',
                      decimals: 8,
                      address: 'BTC'
                    }
                  }
                }
              ],
              outputs: [
                {
                  receivers: ['bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'],
                  totalReceived: {
                    amount: '0.00375896',
                    token: {
                      symbol: 'BTC',
                      name: 'Bitcoin',
                      decimals: 8,
                      address: 'BTC'
                    }
                  }
                }
              ]
            }
          }
        },
        rawTransactionData: {
          transactionHash: '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e',
          blockNumber: 862699,
          transactionFee: {
            amount: '0.00001288',
            token: {
              symbol: 'BTC',
              name: 'Bitcoin',
              decimals: 8,
              address: 'BTC'
            }
          },
          timestamp: 1727202127
        }
      };

      mockRequest.mockResolvedValue({ response: mockTransaction });

      const response = await translate.getTransaction('btc', '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e');
      expect(response).toEqual(mockTransaction);
    });

    it('should fetch transaction details with viewAsAccountAddress', async () => {
      const mockTransaction = {
        txTypeVersion: 2,
        chain: 'btc',
        accountAddress: '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL',
        classificationData: {
          type: 'sendToken',
          source: {
            type: 'human'
          },
          description: '',
          protocol: {},
          sent: [],
          received: [
            {
              action: 'receivedToken',
              from: {
                name: null,
                address: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'
              },
              to: {
                name: null,
                address: '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
              },
              amount: '0.0000792',
              token: {
                symbol: 'BTC',
                name: 'Bitcoin',
                decimals: 8,
                address: 'BTC'
              }
            }
          ],
          utxo: {
            summary: {
              inputs: [
                {
                  senders: ['bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'],
                  totalSent: {
                    amount: '0.0000792',
                    token: {
                      symbol: 'BTC',
                      name: 'Bitcoin',
                      decimals: 8,
                      address: 'BTC'
                    }
                  }
                }
              ],
              outputs: [
                {
                  receivers: ['3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'],
                  totalReceived: {
                    amount: '0.0000792',
                    token: {
                      symbol: 'BTC',
                      name: 'Bitcoin',
                      decimals: 8,
                      address: 'BTC'
                    }
                  }
                }
              ]
            }
          }
        },
        rawTransactionData: {
          transactionHash: '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e',
          blockNumber: 862699,
          transactionFee: {
            amount: '0.00001288',
            token: {
              symbol: 'BTC',
              name: 'Bitcoin',
              decimals: 8,
              address: 'BTC'
            }
          },
          timestamp: 1727202127
        }
      };

      mockRequest.mockResolvedValue({ response: mockTransaction });

      const response = await translate.getTransaction(
        'btc',
        '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e',
        '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
      );
      expect(response).toEqual(mockTransaction);
      expect(mockRequest).toHaveBeenCalledWith(
        'btc/tx/5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e?viewAsAccountAddress=3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
      );
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { hash: ['Invalid transaction hash format'] }
      }), { status: 400 }));

      await expect(translate.getTransaction('btc', 'invalid-tx-hash')).rejects.toThrow(TransactionError);
    });

    it('should handle transaction not found', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 404,
        error: 'Transaction not found'
      }), { status: 404 }));

      await expect(translate.getTransaction('btc', '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e'))
        .rejects.toThrow(TransactionError);
    });

    it('should handle internal server error', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 500,
        error: 'Internal server error'
      }), { status: 500 }));

      await expect(translate.getTransaction('btc', '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e'))
        .rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenBalances', () => {
    const mockAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
    const mockBalances = [
      {
        balance: '103.06451383',
        token: {
          symbol: 'BTC',
          name: 'Bitcoin',
          decimals: 8,
          address: 'BTC'
        }
      }
    ];

    it('should fetch token balances successfully', async () => {
      mockRequest.mockResolvedValue({ response: mockBalances });

      const balances = await translate.getTokenBalances('btc', mockAddress);
      expect(balances).toEqual(mockBalances);
      expect(mockRequest).toHaveBeenCalledWith('btc/tokens/balancesOf/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    });

    it('should fetch token balances with block number', async () => {
      mockRequest.mockResolvedValue({ response: mockBalances });

      const balances = await translate.getTokenBalances('btc', mockAddress, 865798);
      expect(balances).toEqual(mockBalances);
      expect(mockRequest).toHaveBeenCalledWith('btc/tokens/balancesOf/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?blockNumber=865798');
    });

    it('should fetch token balances with timestamp', async () => {
      mockRequest.mockResolvedValue({ response: mockBalances });

      const balances = await translate.getTokenBalances('btc', mockAddress, undefined, 1730310693);
      expect(balances).toEqual(mockBalances);
      expect(mockRequest).toHaveBeenCalledWith('btc/tokens/balancesOf/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?timestamp=1730310693');
    });

    it('should fetch token balances with custom options', async () => {
      mockRequest.mockResolvedValue({ response: mockBalances });

      const balances = await translate.getTokenBalances(
        'btc',
        mockAddress,
        undefined,
        undefined,
        true,
        false
      );
      expect(balances).toEqual(mockBalances);
      expect(mockRequest).toHaveBeenCalledWith('btc/tokens/balancesOf/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({ response: null });
      await expect(translate.getTokenBalances('btc', mockAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid token balance format', async () => {
      mockRequest.mockResolvedValue({
        response: [{
          balance: '103.06451383',
          token: {
            symbol: 'BTC'
            // Missing required fields
          }
        }]
      });
      await expect(translate.getTokenBalances('btc', mockAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { accountAddress: ['Invalid address format'] }
      }), { status: 400 }));

      await expect(translate.getTokenBalances('btc', 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle internal server error', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 500,
        error: 'Internal server error'
      }), { status: 500 }));

      await expect(translate.getTokenBalances('btc', mockAddress)).rejects.toThrow(TransactionError);
    });
  });

  describe('Transaction Job', () => {
    const validChain = 'btc';
    const validAddress = '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL';

    it('should start and get transaction job results', async () => {
      const mockJobResponse = {
        jobId: '0x8085a40fba898e3722db2c7587965b307632c0bb',
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/job/0x8085a40fba898e3722db2c7587965b307632c0bb?pageNumber=1&pageSize=100&ascending=false'
      };
      mockRequest.mockResolvedValue({ response: mockJobResponse });
      
      const job = await translate.startTransactionJob(
        validChain,
        validAddress,
        800000,
        800010
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');
      expect(job).toHaveProperty('nextPageUrl');
      expect(job.jobId).toBe('0x8085a40fba898e3722db2c7587965b307632c0bb');

      const mockResultsResponse = {
        items: [],
        pageSize: 100,
        hasNextPage: false,
        nextPageUrl: null
      };
      mockRequest.mockResolvedValue({ response: mockResultsResponse });
      const results = await translate.getTransactionJobResults(validChain, job.jobId, { pageSize: 100 });
      expect(results).toBeDefined();
      expect(results).toHaveProperty('items');
      expect(results).toHaveProperty('pageSize');
      expect(results).toHaveProperty('hasNextPage');
      expect(results).toHaveProperty('nextPageUrl');
    });

    it('should start transaction job with timestamp range', async () => {
      const mockJobResponse = {
        jobId: '0x8085a40fba898e3722db2c7587965b307632c0bb',
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/job/0x8085a40fba898e3722db2c7587965b307632c0bb?pageNumber=1&pageSize=100&ascending=false'
      };
      mockRequest.mockResolvedValue({ response: mockJobResponse });
      
      const job = await translate.startTransactionJob(
        validChain,
        validAddress,
        undefined,
        undefined,
        1609459200, // 2021-01-01
        1640995200  // 2022-01-01
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');
      expect(job).toHaveProperty('nextPageUrl');
      expect(mockRequest).toHaveBeenCalledWith(
        'btc/txs/job/start?accountAddress=3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL&startTimestamp=1609459200&endTimestamp=1640995200',
        'POST'
      );
    });

    it('should handle invalid address in startTransactionJob', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { accountAddress: ['Invalid address format'] }
      }), { status: 400 }));
      
      await expect(translate.startTransactionJob(
        validChain,
        'invalid-address',
        800000,
        800010
      )).rejects.toThrow(TransactionError);
    });

    it('should handle job not finished yet (425 status)', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 425,
        detail: {
          message: 'Job 0x8085a40fba898e3722db2c7587965b307632c0bb is not finished yet',
          txsProcessed: 150
        }
      }), { status: 425 }));
      
      await expect(translate.getTransactionJobResults(validChain, '0x8085a40fba898e3722db2c7587965b307632c0bb'))
        .rejects.toThrow(TransactionError);
    });

    it('should handle non-existent job ID', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 404,
        error: 'Job not found'
      }), { status: 404 }));
      
      await expect(translate.getTransactionJobResults(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });

    it('should handle pagination in getTransactionJobResults', async () => {
      const mockJobResponse = {
        jobId: '0x8085a40fba898e3722db2c7587965b307632c0bb',
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/job/0x8085a40fba898e3722db2c7587965b307632c0bb?pageNumber=1&pageSize=100&ascending=false'
      };
      mockRequest.mockResolvedValue({ response: mockJobResponse });
      
      const job = await translate.startTransactionJob(
        validChain,
        validAddress,
        800000,
        800010
      );

      const mockResultsResponse = {
        items: [],
        pageSize: 50,
        hasNextPage: true,
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/job/0x8085a40fba898e3722db2c7587965b307632c0bb?pageNumber=2&pageSize=50&ascending=false'
      };
      mockRequest.mockResolvedValue({ response: mockResultsResponse });
      
      const pageOptions = { pageSize: 50, pageNumber: 1, ascending: false };
      const results = await translate.getTransactionJobResults(validChain, job.jobId, pageOptions);
      expect(results).toBeDefined();
      expect(results).toHaveProperty('items');
      expect(results).toHaveProperty('pageSize');
      expect(results).toHaveProperty('hasNextPage');
      expect(results).toHaveProperty('nextPageUrl');
      expect(results.pageSize).toBe(50);
      expect(results.hasNextPage).toBe(true);
    });

    it('should delete a transaction job', async () => {
      const mockJobResponse = {
        jobId: '0x8085a40fba898e3722db2c7587965b307632c0bb',
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/job/0x8085a40fba898e3722db2c7587965b307632c0bb?pageNumber=1&pageSize=100&ascending=false'
      };
      mockRequest.mockResolvedValue({ response: mockJobResponse });
      
      const job = await translate.startTransactionJob(
        validChain,
        validAddress,
        800000,
        800010
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');

      const mockDeleteResponse = {
        message: `Job ${job.jobId} deleted`
      };
      mockRequest.mockResolvedValue({ response: mockDeleteResponse });
      
      const deleteResult = await translate.deleteTransactionJob(validChain, job.jobId);
      expect(deleteResult).toBeDefined();
      expect(deleteResult).toHaveProperty('message');
      expect(deleteResult.message).toContain('deleted');
      expect(mockRequest).toHaveBeenCalledWith('btc/txs/job/0x8085a40fba898e3722db2c7587965b307632c0bb', 'DELETE');
    });

    it('should handle non-existent job ID when deleting', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 404,
        error: 'Job not found'
      }), { status: 404 }));
      
      await expect(translate.deleteTransactionJob(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });

    it('should handle internal server error in job operations', async () => {
      // Test startTransactionJob
      mockRequest.mockRejectedValueOnce(new Response(JSON.stringify({
        status: 500,
        error: 'Internal server error'
      }), { status: 500 }));
      
      await expect(translate.startTransactionJob(validChain, validAddress, 800000, 800010))
        .rejects.toThrow(TransactionError);
      
      // Test getTransactionJobResults
      mockRequest.mockRejectedValueOnce(new Response(JSON.stringify({
        status: 500,
        error: 'Internal server error'
      }), { status: 500 }));
      
      await expect(translate.getTransactionJobResults(validChain, 'test-job-id'))
        .rejects.toThrow(TransactionError);
      
      // Test deleteTransactionJob
      mockRequest.mockRejectedValueOnce(new Response(JSON.stringify({
        status: 500,
        error: 'Internal server error'
      }), { status: 500 }));
      
      await expect(translate.deleteTransactionJob(validChain, 'test-job-id'))
        .rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format in job operations', async () => {
      mockRequest.mockResolvedValue({ response: null });
      
      await expect(translate.startTransactionJob(validChain, validAddress, 800000, 800010))
        .rejects.toThrow(TransactionError);
      
      await expect(translate.getTransactionJobResults(validChain, 'test-job-id'))
        .rejects.toThrow(TransactionError);
      
      await expect(translate.deleteTransactionJob(validChain, 'test-job-id'))
        .rejects.toThrow(TransactionError);
    });
  });
});