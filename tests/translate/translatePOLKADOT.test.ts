import { TranslatePOLKADOT } from '../../src/translate/translatePOLKADOT';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';
import { TransactionError } from '../../src/errors/TransactionError';
import { TransactionsPage } from '../../src/translate/transactionsPage';

describe('TranslatePOLKADOT', () => {
    const apiKey = 'test-api-key';
    let translate: TranslatePOLKADOT;

    beforeEach(() => {
        translate = new TranslatePOLKADOT(apiKey);
    });

    describe('getChains', () => {
        it('should return a list of supported chains', async () => {
            const mockChains = [
                {
                    name: 'bittensor',
                    ecosystem: 'polkadot',
                    nativeCoin: {
                        name: 'TAO',
                        symbol: 'TAO',
                        address: 'TAO',
                        decimals: 9
                    },
                    tier: 2
                }
            ];

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockChains)
            });

            const result = await translate.getChains();
            expect(result).toEqual(mockChains);
        });

        it('should throw TransactionError on invalid response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            await expect(translate.getChains()).rejects.toThrow(TransactionError);
        });
    });

    describe('getTransaction', () => {
        it('should return transaction details', async () => {
            const mockTransaction = {
                txTypeVersion: 5,
                chain: 'bittensor',
                accountAddress: null,
                block: 4000000,
                index: 1,
                classificationData: {
                    type: 'setWeights',
                    description: 'Set weights to [24, 216]'
                },
                transfers: [
                    {
                        action: 'paidGas',
                        from: {
                            name: null,
                            address: '5FxcZraZACr4L78jWkcYe3FHdiwiAUzrKLVtsSwkvFobBKqq',
                            owner: {
                                name: null,
                                address: '0xac4ba7704623c5beb4950ef97ddea57c9c12b91938c86f28475f8050741ac956'
                            }
                        },
                        to: {
                            name: null,
                            address: null,
                            owner: {
                                name: null,
                                address: null
                            }
                        },
                        amount: '0',
                        asset: {
                            name: 'TAO',
                            symbol: 'TAO',
                            decimals: 9
                        }
                    }
                ],
                values: [
                    {
                        key: 'weights',
                        value: '[24, 216]'
                    },
                    {
                        key: 'functionCalled',
                        value: 'SubtensorModule.set_weights'
                    }
                ],
                rawTransactionData: {
                    extrinsicIndex: 1,
                    blockNumber: 4000000,
                    timestamp: 1728412584,
                    from: {
                        name: null,
                        address: '5FxcZraZACr4L78jWkcYe3FHdiwiAUzrKLVtsSwkvFobBKqq',
                        owner: {
                            name: null,
                            address: '0xac4ba7704623c5beb4950ef97ddea57c9c12b91938c86f28475f8050741ac956'
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
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockTransaction)
            });

            const result = await translate.getTransaction('bittensor', 4000000, 1);
            expect(result).toEqual(mockTransaction);
        });

        it('should throw TransactionError on invalid response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            await expect(translate.getTransaction('bittensor', 4000000, 1)).rejects.toThrow(TransactionError);
        });

        it('should throw TransactionError on missing required fields', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    txTypeVersion: 5,
                    chain: 'bittensor'
                    // Missing other required fields
                })
            });

            await expect(translate.getTransaction('bittensor', 4000000, 1)).rejects.toThrow(TransactionError);
        });
    });

    describe('getTransactions', () => {
        const mockTransactionsResponse = {
            items: [
                {
                    txTypeVersion: 5,
                    chain: 'bittensor',
                    accountAddress: null,
                    block: 4000000,
                    index: 12,
                    classificationData: {
                        type: 'transfer',
                        description: 'Transferred 0.79781 TAO from 0x7756c8fd6c4655bc8b0ae5f4785c80ba0b95a01dd40cbbea7dfa3b8b9aef0758 to 0x63dd3321dbb61ef531138dbd937d6c3c266cb353318b0c26d7d4e926163fbc50'
                    },
                    transfers: [
                        {
                            action: 'transferred',
                            from: {
                                name: null,
                                address: '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7',
                                owner: {
                                    name: null,
                                    address: '0x7756c8fd6c4655bc8b0ae5f4785c80ba0b95a01dd40cbbea7dfa3b8b9aef0758'
                                }
                            },
                            to: {
                                name: null,
                                address: '5EKeJofkJiSkuhMkWJhzcTgnkxQWpjVT7hgiysJdBgDeqd6N',
                                owner: {
                                    name: null,
                                    address: '0x63dd3321dbb61ef531138dbd937d6c3c266cb353318b0c26d7d4e926163fbc50'
                                }
                            },
                            amount: '0.79781',
                            asset: {
                                name: 'TAO',
                                symbol: 'TAO',
                                decimals: 9
                            }
                        },
                        {
                            action: 'paidGas',
                            from: {
                                name: null,
                                address: '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7',
                                owner: {
                                    name: null,
                                    address: '0x7756c8fd6c4655bc8b0ae5f4785c80ba0b95a01dd40cbbea7dfa3b8b9aef0758'
                                }
                            },
                            to: {
                                name: null,
                                address: null,
                                owner: {
                                    name: null,
                                    address: null
                                }
                            },
                            amount: '0.000124559',
                            asset: {
                                name: 'TAO',
                                symbol: 'TAO',
                                decimals: 9
                            }
                        }
                    ],
                    values: [
                        {
                            key: 'functionCalled',
                            value: 'Balances.transfer_allow_death'
                        }
                    ],
                    rawTransactionData: {
                        extrinsicIndex: 12,
                        blockNumber: 4000000,
                        timestamp: 1728412584,
                        from: {
                            name: null,
                            address: '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7',
                            owner: {
                                name: null,
                                address: '0x7756c8fd6c4655bc8b0ae5f4785c80ba0b95a01dd40cbbea7dfa3b8b9aef0758'
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
                }
            ],
            nextPageSettings: {
                hasNextPage: false,
                endBlock: null,
                nextPageUrl: null
            }
        };

        it('should return valid TransactionsPage instance', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockTransactionsResponse)
            });

            const result = await translate.getTransactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7', {
                pageSize: 10,
                endBlock: 4000001
            });

            expect(result).toBeInstanceOf(TransactionsPage);
            const transactions = result.getTransactions();
            expect(transactions).toHaveLength(1);
            expect(result.getNextPageKeys()).toBeNull();
        });

        it('should handle pagination correctly', async () => {
            const mockResponseWithPagination = {
                ...mockTransactionsResponse,
                nextPageSettings: {
                    hasNextPage: true,
                    endBlock: 3999999,
                    nextPageUrl: 'https://translate.noves.fi/polkadot/bittensor/txs/5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7?endBlock=3999999&pageSize=10'
                }
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponseWithPagination)
            });

            const result = await translate.getTransactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7');
            expect(result).toBeInstanceOf(TransactionsPage);
            expect(result.getNextPageKeys()).toBeTruthy();
        });

        it('should throw TransactionError on invalid response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            await expect(translate.getTransactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7'))
                .rejects.toThrow(TransactionError);
        });
    });

    describe('Transactions (deprecated)', () => {
        const mockTransactionsResponse = {
            items: [
                {
                    txTypeVersion: 5,
                    chain: 'bittensor',
                    accountAddress: null,
                    block: 4000000,
                    index: 1,
                    classificationData: {
                        type: 'transfer',
                        description: 'Transferred 0.79781 TAO'
                    },
                    transfers: [],
                    values: [],
                    rawTransactionData: {
                        extrinsicIndex: 1,
                        blockNumber: 4000000,
                        timestamp: 1728412584,
                        from: {
                            name: null,
                            address: '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7',
                            owner: {
                                name: null,
                                address: '0x7756c8fd6c4655bc8b0ae5f4785c80ba0b95a01dd40cbbea7dfa3b8b9aef0758'
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
                }
            ],
            nextPageSettings: {
                hasNextPage: false,
                endBlock: null,
                nextPageUrl: null
            }
        };

        it('should return a TransactionsPage instance', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockTransactionsResponse)
            });

            const result = await translate.Transactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7', {
                pageSize: 10,
                endBlock: 4000001
            });

            expect(result).toBeInstanceOf(TransactionsPage);
            expect(result.getTransactions()).toEqual(mockTransactionsResponse.items);
            expect(result.getNextPageKeys()).toBeNull();
        });

        it('should handle pagination correctly', async () => {
            const mockResponseWithPagination = {
                ...mockTransactionsResponse,
                nextPageSettings: {
                    hasNextPage: true,
                    endBlock: 3999999,
                    nextPageUrl: 'https://translate.noves.fi/polkadot/bittensor/txs/5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7?endBlock=3999999&pageSize=10'
                }
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponseWithPagination)
            });

            const result = await translate.Transactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7');
            expect(result.getNextPageKeys()).not.toBeNull();
        });

        it('should throw TransactionError on invalid response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            await expect(translate.Transactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7'))
                .rejects.toThrow(TransactionError);
        });
    });
}); 