# Cosmos Translate API

The Cosmos Translate API provides functionality to interact with Cosmos-based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize the Cosmos translator
const cosmosTranslate = Translate.cosmos("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported Cosmos chains.

```typescript
const chains = await cosmosTranslate.getChains();
// Returns: [{ name: "cosmoshub", ecosystem: "cosmos" }, ...]
```

### getTransaction(chain: string, txHash: string)
Get detailed information about a specific transaction.

```typescript
const txInfo = await cosmosTranslate.getTransaction(
  "cosmoshub",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
```

### getTokenBalances(chain: string, accountAddress: string)
Get token balances for an account.

```typescript
const balances = await cosmosTranslate.getTokenBalances(
  "cosmoshub",
  "cosmos1abcdefghijklmnopqrstuvwxyz1234567890"
);
```

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get paginated transactions for an account.

```typescript
const transactions = await cosmosTranslate.Transactions(
  "cosmoshub",
  "cosmos1abcdefghijklmnopqrstuvwxyz1234567890",
  { pageSize: 10 }
);

// Iterate through transactions
for await (const tx of transactions) {
  console.log(tx);
}
```

### startTransactionJob(chain: string, accountAddress: string)
Start a transaction job for an account.

```typescript
const job = await cosmosTranslate.startTransactionJob(
  "cosmoshub",
  "cosmos1abcdefghijklmnopqrstuvwxyz1234567890"
);
```

### getTransactionJobResults(chain: string, pageId: string)
Get results from a transaction job.

```typescript
const results = await cosmosTranslate.getTransactionJobResults(
  "cosmoshub",
  job.pageId
);
```

## Examples

### Complete Example
```typescript
import { Translate } from "@noves/noves-sdk";

async function main() {
  const cosmosTranslate = Translate.cosmos("YOUR_API_KEY");

  // Get supported chains
  const chains = await cosmosTranslate.getChains();
  console.log("Supported chains:", chains);

  // Get token balances
  const balances = await cosmosTranslate.getTokenBalances(
    "cosmoshub",
    "cosmos1abcdefghijklmnopqrstuvwxyz1234567890"
  );
  console.log("Token balances:", balances);

  // Get transactions with pagination
  const transactions = await cosmosTranslate.Transactions(
    "cosmoshub",
    "cosmos1abcdefghijklmnopqrstuvwxyz1234567890",
    { pageSize: 10 }
  );

  // Process transactions
  for await (const tx of transactions) {
    console.log("Transaction:", tx);
  }

  // Start and monitor a transaction job
  const job = await cosmosTranslate.startTransactionJob(
    "cosmoshub",
    "cosmos1abcdefghijklmnopqrstuvwxyz1234567890"
  );
  console.log("Job started:", job);

  const results = await cosmosTranslate.getTransactionJobResults(
    "cosmoshub",
    job.pageId
  );
  console.log("Job results:", results);
}
```

## Error Handling

The SDK provides specific error types for Cosmos-related operations:

```typescript
try {
  const balances = await cosmosTranslate.getTokenBalances(chain, address);
} catch (error) {
  if (error instanceof CosmosAddressError) {
    console.error("Invalid Cosmos address:", error.message);
  } else if (error instanceof TransactionError) {
    console.error("Transaction error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Error Types
- `CosmosError`: Base error class for Cosmos-related errors
- `CosmosAddressError`: Thrown when a Cosmos address is invalid
- `CosmosTransactionJobError`: Thrown when a transaction job fails
- `TransactionError`: Thrown for general transaction-related errors

## Response Types

### CosmosTokenBalance
```typescript
interface CosmosTokenBalance {
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
  };
  balance: string;
}
```

### CosmosBalancesResponse
```typescript
interface CosmosBalancesResponse {
  accountAddress: string;
  balances: CosmosTokenBalance[];
}
```

### CosmosTransactionJob
```typescript
interface CosmosTransactionJob {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  pageId?: string;
}
```

### CosmosTransactionJobResponse
```typescript
interface CosmosTransactionJobResponse {
  items: Transaction[];
  hasNextPage: boolean;
  nextPageUrl?: string;
}
``` 