import nock from 'nock';
import { TransactionError } from '../../src/errors/TransactionError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { 
    TVMTranslateTransactionV2,
    TVMTranslateTransactionV5,
    TVMTranslateTransactionResponse,
    TVMTranslateStartBalanceJobResponse,
    TVMTranslateBalanceJobResult
} from '../../src/types/tvm';
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

    it('should fetch a transaction successfully (v5 format)', async () => {
        const mockTransactionV5: TVMTranslateTransactionV5 = {
            txTypeVersion: 5,
            chain: "tron",
            accountAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
            timestamp: 1750855026,
            classificationData: {
                type: "sendToken",
                source: {
                    type: "human"
                },
                description: "Sent 952.71 USDT.",
                protocol: {
                    name: null
                }
            },
            transfers: [
                {
                    action: "sent",
                    from: {
                        name: "This wallet",
                        address: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c"
                    },
                    to: {
                        name: null,
                        address: "0x7452F02038a6039B730c7EC929A3380FF1B4a6e7"
                    },
                    amount: "952.71",
                    token: {
                        symbol: "USDT",
                        name: "Tether USD",
                        decimals: 6,
                        address: "0xa614f803b6fd780986a42c78ec9c7f77e6ded13c"
                    }
                },
                {
                    action: "paidGas",
                    from: {
                        name: "This wallet",
                        address: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c"
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
            values: [],
            rawTransactionData: {
                transactionHash: "0x3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8",
                fromAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
                toAddress: "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C",
                blockNumber: 73399429,
                gas: 64285,
                gasUsed: 64285,
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
                timestamp: 1750855026
            }
        };

        mockRequest.mockResolvedValue(mockTransactionV5);

        const response = await translate.getTransaction('tron', '3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8', 'v5');
        expect(response).toEqual(mockTransactionV5);
        expect(mockRequest).toHaveBeenCalledWith('tron/tx/v5/3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8');
    });

    it('should fetch a transaction successfully (v2 format)', async () => {
        const mockTransactionV2: TVMTranslateTransactionV2 = {
            txTypeVersion: 2,
            chain: "tron",
            accountAddress: "TZDhw1SAPL2xEWopyRK9XZRqMiRhGEs6NM",
            classificationData: {
                type: "sendToken",
                source: {
                    type: "human"
                },
                description: "Sent 952.71 USDT.",
                protocol: {
                    name: null
                },
                sent: [
                    {
                        action: "sent",
                        from: {
                            name: "This wallet",
                            address: "TZDhw1SAPL2xEWopyRK9XZRqMiRhGEs6NM"
                        },
                        to: {
                            name: null,
                            address: "TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv"
                        },
                        amount: "952.71",
                        token: {
                            symbol: "USDT",
                            name: "Tether USD",
                            decimals: 6,
                            address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
                        }
                    },
                    {
                        action: "paidGas",
                        from: {
                            name: "This wallet",
                            address: "TZDhw1SAPL2xEWopyRK9XZRqMiRhGEs6NM"
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
                transactionHash: "3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8",
                fromAddress: "TZDhw1SAPL2xEWopyRK9XZRqMiRhGEs6NM",
                toAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
                blockNumber: 73399429,
                gas: 64285,
                gasUsed: 64285,
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
                timestamp: 1750855026
            }
        };

        mockRequest.mockResolvedValue(mockTransactionV2);

        const response = await translate.getTransaction('tron', '3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8', 'v2');
        expect(response).toEqual(mockTransactionV2);
        expect(mockRequest).toHaveBeenCalledWith('tron/tx/v2/3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8');
    });

    it('should use v5 format by default', async () => {
        const mockTransactionV5: TVMTranslateTransactionV5 = {
            txTypeVersion: 5,
            chain: "tron",
            accountAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
            timestamp: 1750855026,
            classificationData: {
                type: "sendToken",
                source: {
                    type: "human"
                },
                description: "Sent 952.71 USDT.",
                protocol: {
                    name: null
                }
            },
            transfers: [],
            values: [],
            rawTransactionData: {
                transactionHash: "0x3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8",
                fromAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
                toAddress: "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C",
                blockNumber: 73399429,
                gas: 64285,
                gasUsed: 64285,
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
                timestamp: 1750855026
            }
        };

        mockRequest.mockResolvedValue(mockTransactionV5);

        const response = await translate.getTransaction('tron', '3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8');
        expect(response).toEqual(mockTransactionV5);
        expect(mockRequest).toHaveBeenCalledWith('tron/tx/v5/3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8');
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
        expect(transactions.getTransactions()).toEqual(mockTransactions.items as TVMTranslateTransactionV2[]);
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
        expect(transactions.getTransactions()).toEqual(mockTransactions.items as TVMTranslateTransactionV2[]);
        expect(transactions.getNextPageKeys()).not.toBeNull();
    });

    it('should support v5Format parameter in getTransactions', async () => {
        const mockTransactionsV5 = {
            items: [
                {
                    txTypeVersion: 5,
                    chain: "tron",
                    accountAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
                    timestamp: 1750855026,
                    classificationData: {
                        type: "sendToken",
                        source: {
                            type: "human"
                        },
                        description: "Sent 952.71 USDT.",
                        protocol: {
                            name: null
                        }
                    },
                    transfers: [
                        {
                            action: "sent",
                            from: {
                                name: "This wallet",
                                address: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c"
                            },
                            to: {
                                name: null,
                                address: "0x7452F02038a6039B730c7EC929A3380FF1B4a6e7"
                            },
                            amount: "952.71",
                            token: {
                                symbol: "USDT",
                                name: "Tether USD",
                                decimals: 6,
                                address: "0xa614f803b6fd780986a42c78ec9c7f77e6ded13c"
                            }
                        }
                    ],
                    values: [],
                    rawTransactionData: {
                        transactionHash: "0x3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8",
                        fromAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
                        toAddress: "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C",
                        blockNumber: 73399429,
                        gas: 64285,
                        gasUsed: 64285,
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
                        timestamp: 1750855026
                    }
                }
            ],
            pageSize: 10,
            hasNextPage: false,
            nextPageUrl: null
        };

        mockRequest.mockResolvedValue(mockTransactionsV5);

        const transactions = await translate.getTransactions('tron', '0xFf08DdBD8D36b38c048763b8904A42ff625efd3c', { v5Format: true });
        expect(transactions).toBeInstanceOf(TransactionsPage);
        expect(transactions.getTransactions()).toEqual(mockTransactionsV5.items as TVMTranslateTransactionV5[]);
        
        // Test that v5 format structure is properly validated
        const txs = transactions.getTransactions();
        const firstTxV5 = txs[0] as any; // Cast to any to access v5 format fields
        expect(firstTxV5.txTypeVersion).toBe(5);
        expect(firstTxV5.transfers).toBeDefined();
        expect(firstTxV5.values).toBeDefined();
        expect(firstTxV5.timestamp).toBeDefined();
    });

    it('should handle format version mismatch in getTransactions', async () => {
        const mockTransactionsV2WithWrongFormat = {
            items: [
                {
                    txTypeVersion: 2, // API returns v2 but we requested v5
                    chain: "tron",
                    accountAddress: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR",
                    classificationData: {
                        type: "receiveToken",
                        source: { type: "human" },
                        description: "Received 0.000001 TRX.",
                        protocol: { name: null },
                        sent: [],
                        received: []
                    },
                    rawTransactionData: {}
                }
            ],
            pageSize: 10,
            hasNextPage: false,
            nextPageUrl: null
        };

        mockRequest.mockResolvedValue(mockTransactionsV2WithWrongFormat);

        await expect(translate.getTransactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR', { v5Format: true }))
            .rejects.toThrow(TransactionError);
    });

    it('should validate v5 format structure in getTransactions', async () => {
        const mockTransactionsV5Invalid = {
            items: [
                {
                    txTypeVersion: 5,
                    chain: "tron",
                    accountAddress: "0xFf08DdBD8D36b38c048763b8904A42ff625efd3c",
                    // Missing required v5 fields: transfers, values, timestamp
                    classificationData: {
                        type: "sendToken",
                        source: { type: "human" },
                        description: "Sent 952.71 USDT.",
                        protocol: { name: null }
                    },
                    rawTransactionData: {}
                }
            ],
            pageSize: 10,
            hasNextPage: false,
            nextPageUrl: null
        };

        mockRequest.mockResolvedValue(mockTransactionsV5Invalid);

        await expect(translate.getTransactions('tron', '0xFf08DdBD8D36b38c048763b8904A42ff625efd3c', { v5Format: true }))
            .rejects.toThrow(TransactionError);
    });

    it('should validate v2 format structure in getTransactions', async () => {
        const mockTransactionsV2Invalid = {
            items: [
                {
                    txTypeVersion: 2,
                    chain: "tron",
                    accountAddress: "TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR",
                    classificationData: {
                        type: "receiveToken",
                        source: { type: "human" },
                        description: "Received 0.000001 TRX.",
                        protocol: { name: null }
                        // Missing required v2 fields: sent, received arrays
                    },
                    transfers: [], // Should not be present in v2 format
                    rawTransactionData: {}
                }
            ],
            pageSize: 10,
            hasNextPage: false,
            nextPageUrl: null
        };

        mockRequest.mockResolvedValue(mockTransactionsV2Invalid);

        await expect(translate.getTransactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR'))
            .rejects.toThrow(TransactionError);
    });

    it('should start a balance job successfully', async () => {
        const mockStartJobResponse: TVMTranslateStartBalanceJobResponse = {
            jobId: '0xc8259410336d786984a8194db6f9a732381a4c68',
            resultUrl: 'https://translate.noves.fi/tvm/tron/balances/job/0xc8259410336d786984a8194db6f9a732381a4c68'
        };

        mockRequest.mockResolvedValue(mockStartJobResponse);

        const response = await translate.startBalancesJob(
            'tron', 
            'TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT', 
            'TH2uNFtnwr5NsiAW2Py6Fmv8zDhfYXyDd9', 
            73196764
        );
        
        expect(response).toEqual(mockStartJobResponse);
        expect(mockRequest).toHaveBeenCalledWith(
            'tron/balances/job/start?tokenAddress=TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT&accountAddress=TH2uNFtnwr5NsiAW2Py6Fmv8zDhfYXyDd9&blockNumber=73196764',
            'POST'
        );
    });

    it('should get balance job results successfully', async () => {
        const mockBalanceResult: TVMTranslateBalanceJobResult = {
            chain: 'tron',
            accountAddress: 'TH2uNFtnwr5NsiAW2Py6Fmv8zDhfYXyDd9',
            token: {
                symbol: 'SUNDOG',
                name: 'Sundog',
                decimals: 18,
                address: 'TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT'
            },
            amount: '19.52212',
            blockNumber: 73196764
        };

        mockRequest.mockResolvedValue(mockBalanceResult);

        const response = await translate.getBalancesJobResults(
            'tron', 
            '0xc8259410336d786984a8194db6f9a732381a4c68'
        );
        
        expect(response).toEqual(mockBalanceResult);
        expect(mockRequest).toHaveBeenCalledWith('tron/balances/job/0xc8259410336d786984a8194db6f9a732381a4c68');
    });

    it('should handle balance job start errors', async () => {
        const mockErrorResponse = {
            tokenAddress: ['The field tokenAddress must be a valid token address.'],
            accountAddress: ['The field accountAddress must be a valid account address.'],
            blockNumber: ['The field blockNumber must be a valid block number.']
        };

        mockRequest.mockRejectedValue(new TransactionError(mockErrorResponse));

        await expect(translate.startBalancesJob('tron', 'invalidToken', 'invalidAccount', -1))
            .rejects.toThrow(TransactionError);
    });

    it('should handle balance job results not ready (425 status)', async () => {
        const mockErrorResponse = {
            message: ['Job is still processing. Please try again later.']
        };

        mockRequest.mockRejectedValue(new TransactionError(mockErrorResponse));

        await expect(translate.getBalancesJobResults('tron', '0xc8259410336d786984a8194db6f9a732381a4c68'))
            .rejects.toThrow(TransactionError);
    });

});

