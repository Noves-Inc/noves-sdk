// src/translate/translatePOLKADOT.ts

import { PageOptions } from '../types/common';
import { 
    POLKADOTTranslateChain, 
    POLKADOTTranslateChainsResponse, 
    POLKADOTTranslateTransaction, 
    POLKADOTTranslateTransactionsResponse,
    POLKADOTTranslateStakingRewardsResponse 
} from '../types/polkadot';
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
     * @returns {Promise<POLKADOTTranslateChainsResponse>} A promise that resolves to an array of chains.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getChains(): Promise<POLKADOTTranslateChainsResponse> {
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
     * Returns all of the available transaction information for the chain and transaction hash requested.
     * @param {string} chain - The chain name.
     * @param {number} blockNumber - The block number.
     * @param {number} index - The index of the transaction in the block.
     * @returns {Promise<POLKADOTTranslateTransaction>} A promise that resolves to the transaction details.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransaction(chain: string, blockNumber: number, index: number): Promise<POLKADOTTranslateTransaction> {
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

            return result as POLKADOTTranslateTransaction;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get transaction'] });
        }
    }

    /**
     * Returns all transactions for the requested chain and account, given a timerange. 
     * This method provides direct access to the API response.
     * @param {string} chain - The chain name.
     * @param {string} accountAddress - The account address.
     * @param {PageOptions} pageOptions - The page options object. 
     * Use startBlock, endBlock, startTimestamp, endTimestamp, and pageSize to filter the transactions.
     * @returns {Promise<POLKADOTTranslateTransactionsResponse>} A promise that resolves to the transactions response.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<POLKADOTTranslateTransactionsResponse> {
        try {
            const endpoint = `${chain}/txs/${accountAddress}`;
            const url = constructUrl(endpoint, pageOptions);
            const result = await this.makeRequest(url);

            if (!this.validateResponse(result, ['items', 'nextPageSettings'])) {
                throw new TransactionError({ message: ['Invalid response format'] });
            }

            return result as POLKADOTTranslateTransactionsResponse;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get transactions'] });
        }
    }

    /**
     * Get a pagination object to iterate over transactions pages.
     * @param {string} chain - The chain name.
     * @param {string} accountAddress - The account address.
     * @param {PageOptions} pageOptions - The page options object. 
     * Use startBlock, endBlock, startTimestamp, endTimestamp,and pageSize to filter the transactions.
     * @returns {Promise<TransactionsPage<POLKADOTTranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
     * @throws {TransactionError} If there are validation errors in the request.
     * @deprecated Use getTransactions for direct API response access. This method is kept for backward compatibility.
     */
    public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<POLKADOTTranslateTransaction>> {
        try {
            const response = await this.getTransactions(chain, accountAddress, pageOptions);

            const initialData = {
                chain: chain,
                accountAddress: accountAddress,
                transactions: response.items,
                currentPageKeys: pageOptions,
                nextPageKeys: response.nextPageSettings.hasNextPage && response.nextPageSettings.nextPageUrl ? parseUrl(response.nextPageSettings.nextPageUrl) : null,
            };
            return new TransactionsPage(this, initialData);
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get transactions'] });
        }
    }
}
