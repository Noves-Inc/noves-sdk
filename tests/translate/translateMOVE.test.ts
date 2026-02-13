import nock from 'nock';
import { TranslateMOVE } from '../../src/translate/translateMOVE';
import { TransactionError } from '../../src/errors/TransactionError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { 
  MOVETranslateTransaction,
  MOVETranslateTransactionTypesResponse,
} from '../../src/types/move';

jest.setTimeout(10000);

describe('TranslateMOVE', () => {
  let translate: TranslateMOVE;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    nock.cleanAll();
  });

  beforeEach(() => {
    mockRequest = jest.fn();
    translate = new TranslateMOVE('test-api-key');
    (translate as any).makeRequest = mockRequest;
  });

  it('should throw error when API key is not provided', () => {
    expect(() => new TranslateMOVE('')).toThrow('API key is required');
  });

  it('should fetch chains successfully', async () => {
    const mockChains = [
      {
        name: 'sui',
        ecosystem: 'move',
        nativeCoin: {
          name: 'SUI',
          symbol: 'SUI',
          address: 'SUI',
          decimals: 9
        },
        tier: 2
      }
    ];
    mockRequest.mockResolvedValue(mockChains);

    const chains = await translate.getChains();
    expect(chains).toEqual(mockChains);
    expect(chains).toHaveLength(1);
    expect(chains[0].name).toBe('sui');
    expect(chains[0].ecosystem).toBe('move');
  });

  it('should handle invalid chains response format', async () => {
    mockRequest.mockResolvedValue({ invalid: 'response' });

    await expect(translate.getChains()).rejects.toThrow(TransactionError);
  });

  it('should fetch transaction types successfully', async () => {
    const mockTransactionTypes: MOVETranslateTransactionTypesResponse = {
      version: 1,
      transactionTypes: [
        { type: 'addLiquidity', description: 'Add liquidity to pool' },
        { type: 'swap', description: 'Token swap transaction' },
        { type: 'tokenTransfer', description: 'Transfer of objects or tokens' }
      ]
    };
    mockRequest.mockResolvedValue(mockTransactionTypes);

    const result = await translate.getTransactionTypes();
    expect(result).toEqual(mockTransactionTypes);
    expect(result.version).toBe(1);
    expect(result.transactionTypes).toHaveLength(3);
    expect(mockRequest).toHaveBeenCalledWith('txTypes');
  });

  it('should handle invalid transaction types response format', async () => {
    mockRequest.mockResolvedValue({ invalid: 'response' });

    await expect(translate.getTransactionTypes()).rejects.toThrow(TransactionError);
  });

  it('should fetch a transaction successfully', async () => {
    const mockTransaction: MOVETranslateTransaction = {
      txTypeVersion: 6,
      chain: 'sui',
      timestamp: 1762445794,
      classificationData: {
        type: 'failed',
        description: 'Transaction failed: InsufficientCoinBalance in command 14',
        protocol: { name: null },
        source: { type: 'rpc' }
      },
      transfers: [
        {
          action: 'paidGas',
          amount: '0.002051616',
          token: {
            address: '0x2::sui::SUI',
            name: 'Sui',
            symbol: 'SUI',
            decimals: 9,
            icon: null,
            issuer: null
          },
          nft: null,
          from: {
            address: '0x09b181dec30da6e702b0234fcfc7d440fc061d022a7358635c59120617b72174',
            name: null
          },
          to: null
        }
      ],
      values: [
        {
          failed: true,
          failureReason: 'Transaction failed: InsufficientCoinBalance in command 14',
          gasUsed: '2051616',
          timestamp: '1762445794703',
          checkpoint: '209211338'
        }
      ],
      rawTransactionData: {
        digest: 'FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK',
        signer: '0x09b181dec30da6e702b0234fcfc7d440fc061d022a7358635c59120617b72174',
        checkpoint: '209211338',
        gasUsed: '2051616'
      }
    };

    mockRequest.mockResolvedValue(mockTransaction);

    const response = await translate.getTransaction('sui', 'FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK');
    expect(response).toEqual(mockTransaction);
    expect(mockRequest).toHaveBeenCalledWith('sui/tx/FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK');
  });

  it('should throw error for missing transaction parameters', async () => {
    await expect(translate.getTransaction('', 'txId')).rejects.toThrow(TransactionError);
    await expect(translate.getTransaction('sui', '')).rejects.toThrow(TransactionError);
  });

  it('should handle transaction validation errors', async () => {
    mockRequest.mockRejectedValue(new TransactionError({ message: ['Transaction not found'] }));

    await expect(translate.getTransaction('sui', 'nonexistent'))
      .rejects.toThrow(TransactionError);
  });

  it('should fetch first page transactions successfully', async () => {
    const mockTransactions = {
      items: [
        {
          txTypeVersion: 6,
          chain: 'sui',
          timestamp: 1762446323011,
          classificationData: {
            type: 'unclassified',
            description: '',
            protocol: { name: null },
            source: { type: 'human' }
          },
          transfers: [
            {
              action: 'paidGas',
              amount: '0.010094816',
              token: {
                address: '0x2::sui::SUI',
                name: 'Sui',
                symbol: 'SUI',
                decimals: 9,
                icon: null,
                issuer: null
              },
              nft: null,
              from: {
                address: '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874',
                name: null
              },
              to: null
            }
          ],
          values: [{ commandTypes: ['unclassified'] }],
          rawTransactionData: {
            digest: 'N3XqVgC5UC3q9W2sEkd3YBs9BYuJwZVRwz7Y8NAyTij',
            signer: '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874',
            checkpoint: '209213532',
            gasUsed: '8680000'
          }
        }
      ],
      page: 1,
      pageSize: 10,
      nextPageUrl: '/api/sui/txs/0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874?pageNumber=2&pageSize=10&sort=desc'
    };

    mockRequest.mockResolvedValue(mockTransactions);

    const transactions = await translate.getTransactions('sui', '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874');
    expect(transactions).toBeInstanceOf(TransactionsPage);
    expect(transactions.getTransactions()).toEqual(mockTransactions.items as MOVETranslateTransaction[]);
    expect(transactions.getNextPageKeys()).not.toBeNull();
  });

  it('should handle pagination parameters in getTransactions', async () => {
    const mockTransactions = {
      items: [
        {
          txTypeVersion: 6,
          chain: 'sui',
          timestamp: 1762446323011,
          classificationData: {
            type: 'unclassified',
            description: '',
            protocol: { name: null },
            source: { type: 'human' }
          },
          transfers: [],
          values: [],
          rawTransactionData: {
            digest: 'N3XqVgC5UC3q9W2sEkd3YBs9BYuJwZVRwz7Y8NAyTij',
            signer: '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874',
            checkpoint: '209213532',
            gasUsed: '8680000'
          }
        }
      ],
      page: 2,
      pageSize: 5,
      nextPageUrl: null
    };

    mockRequest.mockResolvedValue(mockTransactions);

    const transactions = await translate.getTransactions(
      'sui',
      '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874',
      { pageNumber: 2, pageSize: 5, sort: 'desc' as const }
    );
    expect(transactions).toBeInstanceOf(TransactionsPage);
    expect(transactions.getTransactions()).toHaveLength(1);
    expect(transactions.getNextPageKeys()).toBeNull();
  });

  it('should throw error for missing getTransactions parameters', async () => {
    await expect(translate.getTransactions('', 'address')).rejects.toThrow(TransactionError);
    await expect(translate.getTransactions('sui', '')).rejects.toThrow(TransactionError);
  });

  it('should handle invalid transactions response format', async () => {
    mockRequest.mockResolvedValue({ invalid: 'response' });

    await expect(translate.getTransactions('sui', '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874'))
      .rejects.toThrow(TransactionError);
  });

  it('should handle empty transactions list', async () => {
    mockRequest.mockResolvedValue({ items: [], page: 1, pageSize: 10, nextPageUrl: null });

    const transactions = await translate.getTransactions('sui', '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874');
    expect(transactions).toBeInstanceOf(TransactionsPage);
    expect(transactions.getTransactions()).toHaveLength(0);
    expect(transactions.getNextPageKeys()).toBeNull();
  });

  it('should handle API errors', async () => {
    mockRequest.mockRejectedValue(new TransactionError({ message: ['Rate limit exceeded'] }));
    await expect(translate.getChains()).rejects.toThrow(TransactionError);

    mockRequest.mockRejectedValue(new TransactionError({ message: ['Unauthorized'] }));
    await expect(translate.getTransactionTypes()).rejects.toThrow(TransactionError);
  });

  it('should work with factory method', () => {
    const { Translate } = require('../../src/index');
    const instance = Translate.move('test-api-key');
    expect(instance).toBeInstanceOf(TranslateMOVE);
  });

  it('should work with SDKOptions factory', () => {
    const { Translate } = require('../../src/index');
    const instance = Translate.move({ apiKey: 'test-api-key', retryConfig: 'PRODUCTION' });
    expect(instance).toBeInstanceOf(TranslateMOVE);
  });
});
