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
interface TVMTranslateChain {
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

### getTransactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get a pagination object to iterate over transactions pages.

```typescript
const transactionsPage = await tvmTranslate.getTransactions('tron', address, {
  pageSize: 10,
  sort: 'desc',
  pageNumber: 1,
  liveData: false,
  viewAsTransactionSender: false
});

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

The `pageOptions` parameter supports the following options:
- `pageSize`: Number of transactions per page (default: 10)
- `sort`: Sort order ('asc' or 'desc', default: 'desc')
- `pageNumber`: Page number to fetch (default: 1)
- `liveData`: Whether to include live data (default: false)
- `viewAsTransactionSender`: Whether to view transactions as sender (default: false)

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
const transactionsPage = await tvmTranslate.getTransactions('tron', address, {
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
    tvmTranslate,
    'tron',
    address,
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
      tvmTranslate, 
      chain, 
      address, 
      cursor
    );
  } else {
    // Start from beginning
    transactionsPage = await tvmTranslate.getTransactions(chain, address, {
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
const transactionsPage = await tvmTranslate.getTransactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR', {
  pageSize: 10,
  sort: 'desc'
});

// Process current page
console.log("Current transactions:", transactionsPage.getTransactions());

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