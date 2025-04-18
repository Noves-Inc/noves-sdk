// src/translate/translatePOLKADOT.ts

import { Chain, PageOptions, Transaction } from '../types/types';
import { createTranslateClient } from '../utils/apiUtils';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';

const ECOSYSTEM = 'polkadot';

/**
 * Class representing the Polkadot translation module.
 */
export class TranslatePOLKADOT {
    private request: ReturnType<typeof createTranslateClient>;

    /**
     * Create a TranslatePOLKADOT instance.
     * @param {string} apiKey - The API key to authenticate requests.
     * @throws Will throw an error if the API key is not provided.
     */
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.request = createTranslateClient(ECOSYSTEM, apiKey);
    }

    /**
     * Returns a list with the names of the Polkadot blockchains currently supported by this API. 
     * Use the provided chain name when calling other methods.
     * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
     */
    public async getChains(): Promise<Chain[]> {
        const result = await this.request('chains');
        return result.response;
    }

    /**
     * Get a chain by its name.
     * @param {string} name - The name of the chain to retrieve.
     * @returns {Promise<Chain>} A promise that resolves to the chain object.
     * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
     */
    public async getChain(name: string): Promise<Chain> {
        const result = await this.request('chains');
        const chain = result.response.find((chain: Chain) =>
            chain.name.toLowerCase() === name.toLowerCase()
        );
        if (!chain) {
            throw new ChainNotFoundError(name);
        }
        return chain;
    }

    /**
     * Returns all of the available transaction information for the chain and transaction hash requested.
     * @param {string} chain - The chain name.
     * @param {number} blockNumber - The block number.
     * @param {number} index - The index of the transaction in the block.
     * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransaction(chain: string, blockNumber: number, index: number): Promise<Transaction> {
        try {
            const result = await this.request(`${chain}/block/${blockNumber}/tx/${index}`);
            return result.response;
        } catch (error) {
            if (error instanceof Response) {
                const errorResponse = await error.json();
                if (errorResponse.status === 400 && errorResponse.errors) {
                    throw new TransactionError(errorResponse.errors);
                }
            }
            throw error;
        }
    }

    /**
     * Get a pagination object to iterate over transactions pages.
     * @param {string} chain - The chain name.
     * @param {string} accountAddress - The account address.
     * @param {PageOptions} pageOptions - The page options object. 
     * Use startBlock, endBlock, startTimestamp, endTimestamp,and pageSize to filter the transactions.
     * @returns {Promise<TransactionsPage<Transaction>>} A promise that resolves to a TransactionsPage instance.
     */
    public async Transactions(chain: string, accountAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<Transaction>> {
        try {
            const endpoint = `${chain}/txs/${accountAddress}`;
            const url = constructUrl(endpoint, pageOptions);
            const result = await this.request(url);

            const initialData = {
                chain: chain,
                accountAddress: accountAddress,
                transactions: result.response.items,
                currentPageKeys: pageOptions,
                nextPageKeys: result.response.hasNextPage ? parseUrl(result.response.nextPageUrl) : null,
            };
            return new TransactionsPage(this, initialData);
        } catch (error) {
            if (error instanceof Response) {
                const errorResponse = await error.json();
                if (errorResponse.status === 400 && errorResponse.errors) {
                    throw new TransactionError(errorResponse.errors);
                }
            }
            throw error;
        }
    }
}
