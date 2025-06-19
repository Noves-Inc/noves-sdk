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

### startBalancesJob(chain: string, tokenAddress: string, accountAddress: string, blockNumber: number)
Starts a job to fetch the token balance for a given account and token address as of a specific block.

```typescript
const jobResponse = await tvmTranslate.startBalancesJob(
  'tron',
  'TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT', // Token address
  'TH2uNFtnwr5NsiAW2Py6Fmv8zDhfYXyDd9', // Account address
  73196764 // Block number
);

console.log('Job ID:', jobResponse.jobId);
console.log('Result URL:', jobResponse.resultUrl);
```

Response format:
```typescript
interface TVMTranslateStartBalanceJobResponse {
  jobId: string;     // Unique identifier for the balance job
  resultUrl: string; // URL to poll for job results
}
```

### getBalancesJobResults(chain: string, jobId: string)
Gets the result of a balance job by job ID. This method may return a 425 status if the job is still processing.

```typescript
try {
  const balanceResult = await tvmTranslate.getBalancesJobResults(
    'tron',
    '0xc8259410336d786984a8194db6f9a732381a4c68'
  );
  
  console.log('Balance:', balanceResult.amount);
  console.log('Token:', balanceResult.token);
} catch (error) {
  if (error.status === 425) {
    console.log('Job still processing, try again later');
  }
}
```

Response format:
```typescript
interface TVMTranslateBalanceJobResult {
  chain: string;           // Chain name (e.g., "tron")
  accountAddress: string;  // Account address that was queried
  token: {
    symbol: string;        // Token symbol (e.g., "SUNDOG")
    name: string;          // Token name (e.g., "Sundog")
    decimals: number;      // Token decimals (e.g., 18)
    address: string;       // Token contract address
  };
  amount: string;          // Token balance as a string (e.g., "19.52212")
  blockNumber: number;     // Block number at which balance was calculated
}
```

**Important Notes:**
- Processing time depends on how far the requested block is from chain genesis
- Processing time also depends on the transaction volume of the requested account
- If you receive a 425 status code, retry the request after some time
- Continue polling until you get the final balance result

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

### Getting Token Balance at Specific Block
```typescript
// Start a balance job
const jobResponse = await tvmTranslate.startBalancesJob(
  'tron',
  'TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT', // SUNDOG token
  'TH2uNFtnwr5NsiAW2Py6Fmv8zDhfYXyDd9', // Account address
  73196764 // Block number
);

console.log('Job started:', jobResponse.jobId);

// Poll for results (with retry logic for 425 status)
async function pollForBalance(chain: string, jobId: string, maxRetries = 10, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await tvmTranslate.getBalancesJobResults(chain, jobId);
      console.log('Balance result:', result);
      return result;
    } catch (error) {
      if (error.status === 425 && i < maxRetries - 1) {
        console.log(`Job still processing, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Get the balance result
const balanceResult = await pollForBalance('tron', jobResponse.jobId);
console.log(`Balance: ${balanceResult.amount} ${balanceResult.token.symbol}`);
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