import nock from 'nock';
import { TransactionError } from '../../src/errors/TransactionError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { TVMTranslateTransaction } from '../../src/types/tvm';
import { TranslateTVM } from '../../src/translate/translateTVM';

jest.setTimeout(10000);

const BASE_URL = 'https://translate.noves.fi';

describe('TranslateTVM', () => {
    let translate: TranslateTVM;
    let mockRequest: jest.Mock;

    beforeEach(() => {
        nock.cleanAll();
    });

    beforeEach(() => {
        mockRequest = jest.fn();
        translate = new TranslateTVM('test-api-key');
        (translate as any).makeRequest = mockRequest;
    });

    it('should fetch chains successfully', async () => {
        const mockChains = [
            {
                name: 'tron',
                ecosystem: 'tvm',
                nativeCoin: {
                    name: 'TRX',
                    symbol: 'TRX',
                    address: 'TRX',
                    decimals: 6
                },
                tier: 0
            }
        ];
        mockRequest.mockResolvedValue(mockChains);

        const chains = await translate.getChains();
        expect(chains).toEqual(mockChains);
    });

    it('should fetch a transaction successfully', async () => {
        const mockTransaction = {
            hash: 'c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462',
            accountAddress: 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR',
            rawTransactionData: {
                blockNumber: 65895195,
                timestamp: 1728334230
            },
            classificationData: {
                description: "Sent 108 USDT."
            }
        };

        mockRequest.mockResolvedValue(mockTransaction);

        const response = await translate.getTransaction('tron', 'c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462');
        expect(response).toEqual(mockTransaction);
    });

    it('should handle transaction validation errors', async () => {
        const mockErrorResponse = {
            chain: ['The field chain is invalid. Valid chains: tron'],
            hash: ['The field hash must be a valid Transaction Hash.']
        };

        mockRequest.mockRejectedValue(new TransactionError(mockErrorResponse));

        await expect(translate.getTransaction('invalidChain', 'invalidTxHash'))
            .rejects.toThrow(TransactionError);
    });

    it('should fetch first page transactions successfully', async () => {
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
                }
            ],
            pageSize: 10,
            hasNextPage: true,
            nextPageUrl: "https://translate.noves.fi/tvm/tron/txs/TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR?pageSize=10&sort=desc&pageKey=next"
        };

        mockRequest.mockResolvedValue(mockTransactions);

        const transactions = await translate.Transactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR');
        expect(transactions).toBeInstanceOf(TransactionsPage);
        expect(transactions.getTransactions()).toEqual(mockTransactions.items as TVMTranslateTransaction[]);
        expect(transactions.getNextPageKeys()).not.toBeNull();
    });

    it('should fetch first page transactions successfully with getTransactions method', async () => {
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
                }
            ],
            pageSize: 10,
            hasNextPage: true,
            nextPageUrl: "https://translate.noves.fi/tvm/tron/txs/TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR?pageSize=10&sort=desc&pageKey=next"
        };

        mockRequest.mockResolvedValue(mockTransactions);

        const transactions = await translate.getTransactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR');
        expect(transactions).toBeInstanceOf(TransactionsPage);
        expect(transactions.getTransactions()).toEqual(mockTransactions.items as TVMTranslateTransaction[]);
        expect(transactions.getNextPageKeys()).not.toBeNull();
    });

});

