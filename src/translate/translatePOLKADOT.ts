// src/translate/translatePOLKADOT.ts

import { Chain, PageOptions, Transaction, PolkadotTransaction, PolkadotStakingRewardsResponse } from '../types/types';
import { BaseTranslate } from './baseTranslate';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';

const ECOSYSTEM = 'polkadot';

/**
 * Class representing the Polkadot translation module.
 */
export class TranslatePOLKADOT extends BaseTranslate {
    /**
     * Create a TranslatePOLKADOT instance.
     * @param {string} apiKey - The API key to authenticate requests.
     * @throws Will throw an error if the API key is not provided.
     */
    constructor(apiKey: string) {
        super(ECOSYSTEM, apiKey);
    }

    /**
     * Returns a list with the names of the Polkadot blockchains currently supported by this API. 
     * Use the provided chain name when calling other methods.
     * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getChains(): Promise<Chain[]> {
        try {
            const result = await this.makeRequest('chains');
            if (!Array.isArray(result)) {
                throw new TransactionError({ message: ['Invalid response format'] });
            }
            return result;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get chains'] });
        }
    }

    /**
     * Get a chain by its name.
     * @param {string} name - The name of the chain to retrieve.
     * @returns {Promise<Chain>} A promise that resolves to the chain object.
     * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getChain(name: string): Promise<Chain> {
        try {
            const chains = await this.getChains();
            const chain = chains.find((chain: Chain) =>
                chain.name.toLowerCase() === name.toLowerCase()
            );
            if (!chain) {
                throw new ChainNotFoundError(name);
            }
            return chain;
        } catch (error) {
            if (error instanceof ChainNotFoundError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get chain'] });
        }
    }

    /**
     * Returns all of the available transaction information for the chain and transaction hash requested.
     * @param {string} chain - The chain name.
     * @param {number} blockNumber - The block number.
     * @param {number} index - The index of the transaction in the block.
     * @returns {Promise<PolkadotTransaction>} A promise that resolves to the transaction details.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransaction(chain: string, blockNumber: number, index: number): Promise<PolkadotTransaction> {
        try {
            const result = await this.makeRequest(`${chain}/tx/${blockNumber}/${index}`);
            if (!result || typeof result !== 'object') {
                throw new TransactionError({ message: ['Invalid response format'] });
            }

            // Validate required fields
            const requiredFields = ['txTypeVersion', 'chain', 'block', 'index', 'classificationData', 'transfers', 'values', 'rawTransactionData'];
            for (const field of requiredFields) {
                if (!(field in result)) {
                    throw new TransactionError({ message: [`Missing required field: ${field}`] });
                }
            }

            return result as PolkadotTransaction;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get transaction'] });
        }
    }

    /**
     * Get a pagination object to iterate over transactions pages.
     * @param {string} chain - The chain name.
     * @param {string} accountAddress - The account address.
     * @param {PageOptions} pageOptions - The page options object. 
     * Use startBlock, endBlock, startTimestamp, endTimestamp,and pageSize to filter the transactions.
     * @returns {Promise<TransactionsPage<Transaction>>} A promise that resolves to a TransactionsPage instance.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<Transaction>> {
        try {
            const endpoint = `${chain}/txs/${accountAddress}`;
            const url = constructUrl(endpoint, pageOptions);
            const result = await this.makeRequest(url);

            if (!this.validateResponse(result, ['items', 'hasNextPage'])) {
                throw new TransactionError({ message: ['Invalid response format'] });
            }

            const initialData = {
                chain: chain,
                accountAddress: accountAddress,
                transactions: result.items,
                currentPageKeys: pageOptions,
                nextPageKeys: result.hasNextPage ? parseUrl(result.nextPageUrl) : null,
            };
            return new TransactionsPage(this, initialData);
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get transactions'] });
        }
    }

    /**
     * Get a simplified description of a transaction.
     * @param {string} chain - The chain name.
     * @param {number} blockNumber - The block number.
     * @param {number} index - The index of the transaction in the block.
     * @param {string} [viewAsAccountAddress] - Optional: view transaction from this address's perspective.
     * @returns {Promise<{type: string, description: string}>} A promise that resolves to the transaction description.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async describeTransaction(
        chain: string,
        blockNumber: number,
        index: number,
        viewAsAccountAddress?: string
    ): Promise<{ type: string; description: string }> {
        try {
            const endpoint = `${chain}/block/${blockNumber}/tx/${index}/describe`;
            const url = viewAsAccountAddress ? `${endpoint}?viewAsAccountAddress=${viewAsAccountAddress}` : endpoint;
            const result = await this.makeRequest(url);
            
            if (!result || typeof result.type !== 'string' || typeof result.description !== 'string') {
                throw new TransactionError({ message: ['Invalid response format'] });
            }
            
            return result;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to describe transaction'] });
        }
    }

    /**
     * Get simplified descriptions for multiple transactions at once.
     * @param {string} chain - The chain name.
     * @param {Array<{blockNumber: number, index: number}>} transactions - Array of transaction identifiers.
     * @param {string} [viewAsAccountAddress] - Optional: view transactions from this address's perspective.
     * @returns {Promise<Array<{type: string, description: string}>>} A promise that resolves to an array of transaction descriptions.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async describeTransactions(
        chain: string,
        transactions: Array<{ blockNumber: number; index: number }>,
        viewAsAccountAddress?: string
    ): Promise<Array<{ type: string; description: string }>> {
        try {
            const endpoint = `${chain}/txs/describe`;
            const url = viewAsAccountAddress ? `${endpoint}?viewAsAccountAddress=${viewAsAccountAddress}` : endpoint;
            const result = await this.makeRequest(url, 'POST', {
                body: JSON.stringify({ transactions })
            });

            if (!Array.isArray(result)) {
                throw new TransactionError({ message: ['Invalid response format'] });
            }

            return result;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to describe transactions'] });
        }
    }
}
