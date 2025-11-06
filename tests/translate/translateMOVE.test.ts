import { TranslateMOVE } from '../../src/translate/translateMOVE';
import { TransactionError } from '../../src/errors/TransactionError';
import { ErrorType } from '../../src/errors/ErrorTypes';
import { 
  MOVETranslateChains,
  MOVETranslateTransaction,
  MOVETranslateTransactionTypesResponse,
  MOVETranslateTransactionsResponse
} from '../../src/types/move';

describe('TranslateMOVE', () => {
  let translateMove: TranslateMOVE;
  let mockRequest: jest.Mock;
  const API_KEY = 'test-api-key';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateMove = new TranslateMOVE(API_KEY);
    (translateMove as any).makeRequest = mockRequest;
  });

  describe('constructor', () => {
    it('should create an instance with valid API key', () => {
      expect(translateMove).toBeInstanceOf(TranslateMOVE);
    });

    it('should throw error when API key is not provided', () => {
      expect(() => new TranslateMOVE('')).toThrow('API key is required');
    });
  });

  describe('getChains', () => {
    const mockChainsResponse: MOVETranslateChains = [
      {
        name: "sui",
        ecosystem: "move",
        nativeCoin: {
          name: "SUI",
          symbol: "SUI",
          address: "SUI",
          decimals: 9
        },
        tier: 2
      }
    ];

    it('should return chains successfully', async () => {
      mockRequest.mockResolvedValue(mockChainsResponse);

      const result = await translateMove.getChains();
      expect(result).toEqual(mockChainsResponse);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('sui');
      expect(result[0].ecosystem).toBe('move');
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }, ErrorType.INVALID_API_KEY, 401));

      await expect(translateMove.getChains()).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should handle network errors', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(translateMove.getChains()).rejects.toThrow();
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('getTransactionTypes', () => {
    const mockTransactionTypesResponse: MOVETranslateTransactionTypesResponse = {
      version: 1,
      transactionTypes: [
        {
          type: "addLiquidity",
          description: "Add liquidity to pool"
        },
        {
          type: "swap",
          description: "Token swap transaction"
        },
        {
          type: "tokenTransfer",
          description: "Transfer of objects or tokens"
        }
      ]
    };

    it('should return transaction types successfully', async () => {
      mockRequest.mockResolvedValue(mockTransactionTypesResponse);

      const result = await translateMove.getTransactionTypes();
      expect(result).toEqual(mockTransactionTypesResponse);
      expect(result.version).toBe(1);
      expect(result.transactionTypes).toHaveLength(3);
      expect(result.transactionTypes[0].type).toBe('addLiquidity');
      expect(mockRequest).toHaveBeenCalledWith('txTypes');
    });

    it('should handle invalid response format', async () => {
      mockRequest.mockResolvedValue({ invalid: 'response' });

      await expect(translateMove.getTransactionTypes()).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith('txTypes');
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Internal server error'] }, ErrorType.UNKNOWN_ERROR, 500));

      await expect(translateMove.getTransactionTypes()).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith('txTypes');
    });
  });

  describe('getTransaction', () => {
    const mockTransaction: MOVETranslateTransaction = {
      txTypeVersion: 6,
      chain: "sui",
      timestamp: 1762445794,
      classificationData: {
        type: "failed",
        description: "Transaction failed: InsufficientCoinBalance in command 14",
        protocol: {
          name: null
        },
        source: {
          type: "rpc"
        }
      },
      transfers: [
        {
          action: "paidGas",
          amount: "0.002051616",
          token: {
            address: "0x2::sui::SUI",
            name: "Sui",
            symbol: "SUI",
            decimals: 9,
            icon: null,
            issuer: null
          },
          nft: null,
          from: {
            address: "0x09b181dec30da6e702b0234fcfc7d440fc061d022a7358635c59120617b72174",
            name: null
          },
          to: null
        }
      ],
      values: [
        {
          failed: true,
          failureReason: "Transaction failed: InsufficientCoinBalance in command 14",
          gasUsed: "2051616",
          timestamp: "1762445794703",
          checkpoint: "209211338"
        }
      ],
      rawTransactionData: {
        digest: "FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK",
        signer: "0x09b181dec30da6e702b0234fcfc7d440fc061d022a7358635c59120617b72174",
        checkpoint: "209211338",
        gasUsed: "2051616"
      }
    };

    it('should return transaction successfully', async () => {
      const chain = 'sui';
      const txId = 'FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK';

      mockRequest.mockResolvedValue(mockTransaction);

      const result = await translateMove.getTransaction(chain, txId);
      expect(result).toEqual(mockTransaction);
      expect(result.chain).toBe('sui');
      expect(result.classificationData.type).toBe('failed');
      expect(result.rawTransactionData.digest).toBe(txId);
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/tx/${txId}`);
    });

    it('should throw error for missing chain parameter', async () => {
      await expect(translateMove.getTransaction('', 'txId')).rejects.toThrow(TransactionError);
    });

    it('should throw error for missing txId parameter', async () => {
      await expect(translateMove.getTransaction('sui', '')).rejects.toThrow(TransactionError);
    });

    it('should handle transaction not found', async () => {
      const chain = 'sui';
      const txId = 'nonexistent';

      mockRequest.mockRejectedValue(new TransactionError({ message: ['Transaction not found'] }, ErrorType.INVALID_REQUEST, 404));

      await expect(translateMove.getTransaction(chain, txId)).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/tx/${txId}`);
    });

    it('should handle invalid response format', async () => {
      const chain = 'sui';
      const txId = 'test';

      mockRequest.mockResolvedValue({ invalid: 'response' });

      await expect(translateMove.getTransaction(chain, txId)).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/tx/${txId}`);
    });
  });

  describe('getTransactions', () => {
    const mockTransactionsResponse: MOVETranslateTransactionsResponse = {
      items: [
        {
          txTypeVersion: 6,
          chain: "sui",
          timestamp: 1762446323011,
          classificationData: {
            type: "unclassified",
            description: "",
            protocol: {
              name: null
            },
            source: {
              type: "human"
            }
          },
          transfers: [
            {
              action: "paidGas",
              amount: "0.010094816",
              token: {
                address: "0x2::sui::SUI",
                name: "Sui",
                symbol: "SUI",
                decimals: 9,
                icon: null,
                issuer: null
              },
              nft: null,
              from: {
                address: "0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874",
                name: null
              },
              to: null
            }
          ],
          values: [
            {
              commandTypes: [
                "unclassified"
              ]
            }
          ],
          rawTransactionData: {
            digest: "N3XqVgC5UC3q9W2sEkd3YBs9BYuJwZVRwz7Y8NAyTij",
            signer: "0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874",
            checkpoint: "209213532",
            gasUsed: "8680000"
          }
        }
      ],
      page: 1,
      pageSize: 10,
      nextPageUrl: "/api/sui/txs/0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874?pageNumber=2&pageSize=10&sort=desc"
    };

    it('should return transactions successfully', async () => {
      const chain = 'sui';
      const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';

      mockRequest.mockResolvedValue(mockTransactionsResponse);

      const result = await translateMove.getTransactions(chain, address);
      expect(result.getTransactions()).toHaveLength(1);
      expect(result.getTransactions()[0].chain).toBe('sui');
      expect(result.getNextPageKeys()).not.toBeNull();
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/txs/${address}`);
    });

    it('should handle pagination parameters', async () => {
      const chain = 'sui';
      const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';
      const pageOptions = { pageNumber: 2, pageSize: 5, sort: 'desc' as const };

      mockRequest.mockResolvedValue({ ...mockTransactionsResponse, page: 2, pageSize: 5, nextPageUrl: null });

      const result = await translateMove.getTransactions(chain, address, pageOptions);
      expect(result.getTransactions()).toHaveLength(1);
      expect(result.getNextPageKeys()).toBeNull();
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/txs/${address}?pageNumber=2&pageSize=5&sort=desc`);
    });

    it('should throw error for missing chain parameter', async () => {
      await expect(translateMove.getTransactions('', 'address')).rejects.toThrow(TransactionError);
    });

    it('should throw error for missing address parameter', async () => {
      await expect(translateMove.getTransactions('sui', '')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid response format', async () => {
      const chain = 'sui';
      const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';

      mockRequest.mockResolvedValue({ invalid: 'response' });

      await expect(translateMove.getTransactions(chain, address)).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/txs/${address}`);
    });

    it('should handle API errors', async () => {
      const chain = 'sui';
      const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';

      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address format'] }, ErrorType.INVALID_REQUEST, 400));

      await expect(translateMove.getTransactions(chain, address)).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/txs/${address}`);
    });

    it('should handle empty transactions list', async () => {
      const chain = 'sui';
      const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';

      mockRequest.mockResolvedValue({ items: [], page: 1, pageSize: 10, nextPageUrl: null });

      const result = await translateMove.getTransactions(chain, address);
      expect(result.getTransactions()).toHaveLength(0);
      expect(result.getNextPageKeys()).toBeNull();
      expect(mockRequest).toHaveBeenCalledWith(`${chain}/txs/${address}`);
    });
  });

  describe('error handling', () => {
    it('should handle rate limiting', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Rate limit exceeded'] }, ErrorType.RATE_LIMIT_EXCEEDED, 429));

      await expect(translateMove.getChains()).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should handle unauthorized access', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }, ErrorType.INVALID_API_KEY, 401));

      await expect(translateMove.getChains()).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });

    it('should handle server errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Internal server error'] }, ErrorType.UNKNOWN_ERROR, 500));

      await expect(translateMove.getChains()).rejects.toThrow(TransactionError);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('integration with factory pattern', () => {
    it('should work with factory method', async () => {
      const { Translate } = require('../../src/index');
      const instance = Translate.move(API_KEY);
      expect(instance).toBeInstanceOf(TranslateMOVE);
    });

    it('should work with SDKOptions', async () => {
      const { Translate } = require('../../src/index');
      const instance = Translate.move({ 
        apiKey: API_KEY, 
        retryConfig: 'PRODUCTION' 
      });
      expect(instance).toBeInstanceOf(TranslateMOVE);
    });
  });
});
