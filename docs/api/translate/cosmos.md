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
Get a pagination object to iterate over transactions pages.

```typescript
const transactionsPage = await cosmosTranslate.getTransactions(
  "cosmoshub",
  "cosmos1abcdefghijklmnopqrstuvwxyz1234567890",
  { pageSize: 10 }
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
```

#### Parameters
- `chain` (string): The chain name (e.g., "cosmoshub")
- `accountAddress` (string): The account address to get transactions for
- `pageOptions` (PageOptions, optional): Pagination and filtering options
  - `pageSize` (number): Number of transactions per page (default: 10)
  - `maxNavigationHistory` (number): Maximum number of pages to keep in navigation history for backward navigation (default: 10)

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
const transactionsPage = await cosmosTranslate.getTransactions("cosmoshub", "cosmos1abc...", {
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
    cosmosTranslate,
    "cosmoshub",
    "cosmos1abc...",
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
      cosmosTranslate, 
      chain, 
      address, 
      cursor
    );
  } else {
    // Start from beginning
    transactionsPage = await cosmosTranslate.getTransactions(chain, address, {
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

  // Get transactions with pagination
  const transactionsPage = await cosmosTranslate.getTransactions(
    "cosmoshub",
    "cosmos1abcdefghijklmnopqrstuvwxyz1234567890",
    { pageSize: 10 }
  );
  
  // Get current page transactions
  let transactions = transactionsPage.getTransactions();
  console.log("First page transactions:", transactions.length);
  
  transactions.forEach(tx => {
    console.log("Transaction:", tx);
    // Note: tx.rawTransactionData.txhash can be null for genesis transactions
    if (tx.rawTransactionData.txhash) {
      console.log("TX Hash:", tx.rawTransactionData.txhash);
    } else {
      console.log("Genesis transaction (no hash)");
    }
  });

  // Navigate through pages
  if (transactionsPage.getNextPageKeys()) {
    await transactionsPage.next();
    console.log("Second page transactions:", transactionsPage.getTransactions().length);
    
    // Go back to first page
    if (transactionsPage.hasPrevious()) {
      await transactionsPage.previous();
      console.log("Back to first page");
    }
  }

  // Process all transactions using iterator
  console.log("Processing all transactions:");
  for await (const tx of transactionsPage) {
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