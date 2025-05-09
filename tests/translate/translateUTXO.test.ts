import { TranslateUTXO } from "../../src/translate/translateUTXO";
import { ChainNotFoundError } from "../../src/errors/ChainNotFoundError";
import { TransactionError } from "../../src/errors/TransactionError";
import { PageOptions } from "../../src/types/types";
import { TransactionsPage } from "../../src/translate/transactionsPage";

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
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '1B1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb'
      ];

      mockRequest.mockResolvedValue({ response: mockAddresses });

      const response = await translate.getAddressesByXpub('xpub123');
      expect(response).toEqual(mockAddresses);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { xpub: ['Invalid xpub format'] }
      }), { status: 400 }));

      await expect(translate.getAddressesByXpub('invalid-xpub')).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = {
        items: [
          { hash: 'tx1', from: 'addr1', to: 'addr2' },
          { hash: 'tx2', from: 'addr2', to: 'addr3' }
        ],
        hasNextPage: false,
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue({ response: mockTransactions });

      const transactions = await translate.Transactions('btc', 'address1');
      expect(transactions.getTransactions()).toEqual(mockTransactions.items);
    });

    it('should handle pagination correctly', async () => {
      const mockTransactions = {
        items: [
          { hash: 'tx1', from: 'addr1', to: 'addr2' }
        ],
        hasNextPage: true,
        nextPageUrl: '/utxo/btc/txs/address1?page=2'
      };

      mockRequest.mockResolvedValue({ response: mockTransactions });

      const transactions = await translate.Transactions('btc', 'address1');
      expect(transactions.getTransactions()).toEqual(mockTransactions.items);
      expect(transactions.getNextPageKeys()).toBeTruthy();
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

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new Response(JSON.stringify({
        status: 400,
        errors: { txHash: ['Invalid transaction hash format'] }
      }), { status: 400 }));

      await expect(translate.getTransaction('btc', 'invalid-tx-hash')).rejects.toThrow(TransactionError);
    });
  });
});