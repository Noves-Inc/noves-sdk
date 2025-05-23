import { TranslateSVM } from "../../src/translate/translateSVM";
import { TransactionError } from "../../src/errors/TransactionError";
import { TransactionsPage } from "../../src/translate/transactionsPage";

jest.setTimeout(30000);

describe('TranslateSVM', () => {
  let translate: TranslateSVM;
  let mockRequest: jest.Mock;
  const apiKey = process.env.API_KEY;
  const validAddress = 'EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho';
  const validSignature = '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq';
  const validChain = 'solana';

  beforeEach(() => {
    mockRequest = jest.fn();
    translate = new TranslateSVM(apiKey || 'test-api-key');
    (translate as any).makeRequest = mockRequest;
  });

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }
    translate = new TranslateSVM(apiKey);
  });

  describe('getChains', () => {
    it('should fetch chains successfully', async () => {
      const mockChains = [
        { 
          "ecosystem": "svm", 
          "name": "solana",
          "nativeCoin": {
            "address": "SOL",
            "decimals": 9,
            "name": "SOL",
            "symbol": "SOL"
          },
          "tier": 1
        }
      ];

      mockRequest.mockResolvedValue(mockChains);

      const response = await translate.getChains();
      expect(response).toEqual(mockChains);
      expect(response.length).toBeGreaterThan(0);
      expect(response[0].ecosystem).toBe('svm');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }));
      await expect(translate.getChains()).rejects.toThrow(TransactionError);
    });
  });

  describe('getTransaction', () => {
    it('should fetch transaction details successfully', async () => {
      const mockTransaction = {
        txTypeVersion: 5,
        source: {
          type: null,
          name: null
        },
        timestamp: 1722892419,
        classificationData: {
          type: 'unclassified',
          description: null
        },
        transfers: [
          {
            action: 'paidGas',
            amount: '0.000005',
            token: {
              decimals: 9,
              address: 'SOL',
              name: 'SOL',
              symbol: 'SOL',
              icon: null
            },
            from: {
              name: null,
              address: validAddress,
              owner: {
                name: null,
                address: null
              }
            },
            to: {
              name: null,
              address: null,
              owner: {
                name: null,
                address: null
              }
            }
          }
        ],
        rawTransactionData: {
          signature: validSignature,
          blockNumber: 281779550,
          signer: validAddress,
          interactedAccounts: ['11111111111111111111111111111111']
        }
      };

      mockRequest.mockResolvedValue(mockTransaction);

      const response = await translate.getTransaction(validChain, validSignature);
      expect(response).toEqual(mockTransaction);
      expect(response.txTypeVersion).toBe(5);
      expect(response.source.type).toBeNull();
      expect(response.classificationData.description).toBeNull();
      expect(response.transfers).toHaveLength(1);
      expect(response.rawTransactionData.signature).toBe(validSignature);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ 
        message: ['The field chain is invalid. Valid chains: solana'] 
      }));
      await expect(translate.getTransaction('invalidChain', 'invalidSignature')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translate.getTransaction(validChain, validSignature)).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = {
        items: [
          {
            txTypeVersion: 5,
            source: {
              type: null,
              name: null
            },
            timestamp: 1746812271,
            classificationData: {
              type: 'unclassified',
              description: null
            },
            transfers: [
              {
                action: 'paidGas',
                amount: '0.000060001',
                token: {
                  decimals: 9,
                  address: 'SOL',
                  name: 'SOL',
                  symbol: 'SOL',
                  icon: null
                },
                from: {
                  name: null,
                  address: validAddress,
                  owner: {
                    name: null,
                    address: null
                  }
                },
                to: {
                  name: null,
                  address: null,
                  owner: {
                    name: null,
                    address: null
                  }
                }
              }
            ],
            rawTransactionData: {
              signature: validSignature,
              blockNumber: 338913770,
              signer: validAddress,
              interactedAccounts: [
                'ComputeBudget111111111111111111111111111111',
                'vvv38Yysp2cUxLE14aNP2F7vayYMmDKisxtSwcLD5ky'
              ]
            }
          }
        ],
        nextPageUrl: 'https://translate.noves.fi/svm/solana/txs/v5/2w31NPGGZ7U2MCd3igujKeG7hggYNzsvknNeotQYJ1FF?pageSize=10&ignoreTransactions=hmaQsG6jQoN12cHkhjK1wkPoPYCsQYm1M7YHXjHo2nyjDCMHrX6GSdPL5jbvooUDkVU22tmfiiEf215Bw8cStJA'
      };

      mockRequest.mockResolvedValue(mockTransactions);

      const transactions = await translate.Transactions(validChain, validAddress);
      expect(transactions).toBeInstanceOf(TransactionsPage);
      expect(transactions.getTransactions()).toEqual(mockTransactions.items);
      expect(transactions.getNextPageKeys()).toBeTruthy();
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ 
        message: ['The field chain is invalid. Valid chains: solana'] 
      }));
      await expect(translate.Transactions('invalidChain', 'invalidAddress')).rejects.toThrow(TransactionError);
    });

    it('should handle pagination correctly', async () => {
      const mockTransactions = {
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      };

      mockRequest.mockResolvedValue(mockTransactions);

      const transactions = await translate.Transactions(validChain, validAddress, { pageSize: 5 });
      expect(transactions).toBeInstanceOf(TransactionsPage);
      expect(transactions.getNextPageKeys()).toBeTruthy();
    });
  });

  describe('getSplTokens', () => {
    it('should fetch SPL tokens successfully', async () => {
      const mockSplTokens = {
        accountPubkey: validAddress,
        tokenAccounts: [
          {
            pubKey: 'C8BCfVRxxtgKWY8u7onvHnGJWdjPLDwzeknpw4rbL2sG'
          },
          {
            pubKey: 'EpqqCgziEC8TJnkJTinyFnVjn2MJL3ZDhQHXYDzxJS1'
          }
        ]
      };

      mockRequest.mockResolvedValue(mockSplTokens);

      const response = await translate.getSplTokens(validAddress);
      expect(response).toEqual(mockSplTokens);
      expect(response.accountPubkey).toBe(validAddress);
      expect(response.tokenAccounts).toHaveLength(2);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ 
        message: ['Invalid account address format'] 
      }));
      await expect(translate.getSplTokens('invalidAddress')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translate.getSplTokens(validAddress)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTxTypes', () => {
    it('should fetch transaction types successfully', async () => {
      const mockTxTypes = {
        transactionTypes: [
          { type: 'transfer', description: 'Token transfer' },
          { type: 'swap', description: 'Token swap' }
        ],
        version: 1
      };

      mockRequest.mockResolvedValue(mockTxTypes);

      const response = await translate.getTxTypes();
      expect(response).toEqual(mockTxTypes);
      expect(response.transactionTypes).toHaveLength(2);
      expect(response.version).toBe(1);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }));
      await expect(translate.getTxTypes()).rejects.toThrow(TransactionError);
    });

    it('should validate response structure', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translate.getTxTypes()).rejects.toThrow(TransactionError);
    });
  });

  describe('describeTransactions', () => {
    it('should describe transactions successfully', async () => {
      const mockDescriptions = [
        {
          signature: validSignature,
          type: 'transfer',
          description: 'Token transfer',
          timestamp: 1234567890,
          transfers: []
        }
      ];

      mockRequest.mockResolvedValue(mockDescriptions);

      const response = await translate.describeTransactions(validChain, [validSignature]);
      expect(response).toEqual(mockDescriptions);
      expect(response[0].signature).toBe(validSignature);
      expect(response[0].type).toBe('transfer');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }));
      await expect(translate.describeTransactions(validChain, [validSignature])).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translate.describeTransactions(validChain, [validSignature])).rejects.toThrow(TransactionError);
    });
  });

  describe('Transaction Job', () => {
    it('should start and get transaction job results', async () => {
      const mockJob = {
        jobId: 'job1',
        nextPageUrl: 'https://api.example.com/job1'
      };

      mockRequest.mockResolvedValue(mockJob);

      const response = await translate.startTransactionJob(validChain, validAddress);
      expect(response).toEqual(mockJob);
      expect(response.jobId).toBe('job1');

      const mockResults = {
        jobId: 'job1',
        status: 'completed',
        results: {
          transactions: [],
          totalCount: 0
        }
      };

      mockRequest.mockResolvedValue(mockResults);
      const results = await translate.getTransactionJobResults(validChain, 'job1', { pageSize: 100 });
      expect(results).toEqual(mockResults);
      expect(results.jobId).toBe('job1');
      expect(results.status).toBe('completed');
    });

    it('should handle invalid address in startTransactionJob', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.startTransactionJob(validChain, 'invalid')).rejects.toThrow(TransactionError);
    });

    it('should handle non-existent job ID', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Job not found'] }));
      await expect(translate.getTransactionJobResults(validChain, 'nonexistent')).rejects.toThrow(TransactionError);
    });

    it('should delete transaction job', async () => {
      const mockResponse = {
        message: 'Job deleted successfully'
      };

      mockRequest.mockResolvedValue(mockResponse);

      const response = await translate.deleteTransactionJob(validChain, 'job1');
      expect(response).toEqual(mockResponse);
      expect(response.message).toBe('Job deleted successfully');
    });
  });

  describe('getTokenBalances', () => {
    it('should get token balances successfully', async () => {
      const mockBalances = [
        {
          balance: '1000000000',
          usdValue: '100.00',
          token: {
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9,
            address: 'SOL'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockBalances);

      const balances = await translate.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBeGreaterThan(0);
      balances.forEach(balance => {
        expect(balance).toHaveProperty('balance');
        expect(balance).toHaveProperty('token');
        expect(balance.token).toHaveProperty('symbol');
        expect(balance.token).toHaveProperty('name');
        expect(balance.token).toHaveProperty('decimals');
        expect(balance.token).toHaveProperty('address');
      });
    });

    it('should get token balances with custom parameters', async () => {
      const mockBalances = [
        {
          balance: '1000000000',
          usdValue: '100.00',
          token: {
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9,
            address: 'SOL'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockBalances);

      const balances = await translate.getTokenBalances(
        validChain,
        validAddress,
        true,  // includePrices
        false  // excludeZeroPrices
      );
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBeGreaterThan(0);
    });

    it('should handle invalid address', async () => {
      await expect(translate.getTokenBalances(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translate.getTokenBalances(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle empty response', async () => {
      mockRequest.mockResolvedValue([]);
      const balances = await translate.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBe(0);
    });

    it('should handle null usdValue', async () => {
      const mockBalances = [
        {
          balance: '1000000000',
          usdValue: null,
          token: {
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9,
            address: 'SOL'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockBalances);

      const balances = await translate.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBe(1);
      expect(balances[0].usdValue).toBeNull();
    });
  });

  describe('getTransactionCount', () => {
    it('should fetch transaction count successfully', async () => {
      const mockCount = {
        chain: validChain,
        timestamp: 1234567890,
        account: {
          address: validAddress,
          transactionCount: 100
        }
      };

      mockRequest.mockResolvedValue(mockCount);

      const response = await translate.getTransactionCount(validChain, validAddress);
      expect(response).toEqual(mockCount);
      expect(response.account.transactionCount).toBe(100);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.getTransactionCount(validChain, 'invalid')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid response format'] }));
      await expect(translate.getTransactionCount(validChain, validAddress)).rejects.toThrow(TransactionError);
    });
  });

  describe('getStakingTransactions', () => {
    it('should fetch staking transactions successfully', async () => {
      const mockStakingTxs = {
        items: [
          {
            txTypeVersion: 5,
            source: { type: null, name: null },
            timestamp: 1234567890,
            classificationData: {
              type: 'staking',
              description: 'Stake tokens'
            },
            transfers: [],
            values: [],
            rawTransactionData: {
              signature: validSignature,
              blockNumber: 100,
              signer: validAddress,
              interactedAccounts: []
            }
          }
        ],
        numberOfEpochs: 1,
        failedEpochs: [],
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue(mockStakingTxs);

      const response = await translate.getStakingTransactions(validChain, validAddress);
      expect(response).toEqual(mockStakingTxs);
      expect(response.items[0].classificationData.type).toBe('staking');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.getStakingTransactions(validChain, 'invalid')).rejects.toThrow(TransactionError);
    });
  });

  describe('getStakingEpoch', () => {
    it('should fetch staking epoch information successfully', async () => {
      const mockEpoch = {
        epoch: 1,
        stakingAccount: validAddress,
        stakedAmount: '100',
        rewards: '10',
        startTimestamp: 1234567890,
        endTimestamp: 1234567899,
        status: 'active',
        validator: {
          address: 'validator1',
          name: 'Validator 1'
        }
      };

      mockRequest.mockResolvedValue(mockEpoch);

      const response = await translate.getStakingEpoch(validChain, validAddress, 1);
      expect(response).toEqual(mockEpoch);
      expect(response.epoch).toBe(1);
      expect(response.status).toBe('active');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.getStakingEpoch(validChain, 'invalid', 1)).rejects.toThrow(TransactionError);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid epoch'] }));
      await expect(translate.getStakingEpoch(validChain, validAddress, -1)).rejects.toThrow(TransactionError);
    });
  });
});