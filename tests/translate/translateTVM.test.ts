import nock from 'nock';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';
import { TransactionError } from '../../src/errors/TransactionError';
import { PageOptions, Transaction } from '../../src';

import { Translate } from '../../src';
import { TransactionsPage } from '../../src/translate/transactionsPage';

jest.setTimeout(10000);

const BASE_URL = 'https://translate.noves.fi';

describe('TranslateTVM', () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error('API_KEY environment variable is not set');
    }
    const translate = Translate.tvm(apiKey);

    beforeEach(() => {
        nock.cleanAll();
    });

    it('should fetch chains successfully', async () => {
        const mockChains = [
            {
                ecosystem: "tvm",
                name: "tron",
            },
        ];

        nock(BASE_URL)
            .get('/tvm/chains')
            .reply(200, mockChains);

        const response = await translate.getChains();
        expect(response[0]).toEqual(mockChains[0]);
        expect(response.length).toBeGreaterThan(0);
    });

    it('should fetch a chain successfully', async () => {
        const mockChain = { "ecosystem": "tvm", "name": "tron" };

        nock(BASE_URL)
            .get('/tvm/chains')
            .reply(200, [mockChain]);

        const response = await translate.getChain("tron");
        expect(response).toEqual(mockChain);
    });

    it('should throw ChainNotFoundError when chain is not found', async () => {
        const mockChains = [
            { ecosystem: 'tvm', name: 'tron' },
            { ecosystem: 'tvm', name: 'troncoin' }
        ];

        nock(BASE_URL)
            .get('/tvm/chains')
            .reply(200, mockChains);

        await expect(translate.getChain('nonexistent')).rejects.toThrow(ChainNotFoundError);
    });

    it('should fetch a transaction successfully', async () => {
        const mockTransaction = {
            hash: 'c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462',
            accountAddress: 'EQCi7s8dDGBmNBJhqLhZhHjBSXVGHdN1oDJOHEEUNHLLXbJY',
            rawTransactionData: {
                blockNumber: 12345678,
                timestamp: 1619833950
            },
            classificationData: {
                description: "Sent 10 TRX to EQC..."
            }
        };

        nock(BASE_URL)
            .get('/tvm/tron/tx/c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462')
            .reply(200, { succeeded: true, response: mockTransaction });

        const response = await translate.getTransaction('tron', 'c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462');
        expect(response).toHaveProperty("accountAddress", "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR");
        expect(response).toHaveProperty("rawTransactionData.blockNumber", 65895195);
        expect(response).toHaveProperty("rawTransactionData.timestamp", 1728334230);
        expect(response).toHaveProperty("classificationData.description", "Sent 108 USDT.");
    });

    it('should handle transaction validation errors', async () => {
        const mockErrorResponse = {
            status: 400,
            errors: {
                chain: ['The field chain is invalid. Valid chains: ton, toncoin'],
                txHash: ['The field txHash must be a valid Transaction Hash.'],
            },
        };

        nock(BASE_URL)
            .get('/tvm/invalidChain/tx/invalidTxHash')
            .reply(400, mockErrorResponse);

        try {
            await translate.getTransaction('invalidChain', 'invalidTxHash');
        } catch (error) {
            expect(error).toBeInstanceOf(SyntaxError);
            expect((error as any).errors).toEqual(mockErrorResponse.errors);
        }
    });

    it('should fetch first page transactions successfully', async () => {
        const mockTransactions = {
            items: [
                { hash: '97264395BD65A255A262389F74F5D05C3BAEB7FE9F4C4F8C49B96D8D8E9BFE00' },
                { hash: 'A8264395BD65A255A262389F74F5D05C3BAEB7FE9F4C4F8C49B96D8D8E9BFEBB' }
            ],
            hasNextPage: true,
            nextPageUrl: 'https://api.example.com/next-page'
        };

        nock(BASE_URL)
            .get('/tvm/tron/txs/TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR')
            .reply(200, { succeeded: true, response: mockTransactions });

        const paginator = await translate.Transactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR');
        expect(paginator.getTransactions()).toHaveLength(10)
    });

    it('should fetch first page transactions with custom paging successfully', async () => {
        const mockTransactions = {
            items: [
                { hash: '97264395BD65A255A262389F74F5D05C3BAEB7FE9F4C4F8C49B96D8D8E9BFE00' },
                { hash: 'A8264395BD65A255A262389F74F5D05C3BAEB7FE9F4C4F8C49B96D8D8E9BFEBB' }
            ],
            hasNextPage: true,
            nextPageUrl: 'https://api.example.com/next-page'
        };

        nock(BASE_URL)
            .get('/tvm/tron/txs/TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR')
            .query(true)
            .reply(200, {
                succeeded: true,
                response: mockTransactions
            });

        const paging: PageOptions = {
            startBlock: 20104079,
            sort: 'desc'
        }

        const mockGetTransactions = jest.fn().mockReturnValue([/* mock transactions */]);
        const mockTxEngine = {
            getTransactions: mockGetTransactions,
            getCurrentPageKeys: jest.fn().mockReturnValue(paging)
        };

        const mockTransactionsPage: Partial<TransactionsPage<Transaction>> = {
            getTransactions: mockGetTransactions,
            getCurrentPageKeys: jest.fn().mockReturnValue(paging),
            next: jest.fn()
        };

        jest.spyOn(translate, 'Transactions').mockResolvedValue(mockTransactionsPage as TransactionsPage<Transaction>);

        const txEngine = await translate.Transactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR', paging);

        expect(txEngine.getCurrentPageKeys()).toEqual(paging);
    });
});