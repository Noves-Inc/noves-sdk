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
    name: string;          // Chain name (e.g., "polkadot")
    ecosystem: string;     // Always "polkadot"
    nativeCoin: {
      name: string;        // Native coin name (e.g., "Polkadot")
      symbol: string;      // Native coin symbol (e.g., "DOT")
      address: string;     // Native coin address
      decimals: number;    // Number of decimals
    };
    tier: number;          // Chain tier level
  }
]
```

### getChain(name: string)

Retrieves details for a specific chain by name.

```typescript
const chain = await translate.getChain('polkadot');
```

Response: Same as individual chain object in `getChains()` response.

Throws:
- `ChainNotFoundError` if the chain is not found
- `TransactionError` if there are validation errors

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


### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)

Returns a paginated list of transactions for an account.

```typescript
const transactionsPage = await translate.Transactions('polkadot', 'account-address', {
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

### describeTransaction(chain: string, blockNumber: number, index: number, viewAsAccountAddress?: string)

Returns a simplified description of a transaction.

```typescript
const description = await translate.describeTransaction('polkadot', 123456, 0);
```

Response:
```typescript
{
  type: string;           // Transaction type
  description: string;    // Human-readable description
}
```

### describeTransactions(chain: string, transactions: Array<{blockNumber: number, index: number}>, viewAsAccountAddress?: string)

Returns simplified descriptions for multiple transactions.

```typescript
const descriptions = await translate.describeTransactions('polkadot', [
  { blockNumber: 123456, index: 0 },
  { blockNumber: 123457, index: 0 }
]);
```

Response:
```typescript
[
  {
    type: string;           // Transaction type
    description: string;    // Human-readable description
  }
]
```

## Error Handling

All methods throw a `TransactionError` when there are validation errors or API errors. The error object contains details about what went wrong.

Example:
```typescript
try {
  const chain = await translate.getChain('nonexistent');
} catch (error) {
  if (error instanceof TransactionError) {
    console.error('Error:', error.message);
  }
}
```

## Examples

### Getting Transaction History

```typescript
const translate = new TranslatePOLKADOT('your-api-key');

// Get transactions for an account
const transactionsPage = await translate.Transactions('polkadot', 'account-address');

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

### Getting Transaction Descriptions

```typescript
const translate = new TranslatePOLKADOT('your-api-key');

// Get description for a single transaction
const description = await translate.describeTransaction('polkadot', 123456, 0);
console.log('Description:', description);

// Get descriptions for multiple transactions
const descriptions = await translate.describeTransactions('polkadot', [
  { blockNumber: 123456, index: 0 },
  { blockNumber: 123457, index: 0 }
]);
console.log('Descriptions:', descriptions);
``` 