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
// Returns: [
//   {
//     name: "celestia",
//     ecosystem: "cosmos",
//     nativeCoin: {
//       name: "TIA",
//       symbol: "TIA",
//       address: "TIA",
//       decimals: 6
//     },
//     tier: 2
//   },
//   ...
// ]
```

### getTransaction(chain: string, hash: string)
Get detailed information about a specific transaction.

```typescript
const txInfo = await cosmosTranslate.getTransaction(
  "cosmoshub",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
```

### getTransactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get transactions for an account directly - returns the complete API response.

```typescript
const response = await cosmosTranslate.getTransactions(
  "cosmoshub",
  "cosmos1abcdefghijklmnopqrstuvwxyz1234567890",
  { pageSize: 10 }
);

console.log("Account:", response.account);
console.log("Transactions:", response.items);
console.log("Has next page:", response.hasNextPage);
```

### getTokenBalances(chain: string, accountAddress: string)
Get token balances for an account.

```typescript
const balances = await cosmosTranslate.getTokenBalances(
  "cosmoshub",
  "cosmos1abcdefghijklmnopqrstuvwxyz1234567890"
);
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

  // Get transactions directly (recommended)
  const response = await cosmosTranslate.getTransactions(
    "cosmoshub",
    "cosmos1abcdefghijklmnopqrstuvwxyz1234567890",
    { pageSize: 10 }
  );
  
  console.log("Account:", response.account);
  response.items.forEach(tx => {
    console.log("Transaction:", tx);
    // Note: tx.rawTransactionData.txhash can be null for genesis transactions
    if (tx.rawTransactionData.txhash) {
      console.log("TX Hash:", tx.rawTransactionData.txhash);
    } else {
      console.log("Genesis transaction (no hash)");
    }
  });

  // Get transactions with pagination (legacy method)
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
    job.nextPageId
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
  if (error instanceof TransactionError) {
    console.error("Transaction error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Error Types
- `CosmosError`: Base error class for Cosmos-related errors
- `CosmosTransactionJobError`: Thrown when a transaction job fails
- `TransactionError`: Thrown for general transaction-related errors

## Response Types

### COSMOSTranslateChain
```typescript
interface COSMOSTranslateChain {
  name: string;
  ecosystem: string;
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
  tier: number;
}
```

### COSMOSTranslateTokenBalance
```typescript
interface COSMOSTranslateTokenBalance {
  balance: string;
  token: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    icon: string | null;
  };
}
```

### COSMOSTranslateBalancesResponse
```typescript
type COSMOSTranslateBalancesResponse = COSMOSTranslateTokenBalance[];
```

### COSMOSTranslateTransactionsResponse
```typescript
interface COSMOSTranslateTransactionsResponse {
  account: string;
  items: COSMOSTranslateTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  startBlock: number | null;
  endBlock: number;
  nextPageUrl: string | null;
}
```

### COSMOSTranslateTransactionJob
```typescript
interface COSMOSTranslateTransactionJob {
  nextPageId: string;
  nextPageUrl: string;
}
```

### COSMOSTranslateTransaction
```typescript
interface COSMOSTranslateTransaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string | null;
  classificationData: {
    type: string;
    description: string;
  };
  transfers: Array<{
    action: string;
    from: {
      name: string | null;
      address: string | null;
    };
    to: {
      name: string | null;
      address: string | null;
    };
    amount: string;
    asset: {
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      icon: string | null;
    };
  }>;
  values: any[];
  rawTransactionData: {
    height: number;
    txhash: string | null; // Can be null for genesis transactions
    gas_used: number;
    gas_wanted: number;
    transactionFee: number;
    timestamp: number;
  };
}
```

### COSMOSTranslateTransactionJobResponse
```typescript
interface COSMOSTranslateTransactionJobResponse {
  items: COSMOSTranslateTransaction[];
  hasNextPage: boolean;
  nextPageUrl?: string;
}
``` 