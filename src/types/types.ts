export interface ApiResponse {
    succeeded: boolean;
    response: any;
}

export interface Chain {
    ecosystem: string;
    evmChainId?: number;
    name: string;
    nativeCoin?: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
    };
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
 * @property format - The response format version to use. Valid options are 'v4', 'v5'. Defaults to 'v4'.
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

    /**
     * Whether to view transactions as the sender. (Optional)
     */
    viewAsTransactionSender?: boolean;

    /**
     * The page number to retrieve. This will not work on EVM chains. (Optional)
     */
    page?: number;

    /**
     * Whether to include token prices in the response. (Optional)
     */
    includePrices?: boolean;

    /**
     * Whether to exclude tokens with zero prices. (Optional)
     */
    excludeZeroPrices?: boolean;

    /**
     * Whether to use v5 format for transaction responses. (Optional)
     * Only applicable for EVM chains. Defaults to false (v2 format).
     */
    v5Format?: boolean;
}

export interface Transaction {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: {
        type: string;
        source: {
            type: string | null;
        };
        description: string;
        protocol: Record<string, any>;
        sent: any[];
        received: any[];
    };
    rawTransactionData: {
        transactionHash: string;
        fromAddress: string;
        toAddress: string;
        blockNumber: number;
        gas: number;
        gasUsed: number;
        gasPrice: number;
        transactionFee: number;
        timestamp: number;
    };
}

export interface ClassificationData {
    type: string;
    source: {
        type: string;
    };
    description: string;
    protocol: {
        name: string | null;
    };
    sent: Array<{
        action: string;
        from: {
            name: string | null;
            address: string;
        };
        to: {
            name: string | null;
            address: string;
        };
        amount: string;
        token: {
            symbol: string;
            name: string;
            decimals: number;
            address: string;
        };
    }>;
    received: Array<{
        action: string;
        from: {
            name: string | null;
            address: string;
        };
        to: {
            name: string | null;
            address: string;
        };
        amount: string;
        token: {
            symbol: string;
            name: string;
            decimals: number;
            address: string;
        };
    }>;
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
    price?: string | null;
    icon?: string | null;
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
    blockNumber: string;
    timestamp: number;
}

export interface DescribeTransaction {
    type: string;
    description: string;
}

export interface BalancesData {
    balance: string;
    usdValue?: string | null;
    token: Token;
}

export interface BalancesResponse extends Array<BalancesData> {}

/**
 * The unsigned transaction object, modeled after the standard format used by multiple EVM wallets.
 * 
 * @interface UnsignedTransaction
 * 
 */
export interface UnsignedTransaction {
    from: string | null;
    to: string | null;
    data: string | null;
    value: string | null;
    gas: string | null;
    gasPrice: string | null;
    maxFeePerGas: string | null;
    maxPriorityFeePerGas: string | null;
    type: string | null;
}

export interface StateDiff {
    [key: string]: string;
}

export interface StateOverrides {
    [key: string]: {
        stateDiff: StateDiff;
    };
}

export interface UserOperation {
    sender: string | null;
    nonce: number;
    initCode: string | null;
    callData: string | null;
    callGasLimit: number;
    verificationGasLimit: number;
    preVerificationGas: number;
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
    paymasterAndData: string | null;
    signature: string | null;
}

export interface Pricing {
    chain: string;
    block: string;
    token: {
        address: string | null;
        symbol: string | null;
        name: string | null;
    };
    price: {
        amount: string | null;
        currency: string | null;
        status: string | null;
    };
    pricedBy: {
        poolAddress: string;
        exchange: {
            name: string;
        };
        liquidity: number;
        baseToken: {
            address: string;
            symbol: string;
            name: string;
        };
    } | string | null;
    priceType: string | null;
    priceStatus: string | null;
}

export interface PoolPricing {
    chain: string | null;
    exchange: {
        name: string | null;
    };
    poolAddress: string | null;
    baseToken: {
        address: string | null;
        symbol: string | null;
        name: string | null;
        decimals: number | null;
    };
    quoteToken: {
        address: string | null;
        symbol: string | null;
        name: string | null;
        decimals: number | null;
    };
    price: {
        amount: string | null;
    };
}

/**
 * Represents a transaction type definition from the API
 */
export interface TransactionTypes {
  type: string;
  description: string;
}

/**
 * Interface representing a Cosmos token balance
 */
export interface CosmosTokenBalance {
  balance: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    icon: string | null;
  };
}

/**
 * Interface representing a Cosmos balances response
 */
export interface CosmosBalancesResponse extends Array<CosmosTokenBalance> {}

/**
 * Interface representing a Cosmos transaction job
 */
export interface CosmosTransactionJob {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  pageId?: string;
}

/**
 * Interface representing a Cosmos transaction job response
 */
export interface CosmosTransactionJobResponse {
  items: Transaction[];
  hasNextPage: boolean;
  nextPageUrl?: string;
}

/**
 * Represents a transaction job in the EVM ecosystem.
 */
export interface EVMTransactionJob {
  jobId: string;
  nextPageUrl: string;
}

/**
 * Represents a transaction job response in the EVM ecosystem.
 */
export interface EVMTransactionJobResponse {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  results?: {
    transactions: Transaction[];
    totalCount: number;
  };
  error?: string;
}

/**
 * Represents a response from deleting a transaction job.
 */
export interface DeleteTransactionJobResponse {
  message: string;
}

export interface TokenHolder {
  address: string;
  balance: string;
  share: number;
}

/**
 * Represents a token transfer in the EVM ecosystem.
 */
export interface TokenTransfer {
  token: Token;
  from: string;
  to: string;
  value: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: number;
}

/**
 * Interface representing a SVM token balance
 */
export interface SVMTokenBalance {
  balance: string;
  usdValue: string | null;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    price: string | null;
  };
}

/**
 * Interface representing the transaction count response
 */
export interface TransactionCountResponse {
  chain: string;
  timestamp: number;
  account: {
    address: string;
    transactionCount: number;
  };
}

/**
 * Interface representing SVM staking transactions response
 */
export interface SVMStakingTransactionsResponse {
  items: Array<{
    txTypeVersion: number;
    source: {
      type: string | null;
      name: string | null;
    };
    timestamp: number;
    classificationData: {
      description: string;
      type: string;
    };
    transfers: Array<{
      action: string;
      amount: string;
      token: {
        decimals: number;
        address: string;
        name: string;
        symbol: string;
        icon: string | null;
      };
      from: {
        name: string | null;
        address: string | null;
        owner: {
          name: string | null;
          address: string | null;
        };
      };
      to: {
        name: string | null;
        address: string | null;
        owner: {
          name: string | null;
          address: string | null;
        };
      };
    }>;
    values: Array<{
      key: string;
      value: string;
    }>;
    rawTransactionData: {
      signature: string;
      blockNumber: number;
      signer: string;
      interactedAccounts: string[] | null;
    };
  }>;
  numberOfEpochs: number;
  failedEpochs: string[];
  nextPageUrl: string | null;
}

/**
 * Interface representing SVM staking epoch response
 */
export interface SVMStakingEpochResponse {
  epoch: number;
  stakingAccount: string;
  stakedAmount: string;
  rewards: string;
  startTimestamp: number;
  endTimestamp: number;
  status: 'active' | 'completed';
  validator: {
    address: string;
    name: string | null;
  };
}

export interface SolanaTransaction {
  txTypeVersion: number;
  source: {
    type: string | null;
    name: string | null;
  };
  timestamp: number;
  classificationData: {
    type: string;
    description: string | null;
  };
  transfers: Array<{
    action: string;
    amount: string;
    token: {
      decimals: number;
      address: string;
      name: string;
      symbol: string;
      icon: string | null;
    };
    from: {
      name: string | null;
      address: string;
      owner: {
        name: string | null;
        address: string | null;
      };
    };
    to: {
      name: string | null;
      address: string | null;
      owner: {
        name: string | null;
        address: string | null;
      };
    };
  }>;
  rawTransactionData: {
    signature: string;
    blockNumber: number;
    signer: string;
    interactedAccounts: string[];
  };
}

export interface TransactionStatus {
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: number;
}

export interface RawTransactionResponse {
    network: string;
    rawTx: {
        transactionHash: string;
        hash: string;
        blockNumber: number;
        from: string;
        to: string;
        gas: number;
        gasPrice: number;
        value: number;
        timestamp: number;
        gasUsed: number;
        transactionFee: number;
    };
    rawTraces: Array<{
        action: {
            from: string;
            callType: string;
            gas: string;
            input: string;
            to: string;
            value: string;
        };
        blockHash: string;
        blockNumber: number;
        result: {
            gasUsed: string;
            output: string;
        };
        subtraces: number;
        traceAddress: number[];
        transactionHash: string;
        transactionPosition: number;
        type: string;
    }>;
    eventLogs: Array<{
        decodedName: string;
        decodedSignature: string;
        logIndex: number;
        address: string;
        params: Array<{
            name: string;
            type: string;
            value: number;
        }>;
        raw: {
            eventSignature: string;
            topics: string[];
            data: string;
        };
    }>;
    internalTxs: any[];
    txReceipt: {
        blockNumber: number;
        blockHash: string;
        status: number;
        effectiveGasPrice: number;
        gasUsed: number;
        cumulativeGasUsed: number;
    };
    decodedInput: Record<string, any>;
}

/**
 * Interface representing a TVM transaction
 */
export interface TVMTransaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string;
  classificationData: {
    type: string;
    source: {
      type: string;
    };
    description: string;
    protocol: {
      name: string | null;
    };
    sent: Array<{
      action: string;
      from: {
        name: string | null;
        address: string;
      };
      to: {
        name: string | null;
        address: string;
      };
      amount: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
    }>;
    received: Array<{
      action: string;
      from: {
        name: string | null;
        address: string;
      };
      to: {
        name: string | null;
        address: string;
      };
      amount: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
    }>;
  };
  rawTransactionData: {
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    blockNumber: number;
    gas: number;
    gasUsed: number;
    gasPrice: number;
    transactionFee: {
      amount: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
    };
    timestamp: number;
  };
}

/**
 * Interface representing a TVM balances job
 */
export interface TVMBalancesJob {
  jobId: string;
  resultUrl: string;
}

/**
 * Interface representing a TVM balances job response
 */
export interface TVMBalancesJobResponse {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  results?: {
    balances: Array<{
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
      balance: string;
    }>;
  };
  error?: string;
}

/**
 * Represents a Polkadot transaction response from the Translate API.
 */
export interface PolkadotTransaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string | null;
  block: number;
  index: number;
  classificationData: {
    type: string;
    description: string;
  };
  transfers: Array<{
    action: string;
    from: {
      name: string | null;
      address: string;
      owner: {
        name: string | null;
        address: string | null;
      };
    };
    to: {
      name: string | null;
      address: string | null;
      owner: {
        name: string | null;
        address: string | null;
      };
    };
    amount: string;
    asset: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }>;
  values: Array<{
    key: string;
    value: string;
  }>;
  rawTransactionData: {
    extrinsicIndex: number;
    blockNumber: number;
    timestamp: number;
    from: {
      name: string | null;
      address: string;
      owner: {
        name: string | null;
        address: string | null;
      };
    };
    to: {
      name: string | null;
      address: string | null;
      owner: {
        name: string | null;
        address: string | null;
      };
    };
  };
}

/**
 * Interface representing Polkadot staking rewards response
 */
export interface PolkadotStakingRewardsResponse {
  items: Array<{
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    block: number;
    index: number;
    classificationData: {
      type: string;
      description: string;
    };
    transfers: Array<{
      action: string;
      from: {
        name: string | null;
        address: string;
        owner: {
          name: string | null;
          address: string | null;
        };
      };
      to: {
        name: string | null;
        address: string | null;
        owner: {
          name: string | null;
          address: string | null;
        };
      };
      amount: string;
      asset: {
        name: string;
        symbol: string;
        decimals: number;
      };
    }>;
    values: Array<{
      key: string;
      value: string;
    }>;
    rawTransactionData: {
      extrinsicIndex: number;
      blockNumber: number;
      timestamp: number;
      from: {
        name: string | null;
        address: string;
        owner: {
          name: string | null;
          address: string | null;
        };
      };
      to: {
        name: string | null;
        address: string | null;
        owner: {
          name: string | null;
          address: string | null;
        };
      };
    };
  }>;
  nextPageSettings: {
    hasNextPage: boolean;
    endTimestamp: number | null;
    nextPageUrl: string | null;
  };
}

/**
 * Interface representing SVM balances response
 */
export interface SVMBalancesResponse extends Array<SVMTokenBalance> {}