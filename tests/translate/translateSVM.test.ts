import { TranslateSVM } from "../../src/translate/translateSVM";
import { TransactionError } from "../../src/errors/TransactionError";
import { TransactionsPage } from "../../src/translate/transactionsPage";

jest.setTimeout(30000);

describe('TranslateSVM', () => {
  let translate: TranslateSVM;
  let mockRequest: jest.Mock;
  const validAddress = 'EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho';
  const validSignature = '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq';
  const validChain = 'solana';

  beforeEach(() => {
    mockRequest = jest.fn();
    translate = new TranslateSVM('test-api-key');
    (translate as any).makeRequest = mockRequest;
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
    it('should fetch transaction details successfully with default v5 format', async () => {
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
        values: [],
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
      expect(response.source.name).toBeNull();
      
      // Type guard for v5 transaction
      if (response.txTypeVersion === 5) {
        expect(response.classificationData.description).toBeNull();
        expect(response.values).toBeDefined();
      }
      
      expect(response.transfers).toHaveLength(1);
      expect(response.rawTransactionData.signature).toBe(validSignature);
    });

    it('should fetch transaction details successfully with v4 format', async () => {
      const mockTransaction = {
        txTypeVersion: 4,
        source: {
          type: 'blockchain',
          name: 'solana'
        },
        timestamp: 1722892419,
        classificationData: {
          type: 'unclassified'
        },
        transfers: [],
        rawTransactionData: {
          signature: validSignature,
          blockNumber: 281779550,
          signer: validAddress,
          interactedAccounts: ['11111111111111111111111111111111']
        }
      };

      mockRequest.mockResolvedValue(mockTransaction);

      const response = await translate.getTransaction(validChain, validSignature, 4);
      expect(response).toEqual(mockTransaction);
      expect(response.txTypeVersion).toBe(4);
      expect(response.source.type).toBe('blockchain');
      expect(response.source.name).toBe('solana');
      
      // Type guard for v4 transaction
      if (response.txTypeVersion === 4) {
        expect(response.classificationData).not.toHaveProperty('description');
        expect(response).not.toHaveProperty('values');
      }
    });

    it('should throw error for invalid txTypeVersion', async () => {
      await expect(translate.getTransaction(validChain, validSignature, 3))
        .rejects
        .toThrow(TransactionError);
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

    it('should handle error response from API', async () => {
      const errorResponse = {
        txTypeVersion: 5,
        source: {
          type: null,
          name: null
        },
        timestamp: null,
        classificationData: {
          type: 'error',
          description: 'Transaction not found'
        },
        transfers: [],
        values: [],
        rawTransactionData: {
          signature: validSignature,
          blockNumber: 0,
          signer: '',
          interactedAccounts: []
        }
      };

      mockRequest.mockResolvedValue(errorResponse);
      await expect(translate.getTransaction(validChain, validSignature))
        .rejects
        .toThrow(TransactionError);
    });
  });

  describe('getTransactions', () => {
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
            values: [],
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
        page: 1,
        pageSize: 10,
        nextPageUrl: 'https://translate.noves.fi/svm/solana/txs/v5/2w31NPGGZ7U2MCd3igujKeG7hggYNzsvknNeotQYJ1FF?pageSize=10&ignoreTransactions=hmaQsG6jQoN12cHkhjK1wkPoPYCsQYm1M7YHXjHo2nyjDCMHrX6GSdPL5jbvooUDkVU22tmfiiEf215Bw8cStJA'
      };

      mockRequest.mockResolvedValue(mockTransactions);

      const transactions = await translate.getTransactions(validChain, validAddress);
      expect(transactions).toBeInstanceOf(TransactionsPage);
      expect(transactions.getTransactions()).toEqual(mockTransactions.items);
      expect(transactions.getNextPageKeys()).toBeTruthy();
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ 
        message: ['The field chain is invalid. Valid chains: solana'] 
      }));
      await expect(translate.getTransactions('invalidChain', 'invalidAddress')).rejects.toThrow(TransactionError);
    });

    it('should handle pagination correctly', async () => {
      const mockTransactions = {
        items: [],
        page: 1,
        pageSize: 5,
        nextPageUrl: 'https://api.example.com/next-page'
      };

      mockRequest.mockResolvedValue(mockTransactions);

      const transactions = await translate.getTransactions(validChain, validAddress, { pageSize: 5 });
      expect(transactions).toBeInstanceOf(TransactionsPage);
      expect(transactions.getNextPageKeys()).toBeTruthy();
    });
  });

  describe('Transactions (deprecated)', () => {
    it('should maintain backward compatibility', async () => {
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
            transfers: [],
            values: [],
            rawTransactionData: {
              signature: validSignature,
              blockNumber: 338913770,
              signer: validAddress,
              interactedAccounts: []
            }
          }
        ],
        page: 1,
        pageSize: 10,
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue(mockTransactions);

      const transactions = await translate.Transactions(validChain, validAddress);
      expect(transactions).toBeInstanceOf(TransactionsPage);
      expect(transactions.getTransactions()).toEqual(mockTransactions.items);
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
        version: 1,
        transactionTypes: [
          { type: 'addLiquidity', description: 'The user enters a liquidity pool by adding one or more tokens to the pool.' },
          { type: 'swap', description: 'Reported when two or more fungible tokens are traded in the transaction, typically by using a decentralized exchange protocol.' },
          { type: 'stake', description: 'The user stakes fungible tokens into a protocol (typically for yield purposes). Also reported when the a validator stakes tokens.' }
        ]
      };

      mockRequest.mockResolvedValue(mockTxTypes);

      const response = await translate.getTxTypes();
      expect(response).toEqual(mockTxTypes);
      expect(response.version).toBe(1);
      expect(response.transactionTypes).toHaveLength(3);
      expect(response.transactionTypes[0]).toHaveProperty('type');
      expect(response.transactionTypes[0]).toHaveProperty('description');
      expect(response.transactionTypes[0].type).toBe('addLiquidity');
      expect(response.transactionTypes[1].type).toBe('swap');
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
        nextPageUrl: 'https://api.example.com/job1',
        startTimestamp: 0
      };

      mockRequest.mockResolvedValue(mockJob);

      const response = await translate.startTransactionJob(validChain, validAddress);
      expect(response).toEqual(mockJob);
      expect(response.jobId).toBe('job1');
      expect(response.startTimestamp).toBe(0);

      const mockResults = {
        items: [],
        pageSize: 100,
        hasNextPage: false,
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue(mockResults);
      const results = await translate.getTransactionJobResults(validChain, 'job1', { pageSize: 100 });
      expect(results).toEqual(mockResults);
      expect(results.items).toEqual([]);
      expect(results.pageSize).toBe(100);
      expect(results.hasNextPage).toBe(false);
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
            address: 'SOL',
            price: '170.5895573383441'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockBalances);

      const balances = await translate.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBeGreaterThan(0);
      balances.forEach(balance => {
        expect(balance).toHaveProperty('balance');
        expect(balance).toHaveProperty('usdValue');
        expect(balance).toHaveProperty('token');
        expect(balance.token).toHaveProperty('symbol');
        expect(balance.token).toHaveProperty('name');
        expect(balance.token).toHaveProperty('decimals');
        expect(balance.token).toHaveProperty('address');
        expect(balance.token).toHaveProperty('price');
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
            address: 'SOL',
            price: '170.5895573383441'
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

    it('should handle zero price tokens', async () => {
      const mockBalances = [
        {
          balance: '1000000000',
          usdValue: '0',
          token: {
            symbol: 'GIRTH',
            name: 'GIRTH CAT',
            decimals: 6,
            address: '9aV8CukSkRXYt4ty8hgAAg9KGbQbLpxSWkF1y43Fpump',
            price: '0'
          }
        }
      ];

      mockRequest.mockResolvedValue(mockBalances);

      const balances = await translate.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBe(1);
      expect(balances[0].usdValue).toBe('0');
      expect(balances[0].token.price).toBe('0');
    });
  });

  describe('getTransactionCount', () => {
    it('should fetch transaction count successfully', async () => {
      const mockJobStartResponse = {
        jobId: '0xe3b24185298d4e2d970681eafa3a1abfb17f8813',
        resultsUrl: 'https://translate.noves.fi/svm/solana/txCount/job/0xe3b24185298d4e2d970681eafa3a1abfb17f8813'
      };

      const mockCount = {
        chain: validChain,
        timestamp: 1749130527,
        account: {
          address: validAddress,
          transactionCount: 100
        }
      };

      // Mock the job start response first, then the job results
      mockRequest
        .mockResolvedValueOnce(mockJobStartResponse)
        .mockResolvedValueOnce(mockCount);

      const response = await translate.getTransactionCount(validChain, validAddress);
      expect(response).toEqual(mockCount);
      expect(response.account.transactionCount).toBe(100);
      expect(response.chain).toBe(validChain);
      expect(response.account.address).toBe(validAddress);
      
      // Verify that both API calls were made
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should fetch transaction count successfully with webhook URL', async () => {
      const mockJobStartResponse = {
        jobId: '0xe3b24185298d4e2d970681eafa3a1abfb17f8813',
        resultsUrl: 'https://translate.noves.fi/svm/solana/txCount/job/0xe3b24185298d4e2d970681eafa3a1abfb17f8813'
      };

      const mockCount = {
        chain: validChain,
        timestamp: 1749130527,
        account: {
          address: validAddress,
          transactionCount: 50
        }
      };

      const webhookUrl = 'https://example.com/webhook';

      mockRequest
        .mockResolvedValueOnce(mockJobStartResponse)
        .mockResolvedValueOnce(mockCount);

      const response = await translate.getTransactionCount(validChain, validAddress, webhookUrl);
      expect(response).toEqual(mockCount);
      expect(response.account.transactionCount).toBe(50);
      
      // Verify that both API calls were made
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors in job start', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.getTransactionCount(validChain, 'invalid')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid job start response format', async () => {
      const invalidJobStartResponse = { invalidField: 'test' };
      mockRequest.mockResolvedValueOnce(invalidJobStartResponse);
      
      await expect(translate.getTransactionCount(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid final response format', async () => {
      const mockJobStartResponse = {
        jobId: '0xe3b24185298d4e2d970681eafa3a1abfb17f8813',
        resultsUrl: 'https://translate.noves.fi/svm/solana/txCount/job/0xe3b24185298d4e2d970681eafa3a1abfb17f8813'
      };

      const invalidFinalResponse = { invalidField: 'test' };

      mockRequest
        .mockResolvedValueOnce(mockJobStartResponse)
        .mockResolvedValueOnce(invalidFinalResponse);

      await expect(translate.getTransactionCount(validChain, validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle job results error', async () => {
      const mockJobStartResponse = {
        jobId: '0xe3b24185298d4e2d970681eafa3a1abfb17f8813',
        resultsUrl: 'https://translate.noves.fi/svm/solana/txCount/job/0xe3b24185298d4e2d970681eafa3a1abfb17f8813'
      };

      mockRequest
        .mockResolvedValueOnce(mockJobStartResponse)
        .mockRejectedValueOnce(new TransactionError({ message: ['Job not found'] }));

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
            timestamp: 1748939361,
            classificationData: {
              type: 'syntheticStakingRewards',
              description: 'Received 0.003404242 SOL in staking rewards.'
            },
            transfers: [
              {
                action: 'rewarded',
                amount: '0.003404242',
                token: {
                  decimals: 9,
                  address: 'SOL',
                  name: 'SOL',
                  symbol: 'SOL',
                  icon: null
                },
                from: {
                  name: 'Staking',
                  address: null,
                  owner: {
                    name: null,
                    address: null
                  }
                },
                to: {
                  name: null,
                  address: validAddress,
                  owner: {
                    name: null,
                    address: null
                  }
                }
              }
            ],
            values: [
              {
                key: 'epoch',
                value: '796'
              }
            ],
            rawTransactionData: {
              signature: 'staking-synth-0a7ca482138b5ffda2ab5d6852e73827',
              blockNumber: 344304251,
              signer: '',
              interactedAccounts: null
            }
          }
        ],
        numberOfEpochs: 10,
        failedEpochs: [],
        nextPageUrl: null
      };

      mockRequest.mockResolvedValue(mockStakingTxs);

      const response = await translate.getStakingTransactions(validChain, validAddress, { numberOfEpochs: 10 });
      expect(response).toEqual(mockStakingTxs);
      expect(response.items[0].classificationData.type).toBe('syntheticStakingRewards');
      expect(response.items[0].rawTransactionData.interactedAccounts).toBeNull();
      expect(response.failedEpochs).toEqual([]);
      expect(response.numberOfEpochs).toBe(10);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.getStakingTransactions(validChain, 'invalid')).rejects.toThrow(TransactionError);
    });
  });

  describe('getStakingEpoch', () => {
    it('should fetch staking epoch information successfully', async () => {
      const mockEpoch = {
        txTypeVersion: 5,
        source: {
          type: null,
          name: null
        },
        timestamp: 1745699126,
        classificationData: {
          description: "Received 0.003495653 SOL in staking rewards.",
          type: "syntheticStakingRewards"
        },
        transfers: [
          {
            action: "rewarded",
            amount: "0.003495653",
            token: {
              decimals: 9,
              address: "SOL",
              name: "SOL",
              symbol: "SOL",
              icon: null
            },
            from: {
              name: "Staking",
              address: null,
              owner: {
                name: null,
                address: null
              }
            },
            to: {
              name: null,
              address: validAddress,
              owner: {
                name: null,
                address: null
              }
            }
          }
        ],
        values: [
          {
            key: "epoch",
            value: "777"
          }
        ],
        rawTransactionData: {
          signature: "staking-synth-bcd7058d75f7f6d4d41936bf8f56362d",
          blockNumber: 336096135,
          signer: "",
          interactedAccounts: null
        }
      };

      mockRequest.mockResolvedValue(mockEpoch);

      const response = await translate.getStakingEpoch(validChain, validAddress, 777);
      expect(response).toEqual(mockEpoch);
      expect(response.txTypeVersion).toBe(5);
      expect(response.classificationData.type).toBe('syntheticStakingRewards');
      expect(response.transfers[0].action).toBe('rewarded');
      expect(response.values[0].key).toBe('epoch');
      expect(response.values[0].value).toBe('777');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translate.getStakingEpoch(validChain, 'invalid', 1)).rejects.toThrow(TransactionError);
    });

    it('should handle validation errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid epoch'] }));
      await expect(translate.getStakingEpoch(validChain, validAddress, -1)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({});
      await expect(translate.getStakingEpoch(validChain, validAddress, 1)).rejects.toThrow(TransactionError);
    });

    it('should handle null interactedAccounts', async () => {
      const mockEpoch = {
        txTypeVersion: 5,
        source: { type: null, name: null },
        timestamp: 1745699126,
        classificationData: {
          description: "Received 0.003495653 SOL in staking rewards.",
          type: "syntheticStakingRewards"
        },
        transfers: [],
        values: [],
        rawTransactionData: {
          signature: "staking-synth-test",
          blockNumber: 336096135,
          signer: "",
          interactedAccounts: null
        }
      };

      mockRequest.mockResolvedValue(mockEpoch);

      const response = await translate.getStakingEpoch(validChain, validAddress, 1);
      expect(response.rawTransactionData.interactedAccounts).toBeNull();
    });
  });

  describe('Enhanced Cursor Functionality', () => {
    it('should support cursor-based pagination navigation', async () => {
      // Mock transaction data for SVM
      const mockTransaction = {
        txTypeVersion: 5,
        chain: 'solana',
        accountAddress: validAddress,
        classificationData: {
          type: 'transfer',
          description: 'Test Solana transaction'
        },
        rawTransactionData: {
          signature: 'test-signature-123',
          blockTime: 1640995200
        },
        transfers: [],
        values: []
      };

      const page1Response = {
        account: validAddress,
        items: [mockTransaction],
        pageSize: 1,
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/page2'
      };

      const page2Response = {
        account: validAddress,
        items: [{ ...mockTransaction, rawTransactionData: { ...mockTransaction.rawTransactionData, signature: 'test-signature-456' } }],
        pageSize: 1,
        hasNextPage: false,
        nextPageUrl: null
      };

      // Start with first page
      mockRequest.mockResolvedValueOnce(page1Response);
      const transactionsPage = await translate.getTransactions(validChain, validAddress, { pageSize: 1 });

      // Test cursor info
      const cursorInfo = transactionsPage.getCursorInfo();
      expect(cursorInfo).toHaveProperty('hasNextPage', true);
      expect(cursorInfo).toHaveProperty('hasPreviousPage', false);
      expect(cursorInfo).toHaveProperty('nextCursor');
      expect(cursorInfo).toHaveProperty('previousCursor', null);
      expect(typeof cursorInfo.nextCursor).toBe('string');

      // Test cursor methods
      const nextCursor = transactionsPage.getNextCursor();
      const previousCursor = transactionsPage.getPreviousCursor();
      expect(typeof nextCursor).toBe('string');
      expect(previousCursor).toBeNull();

      // Test cursor decoding
      if (nextCursor) {
        const decodedCursor = TransactionsPage.decodeCursor(nextCursor);
        expect(decodedCursor).toHaveProperty('_cursorMeta');
        expect((decodedCursor as any)._cursorMeta).toHaveProperty('currentPageIndex');
        expect((decodedCursor as any)._cursorMeta).toHaveProperty('canGoBack');
        expect((decodedCursor as any)._cursorMeta).toHaveProperty('canGoForward');
      }

      // Test fromCursor static method
      if (nextCursor) {
        mockRequest.mockResolvedValueOnce(page2Response);
        const page2FromCursor = await TransactionsPage.fromCursor(translate, 'solana', validAddress, nextCursor);
        expect(page2FromCursor).toBeInstanceOf(TransactionsPage);
        expect(page2FromCursor.getTransactions()).toHaveLength(1);
        expect(page2FromCursor.hasPrevious()).toBe(true);

        // Test navigation back
        const page2PreviousCursor = page2FromCursor.getPreviousCursor();
        expect(typeof page2PreviousCursor).toBe('string');
        
        // Verify cursor navigation integrity
        if (page2PreviousCursor) {
          mockRequest.mockResolvedValueOnce(page1Response);
          const backToPage1 = await TransactionsPage.fromCursor(translate, 'solana', validAddress, page2PreviousCursor);
          expect((backToPage1.getTransactions()[0] as any).rawTransactionData.signature).toBe('test-signature-123');
        }
      }
    });
  });
});