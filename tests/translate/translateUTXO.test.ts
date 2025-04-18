import nock from 'nock';
import { TransactionError } from '../../src/errors/TransactionError';
import { PageOptions } from '../../src';

import { Translate } from '../../src';

jest.setTimeout(10000);

const BASE_URL = 'https://translate.noves.fi';

describe('TranslateUTXO', () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = Translate.utxo(apiKey);

  beforeEach(() => {
    nock.cleanAll();
  });

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
        }
      },
      {
        "name": "avalanche-x-chain",
        "ecosystem": "utxo",
        "nativeCoin": {
          "address": "AVAX",
          "decimals": 9,
          "name": "AVAX",
          "symbol": "AVAX"
        }
      }
    ];

    nock(BASE_URL)
      .get('/utxo/chains')
      .reply(200, mockChains);

    const response = await translate.getChains();
    expect(response[0]).toEqual(mockChains[0]);
    expect(response.length).toBeGreaterThan(0);
  });

  /*
  it('should fetch first page transactions successfully', async () => {
    const mockTransaction = { id: '1', hash: '83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d' };

    nock(BASE_URL)
      .get(`/utxo/btc/txs/83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('btc', '83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d');
    expect(paginator.getTransactions()).toHaveLength(10)

  });

  it('should fetch first page transactions with custom paging successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/utxo/btc/txs/83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paging: PageOptions = {
      pageNumber: 2,
      pageSize: 10
    }

    const txEngine = await translate.Transactions('btc', '83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d', paging);
    expect(txEngine.getTransactions()).toHaveLength(10)
    expect(txEngine.getCurrentPageKeys()).toEqual(paging)
  });

  it('should fetch a page and then the second one using the next method successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/utxo/btc/txs/83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('btc', '83d29b4fddd334739f98acec2201fa66d35e357b9373334bb7987d1ef252504d');
    expect(paginator.getTransactions()).toHaveLength(10)

    await paginator.next()
    expect(paginator.getTransactions()).toHaveLength(10)

  });*/
});