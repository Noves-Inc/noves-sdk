# EVM Translate API

The EVM Translate API provides functionality to interact with Ethereum Virtual Machine (EVM) based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize the EVM translator
const evmTranslate = Translate.evm("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported EVM chains.

```typescript
const chains = await evmTranslate.getChains();
// Returns: [{ name: "eth", ecosystem: "evm" }, ...]
```

### getChain(name: string)
Get detailed information about a specific chain.

```typescript
const chainInfo = await evmTranslate.getChain("eth");
```

### getTransaction(chain: string, txHash: string, v5Format?: boolean)
Get detailed information about a specific transaction.

```typescript
// Get transaction in default format
const txInfo = await evmTranslate.getTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);

// Get transaction in v5 format
const txInfoV5 = await evmTranslate.getTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22",
  true
);
```

### describeTransaction(chain: string, txHash: string, viewAsAccountAddress?: string)
Get a simplified description of a transaction.

```typescript
const txDescription = await evmTranslate.describeTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22",
  "0x123..." // Optional: view transaction from this address's perspective
);
```

### describeTransactions(chain: string, txHashes: string[], viewAsAccountAddress?: string)
Get simplified descriptions for multiple transactions at once.

```typescript
const txDescriptions = await evmTranslate.describeTransactions(
  "eth",
  [
    "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22",
    "0x2cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa23"
  ],
  "0x123..." // Optional: view transactions from this address's perspective
);
```

#### Response Format
```typescript
interface DescribeTransaction {
  type: string;
  description: string;
}
```

### getTokenBalances(chain: string, accountAddress: string, tokens?: string[], block?: number, includePrices?: boolean, excludeZeroPrices?: boolean, excludeSpam?: boolean)
Get token balances for an account address. Optionally filter by specific tokens and/or block number.

```typescript
// Get all token balances
const balances = await evmTranslate.getTokenBalances(
  "eth",
  "0x123..."
);

// Get balances for specific tokens
const specificBalances = await evmTranslate.getTokenBalances(
  "eth",
  "0x123...",
  ["0xabc...", "0xdef..."]
);

// Get balances at a specific block
const historicalBalances = await evmTranslate.getTokenBalances(
  "eth",
  "0x123...",
  undefined,
  12345678
);

// Get balances with custom parameters
const customBalances = await evmTranslate.getTokenBalances(
  "eth",
  "0x123...",
  undefined,
  undefined,
  true,  // includePrices
  false, // excludeZeroPrices
  true   // excludeSpam
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth", "bsc")
- `accountAddress` (string): The account address to get balances for
- `tokens` (string[]): Optional array of token addresses to filter balances
- `block` (number): Optional block number to get historical balances
- `includePrices` (boolean): Whether to include token prices (default: true)
- `excludeZeroPrices` (boolean): Whether to exclude tokens with zero price (default: false)
- `excludeSpam` (boolean): Whether to exclude spam tokens (default: true)

### BalancesData
```typescript
interface BalancesData {
  balance: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    price?: string | null;
  };
}
```

### getNativeBalance(chain: string, accountAddress: string)
Get the native token balance of an account.

```typescript
const nativeBalance = await evmTranslate.getNativeBalance(
  "eth",
  "0x123..."
);
```

### getBlock(chain: string, blockNumber: number)
Get information about a specific block.

```typescript
const blockInfo = await evmTranslate.getBlock("eth", 12345678);
```

### getBlockTransactions(chain: string, blockNumber: number, pageOptions?: PageOptions)
Get transactions in a specific block with pagination.

```typescript
const blockTxs = await evmTranslate.getBlockTransactions(
  "eth",
  12345678,
  { pageSize: 10 }
);
```

### getTokenInfo(chain: string, tokenAddress: string)
Get information about a specific token.

```typescript
const tokenInfo = await evmTranslate.getTokenInfo(
  "eth",
  "0x123..."
);
```

### getTokenHolders(chain: string, tokenAddress: string, pageOptions?: PageOptions)
Get holders of a specific token with pagination.

```typescript
const holders = await evmTranslate.getTokenHolders(
  "eth",
  "0x123...",
  { pageSize: 10 }
);
```

### Transactions(chain: string, walletAddress: string, pageOptions?: PageOptions)
Get paginated transactions for an account.

```typescript
const transactions = await evmTranslate.Transactions(
  "eth",
  "0x123...",
  { 
    pageSize: 10,
    startBlock: 14637919,
    endBlock: 15289488,
    sort: 'desc',
    liveData: false,
    viewAsTransactionSender: false
  }
);

// Iterate through transactions
for await (const tx of transactions) {
  console.log(tx);
}
```

#### Query Parameters
- `pageSize` (number): Number of transactions per page (default: 10)
- `startBlock` (number): Start block number for filtering transactions
- `endBlock` (number): End block number for filtering transactions
- `sort` (string): Sort order ('asc' or 'desc', default: 'desc')
- `liveData` (boolean): Whether to include live data (default: false)
- `viewAsTransactionSender` (boolean): Whether to view transactions as sender (default: false)

#### Response Format
```typescript
interface Transaction {
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
```

### History(chain: string, walletAddress: string, pageOptions?: PageOptions)
Get transaction history for an account.

```typescript
const history = await evmTranslate.History(
  "eth",
  "0x123...",
  { 
    pageSize: 100, // Maximum allowed page size
    startBlock: 14637919,
    endBlock: 15289488,
    sort: 'desc',
    liveData: false,
    viewAsTransactionSender: false
  }
);

// Iterate through history items
for await (const item of history) {
  console.log(item);
}
```

#### Query Parameters
- `pageSize` (number): Number of transactions per page (default: 10, maximum: 100). Requests with pageSize > 100 will be rejected.
- `startBlock` (number): Start block number for filtering transactions
- `endBlock` (number): End block number for filtering transactions
- `sort` (string): Sort order ('asc' or 'desc', default: 'desc')
- `liveData` (boolean): Whether to include live data (default: false)
- `viewAsTransactionSender` (boolean): Whether to view transactions as sender (default: false)

#### Response Format
```typescript
interface HistoryData {
  transactionHash: string;
  blockNumber: string;
  timestamp: number;
}
```

#### Example Response
```json
{
  "items": [
    {
      "transactionHash": "0x8b0fad64f788b588ef8d13daaa6c713bc3366615fe48471f078e6547214bee1b",
      "blockNumber": "15289487",
      "timestamp": 1659799219
    },
    {
      "transactionHash": "0x96284e895c7464f22e24aa5e3828e501ea1d3646b9b0836d6ab35044f3e86216",
      "blockNumber": "15289479",
      "timestamp": 1659799131
    }
  ],
  "pageSize": 100,
  "hasNextPage": false
}
```

### getTxTypes()
Get a list of all available transaction types that can be returned by the API. This is useful for understanding what types of transactions can be classified.

```typescript
const txTypes = await evmTranslate.getTxTypes();
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

Example response:
```json
{
  "transactionTypes": [
    {
      "type": "swap",
      "description": "Reported when two or more fungible tokens are traded in the transaction, typically by using a decentralized exchange protocol."
    },
    {
      "type": "sendToken",
      "description": "The user sends a certain amount of a fungible token."
    }
  ],
  "version": 1
}
```

### startTransactionJob(chain: string, accountAddress: string, startBlock: number, endBlock: number, v5Format?: boolean, excludeSpam?: boolean)
Start a transaction job for an account. This method initiates a background job to fetch transactions for the specified account within the given block range.

```typescript
const job = await evmTranslate.startTransactionJob(
  "eth",
  "0x123...",
  14637919,
  15289488,
  false,
  true
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth")
- `accountAddress` (string): The account address to fetch transactions for
- `startBlock` (number): The start block number for the transaction range
- `endBlock` (number): The end block number for the transaction range
- `v5Format` (boolean, optional): Whether to return the response in v5 format (default: false)
- `excludeSpam` (boolean, optional): Whether to exclude spam transactions (default: true)

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
  "jobId": "0xc8da67014b82f4e59eb2b5ec230fb67a4d4d6398",
  "nextPageUrl": "https://translate.noves.fi/evm/eth/txs/job/0xc8da67014b82f4e59eb2b5ec230fb67a4d4d6398?pageNumber=1&pageSize=100&ascending=false"
}
```

### getTransactionJobResults(chain: string, jobId: string, pageOptions?: PageOptions)
Get results from a transaction job. This method retrieves the results of a previously started transaction job.

```typescript
const results = await evmTranslate.getTransactionJobResults(
  "eth",
  job.jobId,
  { 
    pageSize: 100,
    pageNumber: 1,
    ascending: false
  }
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth")
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
  "jobId": "0xc8da67014b82f4e59eb2b5ec230fb67a4d4d6398",
  "status": "completed",
  "results": {
    "transactions": [
      {
        "txTypeVersion": 1,
        "chain": "eth",
        "accountAddress": "0x123...",
        "classificationData": {
          "type": "swap",
          "description": "Swap tokens on Uniswap V2"
        },
        "rawTransactionData": {
          "transactionHash": "0xabc...",
          "timestamp": 1659799219
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
await evmTranslate.deleteTransactionJob(
  "eth",
  job.jobId
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth")
- `jobId` (string): The job ID to delete

#### Error Handling
The method will throw a `TransactionError` if:
- The job ID is invalid or not found
- The chain is not supported
- There are validation errors in the request
- The API returns an error response

### getRawTransaction(chain: string, txHash: string)
Get raw transaction data including traces, event logs, and internal transactions.

```typescript
const rawTx = await evmTranslate.getRawTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
```

#### Response Format
```typescript
interface RawTransactionResponse {
  network: string;
  rawTx: {
    transactionHash: string;
    hash: string;
    transactionIndex: number;
    type: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    gas: number;
    gasPrice: number;
    maxFeePerGas?: number;
    maxPriorityFeePerGas?: number;
    value: number;
    input: string;
    nonce: number;
    r: string;
    s: string;
    v: string;
    networkEnum: number;
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
```

## Examples

### Complete Example
```typescript
import { Translate } from "@noves/noves-sdk";

async function main() {
  const evmTranslate = Translate.evm("YOUR_API_KEY");

  // Get supported chains
  const chains = await evmTranslate.getChains();
  console.log("Supported chains:", chains);

  // Get token balances
  const balances = await evmTranslate.getTokenBalances(
    "eth",
    "0x123..."
  );
  console.log("Token balances:", balances);

  // Get transactions with pagination
  const transactions = await evmTranslate.Transactions(
    "eth",
    "0x123...",
    { pageSize: 10 }
  );

  // Process transactions
  for await (const tx of transactions) {
    console.log("Transaction:", tx);
  }

  // Get block information
  const blockInfo = await evmTranslate.getBlock("eth", 12345678);
  console.log("Block info:", blockInfo);

  // Get token information
  const tokenInfo = await evmTranslate.getTokenInfo(
    "eth",
    "0x123..."
  );
  console.log("Token info:", tokenInfo);
}
```

## Error Handling

The SDK provides specific error types for EVM-related operations:

```typescript
try {
  const balances = await evmTranslate.getTokenBalances(chain, address);
} catch (error) {
  if (error instanceof ChainNotFoundError) {
    console.error("Invalid chain:", error.message);
  } else if (error instanceof TransactionError) {
    console.error("Transaction error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Error Types
- `ChainNotFoundError`: Thrown when a chain is not found
- `TransactionError`: Thrown for general transaction-related errors

## Response Types

### TransactionReceipt
```typescript
interface TransactionReceipt {
  blockHash: string;
  blockNumber: number;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
    logIndex: number;
  }>;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: string;
}
```

### TransactionStatus
```typescript
interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
  error?: string;
}
```

### NativeBalance
```typescript
interface NativeBalance {
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
}
```

### Block
```typescript
interface Block {
  number: number;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: number;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: number;
  transactions: string[];
  uncles: string[];
}
```

### TokenInfo
```typescript
interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner?: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
}
```

### TokenHolder
```typescript
interface TokenHolder {
  address: string;
  balance: string;
  share: number;
}
```

### TransactionJob
```typescript
interface TransactionJob {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}
```

### TransactionJobResponse
```typescript
interface TransactionJobResponse {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  results?: {
    transactions: Transaction[];
    totalCount: number;
  };
  error?: string;
} 