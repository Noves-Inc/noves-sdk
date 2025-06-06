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
Get paginated transactions for an account.

```typescript
const transactions = await tvmTranslate.getTransactions('tron', address, {
  pageSize: 10,
  sort: 'desc',
  pageNumber: 1,
  liveData: false,
  viewAsTransactionSender: false
});
```

**Note:** The legacy `Transactions()` method is still available but deprecated. Use `getTransactions()` for new code.

The `pageOptions` parameter supports the following options:
- `pageSize`: Number of transactions per page (default: 10)
- `sort`: Sort order ('asc' or 'desc', default: 'desc')
- `pageNumber`: Page number to fetch (default: 1)
- `liveData`: Whether to include live data (default: false)
- `viewAsTransactionSender`: Whether to view transactions as sender (default: false)

Response format:
```typescript
interface TVMTranslateTransactionsResponse {
  items: TVMTranslateTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl?: string;
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
const transactions = await tvmTranslate.getTransactions('tron', 'TMA6mAoXs24NZRy3sWmc3i5FPA6KE1JQRR', {
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