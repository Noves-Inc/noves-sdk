import { PageOptions } from '../types/common';
import { TVMTranslateChain, TVMTranslateTransaction } from '../types/tvm';
import { TransactionsPage } from './transactionsPage';
import { TransactionError } from '../errors/TransactionError';
import { constructUrl, parseUrl } from '../utils/urlUtils';
import { BaseTranslate } from './baseTranslate';

const ECOSYSTEM = 'tvm';

/**
 * Class representing the TVM translation module.
 */
export class TranslateTVM extends BaseTranslate {
    /**
     * Create a TranslateTVM instance.
     * @param {string} apiKey - The API key to authenticate requests.
     * @throws Will throw an error if the API key is not provided.
     */
    constructor(apiKey: string) {
        super(ECOSYSTEM, apiKey);
    }

    /**
     * Returns a list with the names of the TVM blockchains currently supported by this API. 
     * Use the provided chain name when calling other methods.
     * @returns {Promise<TVMTranslateChain[]>} A promise that resolves to an array of chains.
     */
    public async getChains(): Promise<TVMTranslateChain[]> {
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
     * @param {string} hash - The transaction hash.
     * @returns {Promise<TVMTransaction>} A promise that resolves to the transaction details.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransaction(chain: string, hash: string): Promise<TVMTranslateTransaction> {
        try {
            const result = await this.makeRequest(`${chain}/tx/${hash}`);
            return result;
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
     * @param {string} walletAddress - The wallet address.
     * @param {PageOptions} pageOptions - The page options object.
     * @returns {Promise<TransactionsPage<TVMTranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
     */
    public async getTransactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<TVMTranslateTransaction>> {
        try {
            const endpoint = `${chain}/txs/${walletAddress}`;
            const url = constructUrl(endpoint, pageOptions);
            const result = await this.makeRequest(url);

            const initialData = {
                chain: chain,
                walletAddress: walletAddress,
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
     * @deprecated Use getTransactions() instead
     * Get a pagination object to iterate over transactions pages.
     * @param {string} chain - The chain name.
     * @param {string} walletAddress - The wallet address.
     * @param {PageOptions} pageOptions - The page options object.
     * @returns {Promise<TransactionsPage<TVMTranslateTransaction>>} A promise that resolves to a TransactionsPage instance.
     */
    public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<TVMTranslateTransaction>> {
        return this.getTransactions(chain, walletAddress, pageOptions);
    }
}
