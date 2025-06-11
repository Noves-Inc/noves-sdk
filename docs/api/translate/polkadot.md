# Polkadot Translate API

The Polkadot Translate API provides a set of methods to interact with Polkadot blockchains, allowing you to retrieve chain information, transaction details, and transaction history.

## Getting Started

```typescript
import { TranslatePOLKADOT } from '@noves/sdk';

// Initialize the client with your API key
const translate = new TranslatePOLKADOT('your-api-key');
```

## Methods

### getChains()

Returns a list of supported Polkadot blockchains.

```typescript
const chains = await translate.getChains();
```

Response:
```typescript
[
  {
    name: string;          // Chain name (e.g., "bittensor")
    ecosystem: string;     // Always "polkadot"
    nativeCoin: {
      name: string;        // Native coin name (e.g., "TAO")
      symbol: string;      // Native coin symbol (e.g., "TAO")
      address: string;     // Native coin address (e.g., "TAO")
      decimals: number;    // Number of decimals
    };
    tier: number;          // Chain tier level
  }
]
```

### getTransaction(chain: string, blockNumber: number, index: number)

Returns all available transaction information for a specific transaction.

```typescript
const transaction = await translate.getTransaction('bittensor', 4000000, 1);
```

Response:
```typescript
{
  txTypeVersion: number;      // Transaction type version
  chain: string;             // Chain name
  accountAddress: string | null; // Account address if applicable
  block: number;             // Block number
  index: number;             // Transaction index in block
  classificationData: {
    type: string;            // Transaction type
    description: string;     // Human-readable description
  };
  transfers: Array<{
    action: string;          // Transfer action (e.g., "paidGas")
    from: {
      name: string | null;   // Sender name if available
      address: string;       // Sender address
      owner: {
        name: string | null; // Owner name if available
        address: string | null; // Owner address if available
      };
    };
    to: {
      name: string | null;   // Recipient name if available
      address: string | null; // Recipient address if available
      owner: {
        name: string | null; // Owner name if available
        address: string | null; // Owner address if available
      };
    };
    amount: string;          // Transfer amount
    asset: {
      name: string;          // Asset name
      symbol: string;        // Asset symbol
      decimals: number;      // Number of decimals
    };
  }>;
  values: Array<{
    key: string;             // Value key
    value: string;           // Value content
  }>;
  rawTransactionData: {
    extrinsicIndex: number;  // Extrinsic index
    blockNumber: number;     // Block number
    timestamp: number;       // Transaction timestamp
    from: {
      name: string | null;   // Sender name if available
      address: string;       // Sender address
      owner: {
        name: string | null; // Owner name if available
        address: string | null; // Owner address if available
      };
    };
    to: {
      name: string | null;   // Recipient name if available
      address: string | null; // Recipient address if available
      owner: {
        name: string | null; // Owner name if available
        address: string | null; // Owner address if available
      };
    };
  };
}
```

Throws:
- `TransactionError` if there are validation errors or the transaction is not found

### getTransactions(chain: string, accountAddress: string, pageOptions?: PageOptions)

Get a pagination object to iterate over transactions pages.

```typescript
const transactionsPage = await translate.getTransactions('bittensor', 'account-address', {
  pageSize: 10,
  startBlock: 123456,
  endBlock: 123466
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
```

The `pageOptions` parameter supports the following options:
- `pageSize`: Number of transactions per page (default: 10)
- `startBlock`: Starting block number
- `endBlock`: Ending block number
- `startTimestamp`: Starting timestamp in milliseconds
- `endTimestamp`: Ending timestamp in milliseconds
- `sort`: Sort order ('desc' or 'asc')
- `viewAsAccountAddress`: View transactions from this address's perspective

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
const transactionsPage = await translate.getTransactions('bittensor', 'account-address', {
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
    'bittensor',
    'account-address',
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

Throws:
- `TransactionError` if there are validation errors or the request fails

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)

**⚠️ Deprecated:** Use `getTransactions()` instead. This method will be removed in a future version.

Returns a paginated list of transactions for an account.

```typescript
const transactionsPage = await translate.Transactions('bittensor', 'account-address', {
  pageSize: 10,
  startBlock: 123456,
  endBlock: 123466
});
```

The `pageOptions` parameter supports the following options:
- `pageSize`: Number of transactions per page (default: 10)
- `startBlock`: Starting block number
- `endBlock`: Ending block number
- `startTimestamp`: Starting timestamp in milliseconds
- `endTimestamp`: Ending timestamp in milliseconds
- `sort`: Sort order ('desc' or 'asc')
- `viewAsAccountAddress`: View transactions from this address's perspective

Response: Returns a `TransactionsPage` object with the following methods:
- `getTransactions()`: Get current page of transactions
- `getNextPageKeys()`: Get next page keys if available
- `next()`: Fetch next page of transactions
- `[Symbol.asyncIterator]()`: Async iterator for all transactions

## Error Handling

All methods throw a `TransactionError` when there are validation errors or API errors. The error object contains details about what went wrong.

Example:
```typescript
try {
  const transaction = await translate.getTransaction('bittensor', 123456, 0);
} catch (error) {
  if (error instanceof TransactionError) {
    console.error('Error:', error.message);
  }
}
```

## Examples

### Getting Transaction History with Pagination

```typescript
const translate = new TranslatePOLKADOT('your-api-key');

// Get transactions with pagination
const transactionsPage = await translate.getTransactions('bittensor', 'account-address', {
  pageSize: 10,
  endBlock: 4000001
});

// Get current page transactions
let transactions = transactionsPage.getTransactions();
console.log('First page:', transactions);
console.log('Has next page:', !!transactionsPage.getNextPageKeys());

// Navigate through pages
if (transactionsPage.getNextPageKeys()) {
  await transactionsPage.next();
  console.log('Second page:', transactionsPage.getTransactions());
  
  // Go back to first page
  if (transactionsPage.hasPrevious()) {
    await transactionsPage.previous();
    console.log('Back to first page');
  }
}

// Iterate through all transactions
console.log('Processing all transactions:');
for await (const transaction of transactionsPage) {
  console.log('Transaction:', transaction);
}
``` 