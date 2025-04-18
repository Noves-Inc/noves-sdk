import nock from 'nock';
import { TransactionError } from '../../src/errors/TransactionError';
import { PageOptions } from '../../src';

import { Translate } from '../../src';

jest.setTimeout(10000);

const BASE_URL = 'https://translate.noves.fi';

describe('TranslateSVM', () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = Translate.svm(apiKey);

  beforeEach(() => {
    nock.cleanAll();
  });

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
        }
      }
    ];

    nock(BASE_URL)
      .get('/svm/chains')
      .reply(200, mockChains);

    const response = await translate.getChains();
    expect(response[0]).toEqual(mockChains[0]);
    expect(response.length).toBeGreaterThan(0);
  });

  it('should fetch a transaction successfully', async () => {
    const mockTransaction = { id: '1', hash: '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq' };

    nock(BASE_URL)
      .get(`/svm/solana/tx/3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const response = await translate.getTransaction('solana', '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq');
    expect(response).toHaveProperty("rawTransactionData.signer", "EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho")
    expect(response).toHaveProperty("rawTransactionData.blockNumber", 281779550)
  });

  it('should handle transaction validation errors', async () => {
    const mockErrorResponse = {
      status: 400,
      errors: {
        chain: ['The field chain is invalid. Valid chains: eth, btc'],
        txHash: ['The field txHash must be a valid Transaction Hash.'],
      },
    };

    nock(BASE_URL)
      .get(`/svm/invalidChain/tx/invalidTxHash`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('invalidChain', 'invalidTxHash');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should handle transaction validation errors with incorrect tx hash', async () => {
    const mockErrorResponse = {
      status: 400,
      errors: {
        txHash: ['The field txHash must be a valid Transaction Hash.'],
      },
    };

    nock(BASE_URL)
      .get(`/svm/solana/tx/invalidTxHash`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('solana', 'invalidTxHash');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should handle transaction validation errors with invalid chain', async () => {
    const mockErrorResponse = {
      status: 400,
      errors: {
        chain: ['The field chain is invalid. Valid chains: eth, btc'],
      },
    };

    nock(BASE_URL)
      .get(`/svm/invalidChain/tx/3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('invalidChain', '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should fetch first page transactions successfully', async () => {
    const mockTransaction = { id: '1', hash: 'EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho' };

    nock(BASE_URL)
      .get(`/svm/solana/txs/EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('solana', 'EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho');
    expect(paginator.getTransactions()).toHaveLength(10)

  });

  it('should fetch first page transactions with custom paging successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/svm/solana/txs/EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paging: PageOptions = {
      pageNumber: 2,
      pageSize: 10
    }

    const txEngine = await translate.Transactions('solana', 'EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho', paging);
    expect(txEngine.getTransactions()).toHaveLength(10)
    expect(txEngine.getCurrentPageKeys()).toEqual(paging)
  });

  it('should fetch a page and then the second one using the next method successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/svm/solana/txs/EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('solana', 'EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho');
    expect(paginator.getTransactions()).toHaveLength(10)

    await paginator.next()
    expect(paginator.getTransactions()).toHaveLength(10)

  });
});