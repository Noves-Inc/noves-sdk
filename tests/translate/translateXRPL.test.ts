import { TranslateXRPL } from "../../src/translate/translateXRPL";
import { TransactionError } from "../../src/errors/TransactionError";
import { PageOptions } from "../../src/types/common";
import { TransactionsPage } from "../../src/translate/transactionsPage";

jest.setTimeout(30000);

describe('TranslateXRPL', () => {
  let translateXRPL: TranslateXRPL;
  let mockRequest: jest.Mock;
  const validAddress = 'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye';
  const validTxHash = 'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE';
  const validChain = 'xrpl';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateXRPL = new TranslateXRPL('test-api-key');
    (translateXRPL as any).makeRequest = mockRequest;
  });

  describe('getChains', () => {
    it('should get list of supported chains', async () => {
      const mockResponse = [
        {
          name: 'xrpl',
          tier: 1,
          nativeCoin: {
            name: 'XRP',
            symbol: 'XRP',
            address: 'XRP',
            decimals: 6
          }
        }
      ];

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getChains();

      expect(mockRequest).toHaveBeenCalledWith('chains');
      expect(result).toEqual(mockResponse);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('name', 'xrpl');
      expect(result[0]).toHaveProperty('tier', 1);
      expect(result[0].nativeCoin).toHaveProperty('symbol', 'XRP');
    });

    it('should throw error for invalid response format', async () => {
      mockRequest.mockResolvedValue('invalid response');

      await expect(translateXRPL.getChains()).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new Error('API Error'));

      await expect(translateXRPL.getChains()).rejects.toThrow(TransactionError);
    });
  });

  describe('getTransaction', () => {
    it('should get a single transaction', async () => {
      const mockResponse = {
        txTypeVersion: 6,
        chain: 'xrpl',
        accountAddress: 'r3rs9Be59pbtSC6jRJtLPqwrv37DPgqKHH',
        classificationData: {
          type: 'sendToken',
          description: 'Sent 50,000 LOX to r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf.',
          protocol: {
            name: null
          },
          source: {
            type: 'human'
          }
        },
        transfers: [
          {
            action: 'sent',
            amount: '50000',
            from: {
              name: null,
              address: 'r3rs9Be59pbtSC6jRJtLPqwrv37DPgqKHH'
            },
            to: {
              name: null,
              address: 'r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf'
            },
            token: {
              symbol: 'LOX',
              name: 'LOX',
              decimals: 6,
              address: 'LOX',
              issuer: 'r9kzhatDuUyAxAYbbsZAbs8nLr3t7sa6Wk'
            }
          }
        ],
        values: {},
        rawTransactionData: {
          signature: 'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE',
          account: 'r3rs9Be59pbtSC6jRJtLPqwrv37DPgqKHH',
          type: 'Payment',
          fee: '0.000012',
          sequence: 92472535,
          destination: 'r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf',
          result: 'tesSUCCESS',
          ledger_index: 97125760,
          validated: true
        },
        timestamp: 1751166112
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getTransaction(validChain, validTxHash);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tx/${validTxHash}`);
      expect(result).toEqual(mockResponse);
      expect(result.txTypeVersion).toBe(6);
      expect(result.chain).toBe('xrpl');
      expect(result.classificationData.type).toBe('sendToken');
    });

    it('should get a single transaction with viewAsAccountAddress', async () => {
      const mockResponse = {
        txTypeVersion: 6,
        chain: 'xrpl',
        accountAddress: 'r3rs9Be59pbtSC6jRJtLPqwrv37DPgqKHH',
        classificationData: {
          type: 'sendToken',
          description: 'Sent 50,000 LOX to r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf.',
          protocol: { name: null },
          source: { type: 'human' }
        },
        transfers: [],
        values: {},
        rawTransactionData: {
          signature: 'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE',
          account: 'r3rs9Be59pbtSC6jRJtLPqwrv37DPgqKHH',
          type: 'Payment',
          fee: '0.000012',
          sequence: 92472535,
          result: 'tesSUCCESS',
          ledger_index: 97125760
        },
        timestamp: 1751166112
      };

      mockRequest.mockResolvedValue(mockResponse);

      const viewAsAccountAddress = 'rSomeOtherAddress123456789';
      const result = await translateXRPL.getTransaction(validChain, validTxHash, viewAsAccountAddress);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tx/${validTxHash}?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalid: 'response' });

      await expect(translateXRPL.getTransaction(validChain, validTxHash)).rejects.toThrow(TransactionError);
    });

    it('should throw error for invalid classificationData format', async () => {
      const invalidResponse = {
        txTypeVersion: 6,
        chain: 'xrpl',
        accountAddress: 'r3rs9Be59pbtSC6jRJtLPqwrv37DPgqKHH',
        classificationData: {
          // Missing required fields
        },
        transfers: [],
        values: {},
        rawTransactionData: {},
        timestamp: 1751166112
      };

      mockRequest.mockResolvedValue(invalidResponse);

      await expect(translateXRPL.getTransaction(validChain, validTxHash)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTransactions', () => {
    it('should get transactions with default page options', async () => {
      const mockResponse = {
        items: [
          {
            txTypeVersion: 6,
            chain: 'xrpl',
            accountAddress: 'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye',
            classificationData: {
              type: 'sendToken',
              description: 'Sent 0.10 XRP to rwZhjbTDskqJ9PGXW2XRMQaJwiNxrCn1Ty.',
              protocol: { name: null },
              source: { type: 'human' }
            },
            transfers: [
              {
                action: 'sent',
                amount: '0.1',
                from: {
                  name: null,
                  address: 'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye'
                },
                to: {
                  name: null,
                  address: 'rwZhjbTDskqJ9PGXW2XRMQaJwiNxrCn1Ty'
                },
                token: {
                  symbol: 'XRP',
                  name: 'XRP',
                  decimals: 6,
                  address: 'XRP',
                  issuer: null
                }
              }
            ],
            values: {},
            rawTransactionData: {
              signature: '0398F867711E98A0845E53F1D50426C1D3C019CC8E8767C997DC4A2A10CF074E',
              account: 'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye',
              type: 'Payment',
              fee: '0.000012',
              sequence: 95345165,
              destination: 'rwZhjbTDskqJ9PGXW2XRMQaJwiNxrCn1Ty',
              result: 'tesSUCCESS',
              ledger_index: 97824901
            },
            timestamp: 1753890591
          }
        ],
        nextPageSettings: {
          marker: '{\"ledger\":97824478,\"seq\":56}',
          pageSize: 20,
          nextPageUrl: 'https://translate.noves.fi/xrpl/xrpl/txs/rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye?pageSize=20&marker=%7B%22ledger%22%3A97824478%2C%22seq%22%3A56%7D'
        }
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getTransactions(validChain, validAddress);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/txs/${validAddress}`);
      expect(result).toBeInstanceOf(TransactionsPage);
      expect(result.getTransactions()).toEqual(mockResponse.items);
      expect(result.getTransactions()[0].txTypeVersion).toBe(6);
    });

    it('should get transactions with page options', async () => {
      const mockResponse = {
        items: [],
        nextPageSettings: {
          marker: '',
          pageSize: 10,
          nextPageUrl: ''
        }
      };

      mockRequest.mockResolvedValue(mockResponse);

      const pageOptions: PageOptions = {
        pageSize: 10
      };

      const result = await translateXRPL.getTransactions(validChain, validAddress, pageOptions);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/txs/${validAddress}?pageSize=10&sort=desc`);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should throw error for invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalid: 'response' });

      await expect(translateXRPL.getTransactions(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should throw error for invalid items format', async () => {
      mockRequest.mockResolvedValue({
        items: 'not an array',
        nextPageSettings: {}
      });

      await expect(translateXRPL.getTransactions(validChain, validAddress)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenBalances', () => {
    it('should get token balances with default options', async () => {
      const mockResponse = {
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: [
          {
            balance: '2.009992',
            token: {
              symbol: 'XRP',
              name: 'XRP',
              decimals: 6,
              address: 'XRP',
              issuer: 'XRP'
            }
          },
          {
            balance: '-0.1',
            token: {
              symbol: 'USD',
              name: 'USD',
              decimals: 0,
              address: 'USD',
              issuer: 'rnErNnnxRxpkiiHr6LBRuZRov8QMaab9vw'
            }
          }
        ]
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getTokenBalances(validChain, validAddress);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tokens/balancesOf/${validAddress}`);
      expect(result).toEqual(mockResponse);
      expect(result.balances).toHaveLength(2);
      expect(result.balances[0].token.symbol).toBe('XRP');
    });

    it('should get token balances with includePrices', async () => {
      const mockResponse = {
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: []
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getTokenBalances(validChain, validAddress, true);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tokens/balancesOf/${validAddress}?includePrices=true`);
      expect(result).toEqual(mockResponse);
    });

    it('should get token balances with ledgerIndex', async () => {
      const mockResponse = {
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: []
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getTokenBalances(validChain, validAddress, false, 'validated');

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tokens/balancesOf/${validAddress}?ledgerIndex=validated`);
      expect(result).toEqual(mockResponse);
    });

    it('should get token balances with ledgerHash', async () => {
      const mockResponse = {
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: []
      };

      mockRequest.mockResolvedValue(mockResponse);

      const ledgerHash = 'ABCD1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890AB';
      const result = await translateXRPL.getTokenBalances(validChain, validAddress, false, undefined, ledgerHash);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tokens/balancesOf/${validAddress}?ledgerHash=${ledgerHash}`);
      expect(result).toEqual(mockResponse);
    });

    it('should get token balances with all options', async () => {
      const mockResponse = {
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: []
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await translateXRPL.getTokenBalances(validChain, validAddress, true, 'validated', undefined);

      expect(mockRequest).toHaveBeenCalledWith(`${validChain}/tokens/balancesOf/${validAddress}?includePrices=true&ledgerIndex=validated`);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalid: 'response' });

      await expect(translateXRPL.getTokenBalances(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should throw error for invalid balances format', async () => {
      mockRequest.mockResolvedValue({
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: 'not an array'
      });

      await expect(translateXRPL.getTokenBalances(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should throw error for invalid balance format', async () => {
      mockRequest.mockResolvedValue({
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: [
          {
            // Missing required fields
            invalid: 'balance'
          }
        ]
      });

      await expect(translateXRPL.getTokenBalances(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should throw error for invalid token format', async () => {
      mockRequest.mockResolvedValue({
        accountAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
        timestamp: 807377321,
        balances: [
          {
            balance: '2.009992',
            token: {
              // Missing required fields
              symbol: 'XRP'
            }
          }
        ]
      });

      await expect(translateXRPL.getTokenBalances(validChain, validAddress)).rejects.toThrow(TransactionError);
    });
  });

  describe('Constructor', () => {
    it('should create instance with valid API key', () => {
      const apiKey = 'test-api-key';
      const instance = new TranslateXRPL(apiKey);
      
      expect(instance).toBeInstanceOf(TranslateXRPL);
    });

    it('should throw error with empty API key', () => {
      expect(() => new TranslateXRPL('')).toThrow('API key is required');
    });
  });
});