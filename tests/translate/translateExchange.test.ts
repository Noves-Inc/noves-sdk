import { TranslateExchange } from "../../src/translate/translateExchange";
import { TransactionError } from "../../src/errors/TransactionError";
import { ErrorType } from "../../src/errors/ErrorTypes";
import { 
  ExchangeTranslateExchanges,
  ExchangeTranslateAccountsResponse,
  ExchangeTranslateBalancesResponse,
  ExchangeTranslateTransactionsResponse,
  ExchangeTranslateAuthRequest,
  ExchangeTranslatePageOptions
} from "../../src/types/exchange";

jest.setTimeout(30000);

describe('TranslateExchange', () => {
  let translateExchange: TranslateExchange;
  let mockRequest: jest.Mock;
  const testApiKey = 'test-api-key';
  const mockAuthRequest: ExchangeTranslateAuthRequest = {
    auth: {
      apiKey: "test-api-key-mock-value-not-real",
      walletAddress: "0x1234567890123456789012345678901234567890",
      testnet: false
    }
  };

  beforeEach(() => {
    mockRequest = jest.fn();
    translateExchange = new TranslateExchange(testApiKey);
    (translateExchange as any).makeRequest = mockRequest;
  });

  describe('constructor', () => {
    it('should create instance with valid API key', () => {
      expect(() => new TranslateExchange(testApiKey)).not.toThrow();
    });

    it('should throw error when API key is not provided', () => {
      expect(() => new TranslateExchange('')).toThrow('API key is required');
    });
  });

  describe('getExchanges', () => {
    it('should get list of supported exchanges', async () => {
      const mockResponse: ExchangeTranslateExchanges = [
        {
          name: "hyperliquid",
          ecosystem: "exchange",
          tier: 2
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateExchange.getExchanges();

      expect(mockRequest).toHaveBeenCalledWith('exchanges');
      expect(result).toEqual(mockResponse);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('name', 'hyperliquid');
      expect(result[0]).toHaveProperty('ecosystem', 'exchange');
      expect(result[0]).toHaveProperty('tier', 2);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue('invalid response');
      await expect(translateExchange.getExchanges()).rejects.toThrow(TransactionError);
    });

    it('should handle missing required fields in exchange object', async () => {
      mockRequest.mockResolvedValue([{ name: 'test' }]); // missing ecosystem and tier
      await expect(translateExchange.getExchanges()).rejects.toThrow(TransactionError);
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid API Key'] }));
      await expect(translateExchange.getExchanges()).rejects.toThrow(TransactionError);
    });
  });

  describe('getAccounts', () => {
    it('should get accounts for valid exchange and auth', async () => {
      const mockResponse: ExchangeTranslateAccountsResponse = {
        accounts: [
          {
            id: "0x1234567890123456789012345678901234567890",
            type: "spot",
            name: "HyperLiquid Account (0x1234567890123456789012345678901234567890)",
            code: "USDC"
          }
        ]
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateExchange.getAccounts('hyperliquid', mockAuthRequest);

      expect(mockRequest).toHaveBeenCalledWith('hyperliquid/accounts', 'POST', {
        body: JSON.stringify(mockAuthRequest)
      });
      expect(result).toEqual(mockResponse);
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0]).toHaveProperty('id');
      expect(result.accounts[0]).toHaveProperty('type', 'spot');
      expect(result.accounts[0]).toHaveProperty('name');
      expect(result.accounts[0]).toHaveProperty('code', 'USDC');
    });

    it('should throw error when exchange name is missing', async () => {
      await expect(translateExchange.getAccounts('', mockAuthRequest))
        .rejects.toThrow('Exchange name is required');
    });

    it('should throw error when auth is missing', async () => {
      await expect(translateExchange.getAccounts('hyperliquid', {} as ExchangeTranslateAuthRequest))
        .rejects.toThrow('Authentication credentials are required');
    });

    it('should throw error when apiKey is missing', async () => {
      const invalidAuth = {
        auth: {
          walletAddress: "0x1234567890123456789012345678901234567890",
          testnet: false
        }
      } as ExchangeTranslateAuthRequest;

      await expect(translateExchange.getAccounts('hyperliquid', invalidAuth))
        .rejects.toThrow('API key and wallet address are required');
    });

    it('should throw error when walletAddress is missing', async () => {
      const invalidAuth = {
        auth: {
          apiKey: "test-api-key-mock-value-not-real",
          testnet: false
        }
      } as ExchangeTranslateAuthRequest;

      await expect(translateExchange.getAccounts('hyperliquid', invalidAuth))
        .rejects.toThrow('API key and wallet address are required');
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalidField: 'test' });
      await expect(translateExchange.getAccounts('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid response format');
    });

    it('should handle invalid account format', async () => {
      mockRequest.mockResolvedValue({ 
        accounts: [{ id: 'test' }] // missing required fields
      });
      await expect(translateExchange.getAccounts('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid account format');
    });
  });

  describe('getBalances', () => {
    it('should get balances for valid exchange and auth', async () => {
      const mockResponse: ExchangeTranslateBalancesResponse = {
        balances: [
          {
            balance: "0.000280",
            token: {
              symbol: "BTC-PERP",
              name: "BTC-PERP",
              decimals: "8"
            }
          },
          {
            balance: "13.740014",
            token: {
              symbol: "USDC",
              name: "USD Coin",
              decimals: "6"
            }
          }
        ]
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateExchange.getBalances('hyperliquid', mockAuthRequest);

      expect(mockRequest).toHaveBeenCalledWith('hyperliquid/balances', 'POST', {
        body: JSON.stringify(mockAuthRequest)
      });
      expect(result).toEqual(mockResponse);
      expect(result.balances).toHaveLength(2);
      expect(result.balances[0]).toHaveProperty('balance', '0.000280');
      expect(result.balances[0].token).toHaveProperty('symbol', 'BTC-PERP');
      expect(result.balances[0].token).toHaveProperty('name', 'BTC-PERP');
      expect(result.balances[0].token).toHaveProperty('decimals', '8');
      expect(result.balances[1]).toHaveProperty('balance', '13.740014');
      expect(result.balances[1].token).toHaveProperty('symbol', 'USDC');
    });

    it('should throw error when exchange name is missing', async () => {
      await expect(translateExchange.getBalances('', mockAuthRequest))
        .rejects.toThrow('Exchange name is required');
    });

    it('should throw error when auth is missing', async () => {
      await expect(translateExchange.getBalances('hyperliquid', {} as ExchangeTranslateAuthRequest))
        .rejects.toThrow('Authentication credentials are required');
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalidField: 'test' });
      await expect(translateExchange.getBalances('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid response format');
    });

    it('should handle invalid balance format', async () => {
      mockRequest.mockResolvedValue({ 
        balances: [{ balance: '1.0' }] // missing token
      });
      await expect(translateExchange.getBalances('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid balance format');
    });

    it('should handle invalid token format', async () => {
      mockRequest.mockResolvedValue({ 
        balances: [{ 
          balance: '1.0',
          token: { symbol: 'BTC' } // missing name and decimals
        }]
      });
      await expect(translateExchange.getBalances('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid token format');
    });
  });

  describe('getTransactions', () => {
    it('should get transactions for valid exchange and auth', async () => {
      const mockResponse: ExchangeTranslateTransactionsResponse = {
        items: [
          {
            txTypeVersion: 6,
            source: {
              type: "human"
            },
            chain: "hyperliquid",
            timestamp: 1756419311861,
            classificationData: {
              type: "sendToBridge"
            },
            transfers: [
              {
                action: "withdrawalDebited",
                from: {
                  name: "Exchange Account",
                  address: null
                },
                to: {
                  name: "External Wallet",
                  address: null
                },
                amount: 1.0,
                asset: {
                  symbol: "USDC"
                }
              }
            ],
            values: [],
            rawTransactionData: {
              status: "complete",
              destinationTx: {
                chain: "hyperliquid",
                to: null,
                transactionHash: "0x6ae570f80af6236b12e57d810fa7e4f11e63560dd20cfe3d28f06b9d4af3e7e3",
                timestamp: 1756419311861
              }
            }
          }
        ],
        pageSize: 2,
        hasNextPage: false
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateExchange.getTransactions('hyperliquid', mockAuthRequest);

      expect(mockRequest).toHaveBeenCalledWith('hyperliquid/txs', 'POST', {
        body: JSON.stringify(mockAuthRequest)
      });
      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(1);
      expect(result.pageSize).toBe(2);
      expect(result.hasNextPage).toBe(false);
      expect(result.items[0]).toHaveProperty('txTypeVersion', 6);
      expect(result.items[0]).toHaveProperty('chain', 'hyperliquid');
      expect(result.items[0].classificationData).toHaveProperty('type', 'sendToBridge');
      expect(result.items[0].transfers).toHaveLength(1);
    });

    it('should get transactions with pagination options', async () => {
      const mockResponse: ExchangeTranslateTransactionsResponse = {
        items: [],
        pageSize: 4,
        hasNextPage: true,
        nextPageUrl: "https://translate.noves.fi/exchange/hyperliquid/txs?pageSize=4&endTimestamp=1756396547167"
      };

      mockRequest.mockResolvedValue(mockResponse);

      const pageOptions: ExchangeTranslatePageOptions = {
        startTimestamp: 1000000000,
        endTimestamp: 2000000000,
        pageSize: 10,
        pageKey: "testPageKey"
      };

      const result = await translateExchange.getTransactions('hyperliquid', mockAuthRequest, pageOptions);

      expect(mockRequest).toHaveBeenCalledWith(
        'hyperliquid/txs?startTimestamp=1000000000&endTimestamp=2000000000&pageSize=10&pageKey=testPageKey', 
        'POST', 
        {
          body: JSON.stringify(mockAuthRequest)
        }
      );
      expect(result).toEqual(mockResponse);
      expect(result.pageSize).toBe(4);
      expect(result.hasNextPage).toBe(true);
      expect(result.nextPageUrl).toBe("https://translate.noves.fi/exchange/hyperliquid/txs?pageSize=4&endTimestamp=1756396547167");
    });

    it('should handle pagination format exactly as specified in requirements', async () => {
      // Test case 1: Response with nextPageUrl (hasNextPage: true)
      const mockResponseWithNext: ExchangeTranslateTransactionsResponse = {
        items: [],
        pageSize: 2,
        hasNextPage: true,
        nextPageUrl: "https://translate.noves.fi/exchange/hyperliquid/txs?pageSize=2&endTimestamp=1756396547167"
      };

      mockRequest.mockResolvedValue(mockResponseWithNext);

      const result1 = await translateExchange.getTransactions('hyperliquid', mockAuthRequest);

      // Validate the exact structure from your requirements
      expect(result1).toHaveProperty('pageSize', 2);
      expect(result1).toHaveProperty('hasNextPage', true);
      expect(result1).toHaveProperty('nextPageUrl', "https://translate.noves.fi/exchange/hyperliquid/txs?pageSize=2&endTimestamp=1756396547167");
      expect(result1.items).toBeDefined();
      expect(Array.isArray(result1.items)).toBe(true);

      // Test case 2: Response without nextPageUrl (hasNextPage: false)
      const mockResponseNoNext: ExchangeTranslateTransactionsResponse = {
        items: [],
        pageSize: 2,
        hasNextPage: false
      };

      mockRequest.mockResolvedValue(mockResponseNoNext);

      const result2 = await translateExchange.getTransactions('hyperliquid', mockAuthRequest);

      // Validate the exact structure for last page
      expect(result2).toHaveProperty('pageSize', 2);
      expect(result2).toHaveProperty('hasNextPage', false);
      expect(result2).not.toHaveProperty('nextPageUrl');
      expect(result2.items).toBeDefined();
      expect(Array.isArray(result2.items)).toBe(true);
    });

    it('should throw error when exchange name is missing', async () => {
      await expect(translateExchange.getTransactions('', mockAuthRequest))
        .rejects.toThrow('Exchange name is required');
    });

    it('should throw error when auth is missing', async () => {
      await expect(translateExchange.getTransactions('hyperliquid', {} as ExchangeTranslateAuthRequest))
        .rejects.toThrow('Authentication credentials are required');
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalidField: 'test' });
      await expect(translateExchange.getTransactions('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid response format');
    });

    it('should handle invalid transaction format', async () => {
      mockRequest.mockResolvedValue({ 
        items: [{ txTypeVersion: 6 }], // missing required fields
        pageSize: 2,
        hasNextPage: false
      });
      await expect(translateExchange.getTransactions('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid transaction format');
    });

    it('should handle invalid classificationData format', async () => {
      mockRequest.mockResolvedValue({ 
        items: [{
          txTypeVersion: 6,
          source: { type: "human" },
          chain: "hyperliquid",
          timestamp: 1756419311861,
          classificationData: {}, // missing type
          transfers: [],
          values: [],
          rawTransactionData: {
            status: "complete",
            destinationTx: {
              chain: "hyperliquid",
              to: null,
              transactionHash: "0x123",
              timestamp: 1756419311861
            }
          }
        }],
        pageSize: 2,
        hasNextPage: false
      });
      await expect(translateExchange.getTransactions('hyperliquid', mockAuthRequest))
        .rejects.toThrow('Invalid classificationData format');
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }));
      await expect(translateExchange.getTransactions('hyperliquid', mockAuthRequest))
        .rejects.toThrow(TransactionError);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));
      await expect(translateExchange.getExchanges()).rejects.toThrow(TransactionError);
    });

    it('should handle transaction errors with proper error type', async () => {
      const transactionError = new TransactionError(
        { message: ['Rate limit exceeded'] }, 
        ErrorType.RATE_LIMIT_EXCEEDED
      );
      mockRequest.mockRejectedValue(transactionError);
      await expect(translateExchange.getExchanges()).rejects.toThrow(TransactionError);
    });
  });
});
