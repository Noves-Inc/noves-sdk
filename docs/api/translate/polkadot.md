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

Returns all transactions for the requested chain and account, given a timerange. This method provides direct access to the API response.

```typescript
const response = await translate.getTransactions('bittensor', 'account-address', {
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

Response:
```typescript
{
  items: POLKADOTTranslateTransaction[];  // Array of transactions
  nextPageSettings: {
    hasNextPage: boolean;                 // Whether there's a next page
    endBlock: number | null;              // End block for next page
    nextPageUrl: string | null;           // URL for next page
  };
}
```

Each transaction in the `items` array follows the same structure as the `getTransaction` response.

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

### Getting Transaction History with Direct API Response

```typescript
const translate = new TranslatePOLKADOT('your-api-key');

// Get transactions directly from API
const response = await translate.getTransactions('bittensor', 'account-address', {
  pageSize: 10,
  endBlock: 4000001
});

console.log('Transactions:', response.items);
console.log('Has next page:', response.nextPageSettings.hasNextPage);

// Handle pagination manually
if (response.nextPageSettings.hasNextPage && response.nextPageSettings.nextPageUrl) {
  // You can parse the nextPageUrl to get pagination parameters
  // or use the deprecated Transactions method for automatic pagination
}
```

### Getting Transaction History with Pagination Helper (Deprecated)

```typescript
const translate = new TranslatePOLKADOT('your-api-key');

// Get transactions for an account
const transactionsPage = await translate.Transactions('bittensor', 'account-address');

// Get first page of transactions
const transactions = transactionsPage.getTransactions();
console.log('First page:', transactions);

// Get next page if available
if (transactionsPage.getNextPageKeys()) {
  const hasNext = await transactionsPage.next();
  if (hasNext) {
    console.log('Next page:', transactionsPage.getTransactions());
  }
}

// Iterate through all transactions
for await (const transaction of transactionsPage) {
  console.log('Transaction:', transaction);
}
``` 