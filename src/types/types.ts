export interface ApiResponse {
    succeeded: boolean;
    response: any;
}

export interface Chain {
    ecosystem: string;
    evmChainId?: number;
    name: string;
}

/**
 * Represents the available options for a page of transactions.
 * 
 * @interface PageOptions
 * 
 * @property startBlock - The starting block number to filter by.
 * @property endBlock - The ending block number to filter by.
 * @property startTimestamp - The starting timestamp for the transaction page in milliseconds.
 * @property endTimestamp - The ending timestamp for the transaction page in milliseconds.
 * @property sort - The sort order for the transaction page. Valid options are 'desc' (descending) or 'asc' (ascending).
 * @property viewAsAccountAddress - The account address to view transactions from.
 * @property liveData - Whether to retrieve live data or paginate through historical data. Defaults to false.
 * @property ignoreTransactions - The transaction used for starting the next page.
 * @property pageNumber - The page number to retrieve. This will not work on EVM chains.
 * @property pagesize - The number of transactions to retrieve per page. Defaults to 10. EVM max size is 50. SVM and UTXO is 100.
 */
export interface PageOptions {
    /**
     * The starting block number to filter by. (Optional)
     */
    startBlock?: number;

    /**
     * The ending block number to filter by. (Optional)
     */
    endBlock?: number;

    /**
     * The starting timestamp for the transaction page in milliseconds. (Optional)
     */
    startTimestamp?: number;

    /**
     * The ending timestamp for the transaction page in milliseconds. (Optional)
     */
    endTimestamp?: number;

    /**
     * The sort order for the transaction page. Valid options are 'desc' (descending) or 'asc' (ascending). (Optional)
     */
    sort?: 'desc' | 'asc';

    /**
     * The account address to view transactions from. (Optional)
     */
    viewAsAccountAddress?: string;

    /**
     * Whether to retrieve live data or paginate through historical data. Defaults to false. (Optional)
     */
    liveData?: boolean;

    /**
     * The transaction used for starting the next page. (Optional)
     */
    ignoreTransactions?: string;

    /**
     * The page number to retrieve. This will not work on EVM chains. (Optional)
     */
    pageNumber?: number;

    /**
     * The number of transactions to retrieve per page. Defaults to 10. (Optional)
     * EVM max size is 50. SVM and UTXO is 100.
     */
    pageSize?: number;
}

export interface Transaction {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: ClassificationData;
    rawTransactionData: RawTransactionData;
}

export interface ClassificationData {
    type: string;
    description: string;
    sent: SentReceived[];
    received: SentReceived[];
}

export interface SentReceived {
    action: string;
    amount: string;
    to: To;
    from: From;
    token?: Token;
    nft?: Nft;
}

export interface Token {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
}

export interface Nft {
    name: string;
    id: number;
    symbol: string;
    address: string;
}

export interface From {
    name: string | null;
    address: string;
}

export interface To {
    name: string | null;
    address: string;
}

export interface RawTransactionData {
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    blockNumber: number;
    gas: number;
    gasPrice: number;
    transactionFee: number;
    timestamp: number;
}

export interface HistoryData {
    transactionHash: string;
    blockNumber: number;
    timestamp: number;
}

export interface DescribeTransaction {
    type: string;
    description: string;
}