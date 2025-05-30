import { TranslateUTXO } from "../../src/translate/translateUTXO";
import { TransactionError } from "../../src/errors/TransactionError";

jest.setTimeout(10000);

describe('TranslateUTXO', () => {
  let translate: TranslateUTXO;
  let mockRequest: jest.Mock;
  const apiKey = process.env.API_KEY;

  beforeEach(() => {
    mockRequest = jest.fn();
    translate = new TranslateUTXO('test-api-key');
    (translate as any).request = mockRequest;
  });

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }
    translate = new TranslateUTXO(apiKey);
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

  describe('getChain', () => {
    it('should fetch specific chain successfully', async () => {
      const mockChain = {
        "name": "btc",
        "ecosystem": "utxo",
        "nativeCoin": {
          "address": "BTC",
          "decimals": 8,
          "name": "BTC",
          "symbol": "BTC"
        },
        "tier": 2
      };

      mockRequest.mockResolvedValue({ response: [mockChain] });

      const response = await translate.getChain('btc');
      expect(response).toEqual(mockChain);
    });

    it('should throw ChainNotFoundError for non-existent chain', async () => {
      mockRequest.mockResolvedValue({ response: [] });
      await expect(translate.getChain('non-existent')).rejects.toThrow('Chain with name "non-existent" not found.');
    });
  });

  describe('getAddressesByXpub', () => {
    it('should fetch derived addresses successfully', async () => {
      const mockAddresses = [
        '1FZMpLkc9W9hqv5dFvtTPqDwzEP8tZvm7z',
        '1NPBJiJSvdPrRtYt2Y9732Hvvhs5tCAiw9',
        '1AD83uQSNhQ3FMeiigaRAxkGowrnVpHXPk'
      ];

      mockRequest.mockResolvedValue({ response: mockAddresses });

      const response = await translate.getAddressesByXpub('xpub123');
      expect(response).toEqual(mockAddresses);
      expect(mockRequest).toHaveBeenCalledWith('btc/addresses/xpub123');
    });

    it('should handle validation errors for invalid xpub format', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { xpub: ['Invalid xpub format'] }
      }), { status: 400 }));

      await expect(translate.getAddressesByXpub('invalid-xpub')).rejects.toThrow(TransactionError);
    });

    it('should handle validation errors for non-Bitcoin xpub', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { xpub: ['Not a valid Bitcoin extended public key'] }
      }), { status: 400 }));

      await expect(translate.getAddressesByXpub('xpub123')).rejects.toThrow(TransactionError);
    });

    it('should handle internal server error', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 500,
        error: 'Internal server error'
      }), { status: 500 }));

      await expect(translate.getAddressesByXpub('xpub123')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({ response: null });
      await expect(translate.getAddressesByXpub('xpub123')).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    const mockAddress = '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL';
    const mockTransaction = {
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

    it('should fetch transactions with default parameters', async () => {
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
        items: [mockTransaction],
        pageNumber: 1,
        pageSize: 5,
        hasNextPage: true,
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?endBlock=865798&pageSize=5'
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.Transactions('btc', mockAddress, pageOptions);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      expect(mockRequest).toHaveBeenCalledWith(
        'btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?pageSize=5&startBlock=865798&endBlock=868128&startTimestamp=1729018695&endTimestamp=1730310693&sort=desc'
      );
    });

    it('should handle pagination correctly', async () => {
      const mockResponse = {
        items: [mockTransaction],
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: true,
        nextPageUrl: 'https://translate.noves.fi/utxo/btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?endBlock=865798&pageSize=10'
      };

      mockRequest.mockResolvedValue({ response: mockResponse });

      const transactions = await translate.Transactions('btc', mockAddress);
      expect(transactions.getTransactions()).toEqual(mockResponse.items);
      expect(transactions.getNextPageKeys()).toBeTruthy();
    });

    it('should throw TransactionError for invalid pageSize', async () => {
      const pageOptions = {
        pageSize: 101 // Max is 100
      };

      await expect(translate.Transactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError for invalid sort value', async () => {
      const pageOptions = {
        sort: 'invalid' as any
      };

      await expect(translate.Transactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError for invalid block range', async () => {
      const pageOptions = {
        startBlock: 868128,
        endBlock: 865798 // startBlock > endBlock
      };

      await expect(translate.Transactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError for invalid timestamp range', async () => {
      const pageOptions = {
        startTimestamp: 1730310693,
        endTimestamp: 1729018695 // startTimestamp > endTimestamp
      };

      await expect(translate.Transactions('btc', mockAddress, pageOptions))
        .rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { accountAddress: ['Invalid address format'] }
      }), { status: 400 }));

      await expect(translate.Transactions('btc', 'invalid-address'))
        .rejects.toThrow(TransactionError);
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
        balance: '103.06212305',
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
          balance: '103.06212305',
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
});