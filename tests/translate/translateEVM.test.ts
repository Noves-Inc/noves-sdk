import nock from 'nock';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';
import { TransactionError } from '../../src/errors/TransactionError';
import { PageOptions } from '../../src';

import { Translate } from '../../src';

const BASE_URL = 'https://translate.noves.fi';

describe('TranslateEVM', () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = Translate.evm(apiKey);

  beforeEach(() => {
    nock.cleanAll();
  });

  it('should fetch chains successfully', async () => {
    const mockChains = [{ "ecosystem": "evm", "evmChainId": 42161, "name": "arbitrum" }, { "ecosystem": "evm", "evmChainId": 42170, "name": "arbitrum-nova" }];

    nock(BASE_URL)
      .get('/evm/chains')
      .reply(200, mockChains);

    const response = await translate.getChains();
    expect(response[0]).toEqual(mockChains[0]);
    expect(response.length).toBeGreaterThan(0);
  });

  it('should fetch a chain successfully', async () => {
    const mockChain = { "ecosystem": "evm", "evmChainId": 1, "name": "eth" };

    nock(BASE_URL)
      .get('/evm/chains')
      .reply(200, mockChain);

    const response = await translate.getChain("eth");
    expect(response).toEqual(mockChain);
  });

  it('should throw ChainNotFoundError when chain is not found', async () => {
    const mockChains = [
      { id: '1', name: 'ethereum' },
      { id: '2', name: 'bitcoin' }
    ];

    nock(BASE_URL)
      .get(`/evm/chain`)
      .reply(200, { succeeded: true, response: mockChains });

    try {
      await translate.getChain('nonexistent');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ChainNotFoundError);
      expect(error.message).toBe('Chain with name "nonexistent" not found.');
    }
  });

  it('should fetch a transaction successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/tx/0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const response = await translate.getTransaction('eth', '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22');
    expect(response).toHaveProperty("accountAddress", "0xA1EFa0adEcB7f5691605899d13285928AE025844")
    expect(response).toHaveProperty("rawTransactionData.blockNumber", 12345453)
    expect(response).toHaveProperty("rawTransactionData.timestamp", 1619833950)
    expect(response).toHaveProperty("classificationData.description", "Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.")
  });

  it('should fetch a describe transaction successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/describetx/0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const response = await translate.describeTransaction('eth', '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22');
    expect(response).toHaveProperty("type", "addLiquidity")
    expect(response).toHaveProperty("description", "Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.")
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
      .get(`/evm/invalidChain/tx/invalidTxHash`)
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
      .get(`/evm/eth/tx/invalidTxHash`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('eth', 'invalidTxHash');
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
      .get(`/evm/invalidChain/tx/0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('invalidChain', '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should fetch first page transactions successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844');
    expect(paginator.getTransactions()).toHaveLength(10)

  });

  it('should fetch first page transactions with custom paging successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paging: PageOptions = {
      startBlock: 20104079,
      sort: 'desc'
    }

    const txEngine = await translate.Transactions('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844', paging);
    expect(txEngine.getTransactions()).toHaveLength(10)
    expect(txEngine.getCurrentPageKeys()).toEqual(paging)
  });

  it('should fetch a page and then the second one using the next method successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844');
    expect(paginator.getTransactions()).toHaveLength(10)

    await paginator.next()
    expect(paginator.getTransactions()).toHaveLength(10)

  });

  it('should fetch first page history successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.History('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844');
    expect(paginator.getTransactions()).toHaveLength(100)

  });
});