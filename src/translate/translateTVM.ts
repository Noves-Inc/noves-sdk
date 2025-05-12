import { Chain, PageOptions, Transaction, DescribeTransaction, TransactionStatus, RawTransactionResponse, TVMTransaction, TVMBalancesJob, TVMBalancesJobResponse } from '../types/types';
import { TransactionsPage } from './transactionsPage';
import { ChainNotFoundError } from '../errors/ChainNotFoundError';
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
        super(apiKey, ECOSYSTEM);
    }

    /**
     * Returns a list with the names of the TVM blockchains currently supported by this API. 
     * Use the provided chain name when calling other methods.
     * @returns {Promise<Chain[]>} A promise that resolves to an array of chains.
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
     * @returns {Promise<Chain>} A promise that resolves to the chain object or undefined if not found.
     * @throws {ChainNotFoundError} Will throw an error if the chain is not found.
     */
    public async getChain(name: string): Promise<Chain> {
        try {
            const chains = await this.getChains();
            const chain = chains.find((chain: Chain) => chain.name.toLowerCase() === name.toLowerCase());
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
     * @param {string} txHash - The transaction hash.
     * @returns {Promise<Transaction>} A promise that resolves to the transaction details.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransaction(chain: string, txHash: string): Promise<Transaction> {
        try {
            const result = await this.makeRequest(`${chain}/tx/${txHash}`);
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
     * @returns {Promise<TransactionsPage<TVMTransaction>>} A promise that resolves to a TransactionsPage instance.
     */
    public async Transactions(chain: string, walletAddress: string, pageOptions: PageOptions = {}): Promise<TransactionsPage<TVMTransaction>> {
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
     * For any given transaction, it returns only the description and the type.
     * Useful in cases where you're pulling a large number of transactions but only need this data for purposes of displaying on a UI or similar.
     * @param {string} chain - The chain name.
     * @param {string} txHash - The transaction hash.
     * @param {string} viewAsAccountAddress - OPTIONAL - Results are returned with the view/perspective of this wallet address.
     * @returns {Promise<DescribeTransaction>} A promise that resolves to the transaction description.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async describeTransaction(chain: string, txHash: string, viewAsAccountAddress?: string): Promise<DescribeTransaction> {
        try {
            let endpoint = `${chain}/describeTx/${txHash}`;
            if (viewAsAccountAddress) {
                endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
            }
            const result = await this.makeRequest(endpoint);
            if (!this.validateResponse(result, ['description', 'type'])) {
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
     * For a list of transactions, returns their descriptions and types.
     * Useful in cases where you need to describe multiple transactions at once.
     * @param {string} chain - The chain name.
     * @param {string[]} txHashes - Array of transaction hashes.
     * @param {string} viewAsAccountAddress - OPTIONAL - Results are returned with the view/perspective of this wallet address.
     * @returns {Promise<DescribeTransaction[]>} A promise that resolves to an array of transaction descriptions.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async describeTransactions(chain: string, txHashes: string[], viewAsAccountAddress?: string): Promise<DescribeTransaction[]> {
        try {
            let endpoint = `${chain}/describeTxs`;
            if (viewAsAccountAddress) {
                endpoint += `?viewAsAccountAddress=${encodeURIComponent(viewAsAccountAddress)}`;
            }
            const result = await this.makeRequest(endpoint, 'POST', {
                body: JSON.stringify({ txHashes })
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

    /**
     * Get the status of a specific transaction.
     * @param {string} chain - The chain name.
     * @param {string} txHash - The transaction hash.
     * @returns {Promise<TransactionStatus>} A promise that resolves to the transaction status.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getTransactionStatus(chain: string, txHash: string): Promise<TransactionStatus> {
        try {
            const result = await this.makeRequest(`${chain}/tx/${txHash}/status`);
            return result;
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
     * Get raw transaction data including traces, event logs, and internal transactions.
     * @param {string} chain - The chain name.
     * @param {string} txHash - The transaction hash.
     * @returns {Promise<RawTransactionResponse>} A promise that resolves to the raw transaction data.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getRawTransaction(chain: string, txHash: string): Promise<RawTransactionResponse> {
        try {
            const result = await this.makeRequest(`${chain}/raw/tx/${txHash}`);
            if (!this.validateResponse(result, ['network', 'rawTx', 'rawTraces'])) {
                throw new TransactionError({ message: ['Invalid response format'] });
            }
            return result;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get raw transaction'] });
        }
    }

    /**
     * Start a balances job for the given chain, account address, and token address.
     * @param {string} chain - The chain name.
     * @param {string} accountAddress - The account address.
     * @param {string} tokenAddress - The token address.
     * @param {number} blockNumber - The block number.
     * @returns {Promise<TVMBalancesJob>} A promise that resolves to the balances job.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async startBalancesJob(
        chain: string,
        accountAddress: string,
        tokenAddress: string,
        blockNumber: number
    ): Promise<TVMBalancesJob> {
        try {
            const queryParams = new URLSearchParams({
                accountAddress,
                tokenAddress,
                blockNumber: blockNumber.toString()
            });
            const result = await this.makeRequest(`${chain}/balances/job/start?${queryParams.toString()}`, 'POST');
            return result;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to start balances job'] });
        }
    }

    /**
     * Get the results of a balances job.
     * @param {string} chain - The chain name.
     * @param {string} jobId - The job ID from the balances job.
     * @returns {Promise<TVMBalancesJobResponse>} A promise that resolves to the balances job results.
     * @throws {TransactionError} If there are validation errors in the request.
     */
    public async getBalancesJobResults(
        chain: string,
        jobId: string
    ): Promise<TVMBalancesJobResponse> {
        try {
            const result = await this.makeRequest(`${chain}/balances/job/${jobId}`);
            return result;
        } catch (error) {
            if (error instanceof TransactionError) {
                throw error;
            }
            throw new TransactionError({ message: ['Failed to get balances job results'] });
        }
    }
}
