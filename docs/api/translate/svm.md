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

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get a paginated list of transactions for an account address using the v5 endpoint.

```typescript
const transactions = await translate.Transactions(
  "solana",
  "2w31NPGGZ7U2MCd3igujKeG7hggYNzsvknNeotQYJ1FF",
  { pageSize: 10 }
);

// Process transactions
for await (const tx of transactions) {
  console.log("Transaction:", tx);
}
```

Response format:
```typescript
interface SolanaTransaction {
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
```

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
//   transactionTypes: [
//     {
//       type: string,
//       description: string
//     },
//     ...
//   ],
//   version: number
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
  "transactionTypes": [
    {
      "type": "addLiquidity",
      "description": "The user enters a liquidity pool by adding one or more tokens to the pool."
    },
    {
      "type": "swap",
      "description": "Reported when two or more fungible tokens are traded in the transaction, typically by using a decentralized exchange protocol."
    }
  ],
  "version": 1
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
interface EVMTransactionJob {
  jobId: string;
  nextPageUrl: string;
}
```

#### Example Response
```json
{
  "jobId": "0x4e42d22bc63048c545169b3ce8ea872f9fc5c95f",
  "nextPageUrl": "https://translate.noves.fi/svm/solana/txs/job/0x4e42d22bc63048c545169b3ce8ea872f9fc5c95f?pageNumber=1&pageSize=100&ascending=false"
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
interface EVMTransactionJobResponse {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  results?: {
    transactions: Transaction[];
    totalCount: number;
  };
  error?: string;
}
```

#### Example Response
```json
{
  "jobId": "0x4e42d22bc63048c545169b3ce8ea872f9fc5c95f",
  "status": "completed",
  "results": {
    "transactions": [
      {
        "txTypeVersion": 1,
        "chain": "solana",
        "accountAddress": "DhsqSJHKF71vDk4oAQPTpXp9zdjpsHoogupL86sH6R7t",
        "classificationData": {
          "type": "transfer",
          "description": "Transfer of SOL"
        },
        "rawTransactionData": {
          "signature": "3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq",
          "timestamp": 1722892419
        }
      }
    ],
    "totalCount": 1
  }
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
interface SVMTokenBalance {
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
```

#### Example Response
```json
[
  {
    "balance": "0.00114144",
    "usdValue": "0.194717744328279489504",
    "token": {
      "symbol": "SOL",
      "name": "SOL",
      "decimals": 9,
      "address": "SOL",
      "price": "170.5895573383441"
    }
  }
]
```

### getTransactionCount(chain: string, accountAddress: string)
Get the total number of transactions for an account address.

```typescript
const txCount = await translate.getTransactionCount(
  'solana',
  'H6FTjrbVduVKWiMDDiyvyXYacK17apFajQwymchXfyDT'
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana"). Defaults to 'solana'
- `accountAddress` (string): The account address to get transaction count for

#### Response Format
```typescript
interface TransactionCountResponse {
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
  "timestamp": 1746811093,
  "account": {
    "address": "H6FTjrbVduVKWiMDDiyvyXYacK17apFajQwymchXfyDT",
    "transactionCount": 4130239
  }
}
```

### getStakingTransactions(chain: string, stakingAccount: string, pageOptions?: PageOptions)
Get staking transactions for a staking account.

```typescript
const stakingTxs = await translate.getStakingTransactions('solana', '6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E');
```

Response format:
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
  failedEpochs: string[];
  nextPageUrl: string | null;
}
```

### getStakingEpoch(chain: string, stakingAccount: string, epoch: number)
Get staking information for a specific epoch.

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
```

#### Example Response
```json
{
  "epoch": 777,
  "stakingAccount": "6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E",
  "stakedAmount": "1000000000",
  "rewards": "50000000",
  "startTimestamp": 1746811093,
  "endTimestamp": 1746814093,
  "status": "completed",
  "validator": {
    "address": "validator123",
    "name": "Example Validator"
  }
}
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
const transactions = await translate.Transactions(
  "solana",
  accountAddress,
  { pageSize: 10 }
);

// Process transactions
for await (const tx of transactions) {
  console.log("Transaction:", tx);
}

// Get specific transaction details
const txSignature = "3dAzEfwuZQvykPFqXt7U2bCdpfFrMQ7mR45D2t3ggkvBW88Cm4s35Wxpop831pygvYPA54Ht3i1Ufu3FTtM6ocdq";
const txInfo = await translate.getTransaction("solana", txSignature);
console.log("Transaction info:", txInfo);
``` 