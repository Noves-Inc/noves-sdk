# Solana (SVM) Translate API

The Solana Translate API provides functionality to interact with the Solana blockchain.

## API Reference

### getChains()
Returns a list of supported Solana chains with their details.

```typescript
const chains = await translate.getChains();
```

Response format:
```typescript
interface Chain {
  name: string;        // Chain identifier (e.g., "solana")
  ecosystem: string;   // Always "svm"
  nativeCoin: {
    name: string;      // Native coin name (e.g., "SOL")
    symbol: string;    // Native coin symbol
    address: string;   // Native coin address
    decimals: number;  // Number of decimals for the native coin
  };
  tier: number;        // Chain tier level
}
```

### getTransaction(chain: string, signature: string, txTypeVersion?: number)
Get detailed information about a specific transaction. Supports both v4 and v5 formats.

```typescript
// Get transaction in v5 format (default)
const txInfo = await translate.getTransaction('solana', '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq');

// Get transaction in v4 format
const txInfoV4 = await translate.getTransaction('solana', '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq', 4);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana"). Defaults to 'solana'
- `signature` (string): The transaction signature
- `txTypeVersion` (number, optional): The transaction type version to use (4 or 5). Defaults to 5

#### Response Format
The response format differs between v4 and v5:

##### V4 Format
```typescript
interface SVMTransactionV4 {
  txTypeVersion: 4;
  source: {
    type: string;      // Always 'blockchain'
    name: string;      // Always matches the chain name
  };
  timestamp: number;
  classificationData: {
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
```

##### V5 Format
```typescript
interface SVMTransactionV5 {
  txTypeVersion: 5;
  source: {
    type: string | null;  // Can be null in v5
    name: string | null;  // Can be null in v5
  };
  timestamp: number;
  classificationData: {
    type: string;
    description: string | null;  // Additional field in v5
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
  values: any[];  // Additional field in v5
  rawTransactionData: {
    signature: string;
    blockNumber: number;
    signer: string;
    interactedAccounts: string[];
  };
}
```

#### Key Differences
- V4 has non-null `source.type` and `source.name` fields
- V5 includes additional `description` field in `classificationData`
- V5 includes a `values` array for additional transaction data
- V5 allows null values for `source.type` and `source.name`

#### Error Handling
The method will throw a `TransactionError` if:
- The transaction signature is invalid
- The chain is not supported
- The txTypeVersion is not 4 or 5
- The API returns an error response


### getSplTokens(accountAddress: string, chain?: string)
Returns a list of the available SPL token account addresses for the chain and wallet requested.

```typescript
const splTokens = await translate.getSplTokens('updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM');
```

#### Parameters
- `accountAddress` (string): The account address to get SPL token accounts for
- `chain` (string, optional): The chain name. Defaults to 'solana'

#### Response Format
```typescript
interface SPLAccounts {
  accountPubkey: string;  // The original account public key
  tokenAccounts: Array<{
    pubKey: string;  // The public key of the SPL token account
  }>;
}
```

#### Example Response
```json
{
  "accountPubkey": "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM",
  "tokenAccounts": [
    {
      "pubKey": "C8BCfVRxxtgKWY8u7onvHnGJWdjPLDwzeknpw4rbL2sG"
    },
    {
      "pubKey": "EpqqCgziEC8TJnkJTinyFnVjn2MJL3ZDhQHXYDzxJS1"
    }
  ]
}
```

### getTxTypes()
Get a list of all available transaction types that can be returned by the API. This is useful for understanding what types of transactions can be classified.

```typescript
const txTypes = await translate.getTxTypes();
// Returns: {
//   version: number,
//   transactionTypes: [
//     {
//       type: string,
//       description: string
//     },
//     ...
//   ]
// }
```

### describeTransactions(chain: string, signatures: string[], viewAsAccountAddress?: string)
For a list of transactions, returns their descriptions and types. Useful in cases where you need to describe multiple transactions at once.

```typescript
const descriptions = await translate.describeTransactions('solana', [
  '3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq'
], 'optionalViewAsAddress');
```

Response format:
```typescript
interface DescribeTransaction {
  signature: string;
  type: string;
  description: string;
  timestamp: number;
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
}
```

Example response:
```json
{
  "version": 1,
  "transactionTypes": [
    {
      "type": "addLiquidity",
      "description": "The user enters a liquidity pool by adding one or more tokens to the pool."
    },
    {
      "type": "swap",
      "description": "Reported when two or more fungible tokens are traded in the transaction, typically by using a decentralized exchange protocol."
    }
  ]
}
```

### startTransactionJob(chain: string, accountAddress: string, startTimestamp?: number, validateStartTimestamp?: boolean)
Start a transaction job for an account. This method initiates a background job to fetch transactions for the specified account from the given timestamp.

```typescript
const job = await solanaTranslate.startTransactionJob(
  "solana",
  "DhsqSJHKF71vDk4oAQPTpXp9zdjpsHoogupL86sH6R7t",
  0,
  true
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana")
- `accountAddress` (string): The account address to fetch transactions for
- `startTimestamp` (number, optional): The start timestamp for the transaction range (default: 0)
- `validateStartTimestamp` (boolean, optional): Whether to validate the start timestamp (default: true)

#### Response Format
```typescript
interface SVMTransactionJob {
  jobId: string;
  nextPageUrl: string;
  startTimestamp: number;
}
```

#### Example Response
```json
{
  "jobId": "0x041c1db36389ab9bf6ff61354e7e298848a8a014",
  "nextPageUrl": "https://translate.noves.fi/svm/solana/txs/job/0x041c1db36389ab9bf6ff61354e7e298848a8a014?pageNumber=1&pageSize=100&ascending=false",
  "startTimestamp": 0
}
```

### getTransactionJobResults(chain: string, jobId: string, pageOptions?: PageOptions)
Get results from a transaction job. This method retrieves the results of a previously started transaction job.

```typescript
const results = await solanaTranslate.getTransactionJobResults(
  "solana",
  job.jobId,
  { 
    pageSize: 100,
    pageNumber: 1,
    ascending: false
  }
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana")
- `jobId` (string): The job ID returned from startTransactionJob
- `pageOptions` (PageOptions, optional): Pagination options
  - `pageSize` (number): Number of transactions per page (default: 10, maximum: 100)
  - `pageNumber` (number): Page number to fetch (default: 1)
  - `ascending` (boolean): Whether to sort results in ascending order (default: false)

#### Response Format
```typescript
interface SVMTransactionJobResponse {
  items: SVMTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}
```

#### Example Response
```json
{
  "items": [
    {
      "txTypeVersion": 5,
      "source": {
        "type": null,
        "name": null
      },
      "timestamp": 1749128257,
      "classificationData": {
        "description": null,
        "type": "unclassified"
      },
      "transfers": [
        {
          "action": "paidGas",
          "amount": "0.000025",
          "token": {
            "decimals": 9,
            "address": "SOL",
            "name": "SOL",
            "symbol": "SOL",
            "icon": null
          },
          "from": {
            "name": null,
            "address": "CTefbX8zKWx73V4zWUZc32vJMShmnzJfvstZ8aMAo5Q2",
            "owner": {
              "name": null,
              "address": null
            }
          },
          "to": {
            "name": null,
            "address": null,
            "owner": {
              "name": null,
              "address": null
            }
          }
        }
      ],
      "values": [],
      "rawTransactionData": {
        "signature": "5qtJwk8Jk8q47tYjkA2CqcKRntZniW66bffC4GaoqPocde4vdvBabmnVcDGXEKox28JiogVf7KKKbR7qG8p4Xei3",
        "blockNumber": 344785125,
        "signer": "CTefbX8zKWx73V4zWUZc32vJMShmnzJfvstZ8aMAo5Q2",
        "interactedAccounts": [
          "ComputeBudget111111111111111111111111111111",
          "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
          "11111111111111111111111111111111",
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"
        ]
      }
    }
  ],
  "pageSize": 13,
  "hasNextPage": false,
  "nextPageUrl": null
}
```

### deleteTransactionJob(chain: string, jobId: string)
Delete a transaction job. This method deletes a previously started transaction job.

```typescript
const result = await solanaTranslate.deleteTransactionJob(
  "solana",
  job.jobId
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana")
- `jobId` (string): The job ID to delete

#### Response Format
```typescript
interface DeleteTransactionJobResponse {
  message: string;
}
```

#### Example Response
```json
{
  "message": "Job 0x4e42d22bc63048c545169b3ce8ea872f9fc5c95f deleted"
}
```

#### Error Handling
The method will throw a `TransactionError` if:
- The job ID is invalid or not found
- The chain is not supported
- There are validation errors in the request
- The API returns an error response

### getTokenBalances(chain: string, accountAddress: string, includePrices?: boolean, excludeZeroPrices?: boolean)
Get token balances for an account address.

```typescript
// Get all token balances with default parameters
const balances = await translate.getTokenBalances(
  'solana',
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
);

// Get balances with custom parameters
const customBalances = await translate.getTokenBalances(
  'solana',
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  false, // includePrices
  true   // excludeZeroPrices
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana")
- `accountAddress` (string): The account address to get balances for
- `includePrices` (boolean): Whether to include token prices (default: true)
- `excludeZeroPrices` (boolean): Whether to exclude tokens with zero price (default: false)

#### Response Format
```typescript
interface SVMTranslateTokenBalance {
  balance: string;
  usdValue: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    price: string;
  };
}

type SVMTranslateTokenBalancesResponse = SVMTranslateTokenBalance[];
```

#### Example Response
```json
[
  {
    "balance": "0.00114144",
    "usdValue": "0.171773182453313009568",
    "token": {
      "symbol": "SOL",
      "name": "SOL",
      "decimals": 9,
      "address": "SOL",
      "price": "150.4881399401747"
    }
  },
  {
    "balance": "40.450355",
    "usdValue": "40.4493843287059322158505",
    "token": {
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6,
      "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "price": "0.9999760033924531"
    }
  }
]
```

### getTransactionCount(chain: string, accountAddress: string, webhookUrl?: string)
Get the total number of transactions for an account address using a job-based approach.

This method internally creates a transaction count job and then retrieves the results. The API uses a two-step process:
1. Start a transaction count job with the account address
2. Retrieve the job results with the transaction count

```typescript
// Basic usage
const txCount = await translate.getTransactionCount(
  'solana',
  'H6FTjrbVduVKWiMDDiyvyXYacK17apFajQwymchXfyDT'
);

// With optional webhook notification
const txCountWithWebhook = await translate.getTransactionCount(
  'solana',
  'H6FTjrbVduVKWiMDDiyvyXYacK17apFajQwymchXfyDT',
  'https://your-webhook-url.com/notify'
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana"). Defaults to 'solana'
- `accountAddress` (string): The account address to get transaction count for
- `webhookUrl` (string, optional): URL to receive a webhook notification when the job completes

#### Response Format
```typescript
interface SVMTranslateTransactionCountResponse {
  chain: string;
  timestamp: number;
  account: {
    address: string;
    transactionCount: number;
  };
}
```

#### Example Response
```json
{
  "chain": "solana",
  "timestamp": 1749130527,
  "account": {
    "address": "CTefbX8zKWx73V4zWUZc32vJMShmnzJfvstZ8aMAo5Q2",
    "transactionCount": 11
  }
}
```

#### API Implementation Details
The method uses the following endpoints:
- `POST /svm/{chain}/txCount/job/start` - Start the transaction count job
- `GET /svm/{chain}/txCount/job/{jobId}` - Get the job results

#### Error Handling
The method will throw a `TransactionError` if:
- The account address is invalid
- The chain is not supported
- The job start request fails
- The job results request fails
- The response format is invalid

### getStakingTransactions(chain: string, stakingAccount: string, pageOptions?: PageOptions)
Get staking transactions for a staking account.

```typescript
// Get staking transactions with default parameters
const stakingTxs = await translate.getStakingTransactions('solana', '6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E');

// Get staking transactions for specific number of epochs
const stakingTxsWithEpochs = await translate.getStakingTransactions(
  'solana', 
  '6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E',
  { numberOfEpochs: 10 }
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana"). Defaults to 'solana'
- `stakingAccount` (string): The staking account address
- `pageOptions` (PageOptions, optional): Pagination options including:
  - `numberOfEpochs` (number, optional): Number of epochs to retrieve staking transactions for

#### Response Format
```typescript
interface SVMStakingTransactionsResponse {
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
  failedEpochs: any[];
  nextPageUrl: string | null;
}
```

#### Example Response
```json
{
  "items": [
    {
      "txTypeVersion": 5,
      "source": {
        "type": null,
        "name": null
      },
      "timestamp": 1748939361,
      "classificationData": {
        "description": "Received 0.003404242 SOL in staking rewards.",
        "type": "syntheticStakingRewards"
      },
      "transfers": [
        {
          "action": "rewarded",
          "amount": "0.003404242",
          "token": {
            "decimals": 9,
            "address": "SOL",
            "name": "SOL",
            "symbol": "SOL",
            "icon": null
          },
          "from": {
            "name": "Staking",
            "address": null,
            "owner": {
              "name": null,
              "address": null
            }
          },
          "to": {
            "name": null,
            "address": "6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E",
            "owner": {
              "name": null,
              "address": null
            }
          }
        }
      ],
      "values": [
        {
          "key": "epoch",
          "value": "796"
        }
      ],
      "rawTransactionData": {
        "signature": "staking-synth-0a7ca482138b5ffda2ab5d6852e73827",
        "blockNumber": 344304251,
        "signer": "",
        "interactedAccounts": null
      }
    }
  ],
  "numberOfEpochs": 10,
  "failedEpochs": [],
  "nextPageUrl": null
}
```

### getStakingEpoch(chain: string, stakingAccount: string, epoch: number)
Get staking information for a specific epoch. Returns a transaction structure representing the synthetic staking reward for that epoch.

```typescript
const stakingEpoch = await translate.getStakingEpoch('solana', '6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E', 777);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana"). Defaults to 'solana'
- `stakingAccount` (string): The staking account address
- `epoch` (number): The epoch number to get information for

#### Response Format
```typescript
interface SVMStakingEpochResponse {
  txTypeVersion: 5;
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
}
```

#### Example Response
```json
{
  "txTypeVersion": 5,
  "source": {
    "type": null,
    "name": null
  },
  "timestamp": 1745699126,
  "classificationData": {
    "description": "Received 0.003495653 SOL in staking rewards.",
    "type": "syntheticStakingRewards"
  },
  "transfers": [
    {
      "action": "rewarded",
      "amount": "0.003495653",
      "token": {
        "decimals": 9,
        "address": "SOL",
        "name": "SOL",
        "symbol": "SOL",
        "icon": null
      },
      "from": {
        "name": "Staking",
        "address": null,
        "owner": {
          "name": null,
          "address": null
        }
      },
      "to": {
        "name": null,
        "address": "6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E",
        "owner": {
          "name": null,
          "address": null
        }
      }
    }
  ],
  "values": [
    {
      "key": "epoch",
      "value": "777"
    }
  ],
  "rawTransactionData": {
    "signature": "staking-synth-bcd7058d75f7f6d4d41936bf8f56362d",
    "blockNumber": 336096135,
    "signer": "",
    "interactedAccounts": null
  }
}
```

### getTransactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get a pagination object to iterate over transactions pages.

```typescript
const transactionsPage = await translate.getTransactions(
  "solana",
  "EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho",
  { 
    pageSize: 10,
    v5Format: true,
    sort: 'desc'
  }
);

// Get current page of transactions
const transactions = transactionsPage.getTransactions();
console.log("Transactions:", transactions);
console.log("Has next page:", !!transactionsPage.getNextPageKeys());

// Navigate through pages
if (transactionsPage.getNextPageKeys()) {
  await transactionsPage.next();
  console.log("Next page:", transactionsPage.getTransactions());
}

// Go back to previous page
if (transactionsPage.hasPrevious()) {
  await transactionsPage.previous();
  console.log("Previous page:", transactionsPage.getTransactions());
}

// Iterate through all transactions using async iterator
for await (const tx of transactionsPage) {
  console.log("Transaction:", tx);
}
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana")
- `accountAddress` (string): The account address to get transactions for
- `pageOptions` (PageOptions, optional): Pagination and filtering options
  - `pageSize` (number): Number of transactions per page (default: 10)
  - `v5Format` (boolean): Whether to use v5 format (default: true)
  - `sort` (string): Sort order ('asc' or 'desc', default: 'desc')

The method returns a `TransactionsPage` object with the following methods:

#### Simple Pagination Methods
- `getTransactions()`: Get current page of transactions
- `getNextPageKeys()`: Get next page keys if available
- `next()`: Fetch next page of transactions
- `previous()`: Go back to previous page of transactions
- `hasPrevious()`: Check if there's a previous page available
- `[Symbol.asyncIterator]()`: Async iterator for all transactions

#### Cursor-Based Pagination Methods
- `getCursorInfo()`: Get cursor information for external pagination systems
- `getNextCursor()`: Get next page cursor as Base64 encoded string
- `getPreviousCursor()`: Get previous page cursor as Base64 encoded string
- `TransactionsPage.fromCursor()`: Static method to create a page from cursor string
- `TransactionsPage.decodeCursor()`: Static method to decode cursor to page options

### Advanced Cursor-Based Pagination

For applications that need external cursor control (similar to GraphQL-style pagination), you can use the cursor-based pagination methods:

```typescript
// Get initial page
const transactionsPage = await translate.getTransactions("solana", "EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho", {
  pageSize: 10
});

// Get cursor information for external systems
const cursorInfo = transactionsPage.getCursorInfo();
console.log("Cursor Info:", cursorInfo);
// Output: {
//   hasNextPage: true,
//   hasPreviousPage: false,
//   nextCursor: "eyJwYWdlU2l6ZSI6MTAsInBhZ2luYXRpb25LZXkiOiJzb21lLWtleSJ9",
//   previousCursor: null
// }

// Store cursors for external use
const nextCursor = transactionsPage.getNextCursor();
const previousCursor = transactionsPage.getPreviousCursor();

// Later, create a new page from a cursor
if (nextCursor) {
  const nextPage = await TransactionsPage.fromCursor(
    translate,
    "solana",
    "EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho",
    nextCursor
  );
  console.log("Next page transactions:", nextPage.getTransactions());
}

// Decode cursor to see page options (useful for debugging)
if (nextCursor) {
  const pageOptions = TransactionsPage.decodeCursor(nextCursor);
  console.log("Decoded cursor:", pageOptions);
}
```

#### Cursor Information Interface
```typescript
interface CursorInfo {
  hasNextPage: boolean;      // True if there's a next page available
  hasPreviousPage: boolean;  // True if there's a previous page available
  nextCursor: string | null; // Base64 encoded cursor for next page
  previousCursor: string | null; // Base64 encoded cursor for previous page
}
```

#### Building Custom Pagination Interfaces

You can use the cursor methods to build GraphQL-style pagination interfaces:

```typescript
// Example: Building a custom pagination response
async function getTransactionsWithCustomPagination(
  chain: string, 
  address: string, 
  cursor?: string, 
  pageSize: number = 10
) {
  let transactionsPage;
  
  if (cursor) {
    // Resume from cursor
    transactionsPage = await TransactionsPage.fromCursor(
      translate, 
      chain, 
      address, 
      cursor
    );
  } else {
    // Start from beginning
    transactionsPage = await translate.getTransactions(chain, address, {
      pageSize
    });
  }
  
  const cursorInfo = transactionsPage.getCursorInfo();
  
  return {
    transactions: transactionsPage.getTransactions(),
    pageInfo: {
      hasNextPage: cursorInfo.hasNextPage,
      hasPreviousPage: cursorInfo.hasPreviousPage,
      startCursor: cursor || null,
      endCursor: cursorInfo.nextCursor
    }
  };
}
```

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions) [DEPRECATED]
**⚠️ Deprecated:** Use `getTransactions()` instead. This method will be removed in a future version.

Get paginated transactions for an account. This method is maintained for backward compatibility.

```typescript
const transactions = await translate.Transactions(
  "solana",
  "EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho",
  { pageSize: 10 }
);
```

## Error Handling

The API uses the following error types:

- `ChainNotFoundError`: Thrown when a requested chain is not supported
- `TransactionError`: Thrown for transaction-related errors

## Example Usage

```typescript
import { Translate } from '@noves/sdk';

// Initialize the Solana translator
const translate = Translate.svm('your-api-key');

// Get all supported chains
const chains = await translate.getChains();
console.log("Supported chains:", chains);

// Get transaction types
const txTypes = await translate.getTxTypes();
console.log("Transaction types:", txTypes);

// Get transactions for an account
const accountAddress = "EJCRQ6mtVrvsceBMNdYC7qqXRwrj79KJQoKC5tDWHdho";
const transactionsPage = await translate.getTransactions(
  "solana",
  accountAddress,
  { pageSize: 10 }
);

// Process current page of transactions
console.log("Current transactions:", transactionsPage.getTransactions());

// Navigate through pages if needed
if (transactionsPage.getNextPageKeys()) {
  await transactionsPage.next();
  console.log("Next page transactions:", transactionsPage.getTransactions());
}

// Process all transactions using async iterator
for await (const tx of transactionsPage) {
  console.log("Transaction:", tx);
}

// Get specific transaction details
const txSignature = "3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq";
const txInfo = await translate.getTransaction("solana", txSignature);
console.log("Transaction info:", txInfo);
``` 