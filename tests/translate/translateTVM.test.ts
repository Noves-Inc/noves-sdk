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
        // Add a 1-second delay between test runs to avoid rate limiting
        return new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should fetch chains successfully', async () => {
        const mockChains = [
            {
                ecosystem: "tvm",
                name: "tron",
                nativeCoin: {
                    address: "TRX",
                    decimals: 6,
                    name: "TRX",
                    symbol: "TRX"
                },
                tier: 0
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
        const mockChain = { 
            "ecosystem": "tvm", 
            "name": "tron",
            nativeCoin: {
                address: "TRX",
                decimals: 6,
                name: "TRX",
                symbol: "TRX"
            },
            tier: 0
        };

        nock(BASE_URL)
            .get('/tvm/chains')
            .reply(200, [mockChain]);

        const response = await translate.getChain("tron");
        expect(response).toEqual(mockChain);
    });

    it('should throw ChainNotFoundError when chain is not found', async () => {
        const mockChains = [
            { 
                "ecosystem": "tvm", 
                "name": "tron",
                "nativeCoin": {
                    "address": "TRX",
                    "decimals": 6,
                    "name": "TRX",
                    "symbol": "TRX"
                }
            }
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
        const mockChains = [
            {
                name: "tron",
                nativeCoin: {
                    symbol: "TRX",
                    name: "Tron",
                    decimals: 6,
                    address: "TRX"
                }
            }
        ];

        const mockTransactions = {
            items: [
                {
                    txTypeVersion: 2,
                    chain: "tron",
                    accountAddress: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR",
                    classificationData: {
                        type: "receiveToken",
                        source: {
                            type: "human"
                        },
                        description: "Received 0.000001 TRX.",
                        protocol: {
                            name: null
                        },
                        sent: [],
                        received: [
                            {
                                action: "received",
                                from: {
                                    name: null,
                                    address: "TVXk9LFfNUJvtoX8tWFuVLUyPUMN1M3JVC"
                                },
                                to: {
                                    name: "This wallet",
                                    address: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR"
                                },
                                amount: "0.000001",
                                token: {
                                    symbol: "TRX",
                                    name: "Tron",
                                    decimals: 6,
                                    address: "TRX"
                                }
                            }
                        ]
                    },
                    rawTransactionData: {
                        transactionHash: "5a07965ab7bb7c4d0856c67a0301e9c6e4ee8713dc4e82d24d8af52ae6eedb6a",
                        fromAddress: "TVXk9LFfNUJvtoX8tWFuVLUyPUMN1M3JVC",
                        toAddress: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR",
                        blockNumber: 69937362,
                        gas: 0,
                        gasUsed: 0,
                        gasPrice: 210,
                        transactionFee: {
                            amount: "0",
                            token: {
                                symbol: "TRX",
                                name: "Tron",
                                decimals: 6,
                                address: "TRX"
                            }
                        },
                        timestamp: 1740464547
                    }
                },
                {
                    txTypeVersion: 2,
                    chain: "tron",
                    accountAddress: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR",
                    classificationData: {
                        type: "sendToken",
                        source: {
                            type: "human"
                        },
                        description: "Sent 5 TRX.",
                        protocol: {
                            name: null
                        },
                        sent: [
                            {
                                action: "sent",
                                from: {
                                    name: "This wallet",
                                    address: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR"
                                },
                                to: {
                                    name: null,
                                    address: "TS3PArVTgWb1HZahsoEprG3Fjh8t526JVC"
                                },
                                amount: "5",
                                token: {
                                    symbol: "TRX",
                                    name: "Tron",
                                    decimals: 6,
                                    address: "TRX"
                                }
                            },
                            {
                                action: "paidGas",
                                from: {
                                    name: "This wallet",
                                    address: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR"
                                },
                                to: {
                                    name: null,
                                    address: null
                                },
                                amount: "0",
                                token: {
                                    symbol: "TRX",
                                    name: "Tron",
                                    decimals: 6,
                                    address: "TRX"
                                }
                            }
                        ],
                        received: []
                    },
                    rawTransactionData: {
                        transactionHash: "8972836dbcf54474b0c9ee1dc2b1dc2cd13cc1d3a3f9c7cf1103f7174209e26f",
                        fromAddress: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR",
                        toAddress: "TS3PArVTgWb1HZahsoEprG3Fjh8t526JVC",
                        blockNumber: 69937339,
                        gas: 0,
                        gasUsed: 0,
                        gasPrice: 210,
                        transactionFee: {
                            amount: "0",
                            token: {
                                symbol: "TRX",
                                name: "Tron",
                                decimals: 6,
                                address: "TRX"
                            }
                        },
                        timestamp: 1740464478
                    }
                }
            ],
            pageSize: 10,
            hasNextPage: true,
            nextPageUrl: "https://translate.noves.fi/tvm/tron/txs/TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR?startBlock=1&endBlock=66312567&pageSize=10&ignoreTransactions=67f73147f4aa61bb9fc3e52453c65afa1e6b8e2b48313bc8f65f66ab032b5663&viewAsAccountAddress=&sort=desc&viewAsTransactionSender=False"
        };

        nock(BASE_URL)
            .get('/tvm/chains')
            .reply(200, mockChains);

        nock(BASE_URL)
            .get('/tvm/tron/txs/TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR')
            .query(true)
            .reply(200, mockTransactions);

        const paginator = await translate.Transactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR');
        const transactions = paginator.getTransactions();
        expect(transactions[0]).toEqual(mockTransactions.items[0]);
        expect(transactions[1]).toEqual(mockTransactions.items[1]);
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