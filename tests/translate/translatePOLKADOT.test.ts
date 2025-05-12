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
                    name: 'polkadot',
                    ecosystem: 'polkadot',
                    nativeCoin: {
                        name: 'Polkadot',
                        symbol: 'DOT',
                        address: '0x0000000000000000000000000000000000000000',
                        decimals: 10
                    },
                    tier: 1
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

    describe('getChain', () => {
        it('should return a specific chain by name', async () => {
            const mockChain = {
                name: 'polkadot',
                ecosystem: 'polkadot',
                nativeCoin: {
                    name: 'Polkadot',
                    symbol: 'DOT',
                    address: '0x0000000000000000000000000000000000000000',
                    decimals: 10
                },
                tier: 1
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([mockChain])
            });

            const result = await translate.getChain('polkadot');
            expect(result).toEqual(mockChain);
        });

        it('should throw ChainNotFoundError for non-existent chain', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([])
            });

            await expect(translate.getChain('nonexistent')).rejects.toThrow(ChainNotFoundError);
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

    describe('Transactions', () => {
        it('should return a TransactionsPage instance', async () => {
            const mockResponse = {
                items: [
                    {
                        txTypeVersion: 5,
                        chain: 'bittensor',
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
                hasNextPage: false,
                nextPageUrl: null
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await translate.Transactions('bittensor', '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7', {
                pageSize: 10,
                endBlock: 4000001
            });

            expect(result).toBeInstanceOf(TransactionsPage);
            expect(result.getTransactions()).toEqual(mockResponse.items);
            expect(result.getNextPageKeys()).toBeNull();
        });

        it('should handle pagination correctly', async () => {
            const mockResponse = {
                items: [],
                hasNextPage: true,
                nextPageUrl: 'https://translate.noves.fi/polkadot/bittensor/txs/5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7?endBlock=4000000&pageSize=10'
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
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

    describe('describeTransaction', () => {
        it('should return transaction description', async () => {
            const mockDescription = {
                type: 'transfer',
                description: 'Transfer 1 DOT from 0xabc to 0xdef'
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockDescription)
            });

            const result = await translate.describeTransaction('polkadot', 123, 0);
            expect(result).toEqual(mockDescription);
        });

        it('should throw TransactionError on invalid response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            await expect(translate.describeTransaction('polkadot', 123, 0)).rejects.toThrow(TransactionError);
        });
    });

    describe('describeTransactions', () => {
        it('should return array of transaction descriptions', async () => {
            const mockDescriptions = [
                {
                    type: 'transfer',
                    description: 'Transfer 1 DOT from 0xabc to 0xdef'
                }
            ];

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockDescriptions)
            });

            const result = await translate.describeTransactions('polkadot', [{ blockNumber: 123, index: 0 }]);
            expect(result).toEqual(mockDescriptions);
        });

        it('should throw TransactionError on invalid response', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });

            await expect(translate.describeTransactions('polkadot', [{ blockNumber: 123, index: 0 }])).rejects.toThrow(TransactionError);
        });
    });
}); 