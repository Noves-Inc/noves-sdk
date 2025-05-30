# TVM Translate API

The TVM Translate API provides functionality to interact with Tron Virtual Machine (TVM) based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize the TVM translator
const tvmTranslate = Translate.tvm("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported TVM chains.

```typescript
const chains = await tvmTranslate.getChains();
// Returns: [{ name: "tron", ecosystem: "tvm", nativeCoin: { ... } }]
```

Response format:
```typescript
interface Chain {
  name: string;        // Chain identifier (e.g., "tron")
  ecosystem: string;   // Always "tvm"
  nativeCoin: {
    name: string;      // Native coin name (e.g., "TRX")
    symbol: string;    // Native coin symbol
    address: string;   // Native coin address
    decimals: number;  // Number of decimals for the native coin
  };
  tier: number;        // Chain tier level
}
```

### getTransaction(chain: string, hash: string)
Get detailed information about a specific transaction.

```typescript
const txInfo = await tvmTranslate.getTransaction(
  "tron",
  "c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462"
);
```

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get paginated transactions for an account.

```typescript
const transactions = await tvmTranslate.Transactions('tron', address, {
  pageSize: 10,
  sort: 'desc',
  pageNumber: 1,
  liveData: false,
  viewAsTransactionSender: false
});
```

The `pageOptions` parameter supports the following options:
- `pageSize`: Number of transactions per page (default: 10)
- `sort`: Sort order ('asc' or 'desc', default: 'desc')
- `pageNumber`: Page number to fetch (default: 1)
- `liveData`: Whether to include live data (default: false)
- `viewAsTransactionSender`: Whether to view transactions as sender (default: false)

Response format:
```typescript
interface TransactionsResponse {
  items: Transaction[];
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}
```

### startBalancesJob(chain: string, accountAddress: string, tokenAddress: string, blockNumber: number)
Start a balances job for an account. This method initiates a background job to fetch token balances for the specified account at a given block number.

```typescript
const job = await tvmTranslate.startBalancesJob(
  "tron",
  "TD7beBofzDoDZ7qcGUAeHK1zf2Fnsvz2SP",
  "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  72049264
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "tron")
- `accountAddress` (string): The account address to fetch balances for
- `tokenAddress` (string): The token address to fetch balance for
- `blockNumber` (number): The block number to fetch balance at

#### Response Format
```typescript
interface TVMBalancesJob {
  jobId: string;
  resultUrl: string;
}
```

#### Example Response
```json
{
  "jobId": "0xc896b0f15f707bab1ee9d265e3e7741d10dab4fd",
  "resultUrl": "https://translate.noves.fi/tvm/tron/balances/job/0xc896b0f15f707bab1ee9d265e3e7741d10dab4fd"
}
```

### getBalancesJobResults(chain: string, jobId: string)
Get results from a balances job. This method retrieves the results of a previously started balances job.

```typescript
const results = await tvmTranslate.getBalancesJobResults(
  "tron",
  job.jobId
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "tron")
- `jobId` (string): The job ID returned from startBalancesJob

#### Response Format
```typescript
interface TVMBalancesJobResponse {
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
```

#### Example Response
```json
{
  "jobId": "0xc896b0f15f707bab1ee9d265e3e7741d10dab4fd",
  "status": "completed",
  "results": {
    "balances": [
      {
        "token": {
          "symbol": "USDT",
          "name": "Tether USD",
          "decimals": 6,
          "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        },
        "balance": "1000000"
      }
    ]
  }
}
```

## Examples

### Getting Chain Information
```typescript
// Get all supported chains
const chains = await tvmTranslate.getChains();
console.log(chains);
// Output: [{ name: "tron", ecosystem: "tvm", nativeCoin: { ... } }]
```

### Getting Transaction Information
```typescript
// Get transaction details
const txInfo = await tvmTranslate.getTransaction(
  "tron",
  "c709a6400fc11a24460ac3a2871ad5877bc47383b51fc702c00d4f447091c462"
);
console.log(txInfo);
// Output: { hash: "...", accountAddress: "...", rawTransactionData: { ... }, classificationData: { ... } }
```

### Getting Account Transactions
```typescript
// Get paginated transactions
const transactions = await tvmTranslate.Transactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR', {
  pageSize: 10,
  sort: 'desc'
});

// Get next page
const nextPage = await transactions.next();
```

## Error Handling

The TVM Translate API uses the following error types:

- `TransactionError`: Thrown for transaction-related errors
- `ValidationError`: Thrown for validation errors in request parameters

Example error handling:
```typescript
try {
  const txInfo = await tvmTranslate.getTransaction("tron", "invalid-hash");
} catch (error) {
  if (error instanceof TransactionError) {
    console.error("Transaction error:", error.message);
  }
}
``` 