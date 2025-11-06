# Move Translate API

The Move Translate API provides transaction classification and metadata for Move VM-based blockchain ecosystems, currently supporting Sui.

## Quick Start

```typescript
import { Translate } from 'noves-sdk';

// Initialize with API key
const translate = Translate.move("YOUR_API_KEY");

// Or with advanced configuration
const translate = Translate.move({
  apiKey: "YOUR_API_KEY",
  retryConfig: "PRODUCTION"
});
```

## Supported Chains

Currently supported Move chains:
- **Sui** (`sui`) - Tier 2 support

## Methods

### getChains()

Returns a list of Move blockchains currently supported by the API.

```typescript
const chains = await translate.getChains();
console.log(chains);
// [{ name: "sui", ecosystem: "move", nativeCoin: {...}, tier: 2 }]
```

**Returns:** `Promise<MOVETranslateChains>`

### getTransactionTypes()

Returns all transaction types supported by the classification system with descriptions.

```typescript
const txTypes = await translate.getTransactionTypes();
console.log(txTypes.transactionTypes);
// [
//   { type: "swap", description: "Token swap transaction" },
//   { type: "tokenTransfer", description: "Transfer of objects or tokens" },
//   ...
// ]
```

**Returns:** `Promise<MOVETranslateTransactionTypesResponse>`

### getTransaction(chain, txId)

Returns a single Move VM transaction with full classification data.

```typescript
const transaction = await translate.getTransaction(
  "sui", 
  "FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK"
);

console.log(transaction.classificationData.type); // "failed"
console.log(transaction.transfers); // Gas payments and token transfers
```

**Parameters:**
- `chain` (string): The chain name (e.g., "sui")
- `txId` (string): The transaction ID/hash

**Returns:** `Promise<MOVETranslateTransaction>`

### getTransactions(chain, address, pageOptions?)

Returns a paginated list of Move VM transactions for an address.

```typescript
const transactions = await translate.getTransactions(
  "sui",
  "0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874"
);

// Iterate through transactions
for (const tx of transactions.transactions) {
  console.log(`${tx.rawTransactionData.digest}: ${tx.classificationData.type}`);
}

// Pagination support
if (transactions.hasNextPage()) {
  const nextPage = await transactions.getNextPage();
}
```

**Parameters:**
- `chain` (string): The chain name (e.g., "sui")
- `address` (string): The wallet address to get transactions for
- `pageOptions` (optional): Pagination options
  - `pageNumber` (number): Page number (default: 1)
  - `pageSize` (number): Number of transactions per page (default: 10)
  - `sort` (string): Sort order ("desc" or "asc")

**Returns:** `Promise<TransactionsPage<MOVETranslateTransaction>>`

## Transaction Types

The Move ecosystem supports the following transaction types:

| Type | Description |
|------|-------------|
| `addLiquidity` | Add liquidity to pool |
| `borrow` | Borrow from lending protocol |
| `burn` | Burn tokens or NFTs |
| `cancelOrder` | Cancel order on DEX |
| `claimRewards` | Claim rewards |
| `composite` | Composite transaction with multiple operations |
| `createProposal` | Create proposal |
| `deposit` | Deposit to protocol |
| `depositCollateral` | Deposit collateral to lending protocol |
| `failed` | Failed or reverted transaction |
| `mint` | Mint new tokens or NFTs |
| `multiStep` | Multiple operations in one transaction |
| `placeOrder` | Place order on DEX |
| `removeLiquidity` | Remove liquidity from pool |
| `repayLoan` | Repay loan to lending protocol |
| `stake` | Stake tokens |
| `swap` | Token swap transaction |
| `tokenTransfer` | Transfer of objects or tokens |
| `unclassified` | Unclassified transaction |
| `unstake` | Unstake tokens |
| `utility` | Utility operation |
| `vote` | Vote on proposal |
| `withdraw` | Withdraw from protocol |

## Data Structures

### MOVETranslateTransaction

```typescript
interface MOVETranslateTransaction {
  txTypeVersion: number;           // Transaction type version
  chain: string;                   // Chain name (e.g., "sui")
  timestamp: number;               // Unix timestamp
  classificationData: {
    type: string;                  // Transaction type
    description: string;           // Human-readable description
    protocol: {
      name: string | null;         // Protocol name if applicable
    };
    source: {
      type: string;                // Source type ("rpc", "human", etc.)
    };
  };
  transfers: Array<{
    action: string;                // Transfer action (e.g., "paidGas")
    amount: string;                // Amount transferred
    token: {
      address: string;             // Token contract address
      name: string;                // Token name
      symbol: string;              // Token symbol
      decimals: number;            // Token decimals
      icon: string | null;         // Token icon URL
      issuer: string | null;       // Token issuer
    };
    nft: any | null;              // NFT data if applicable
    from: {
      address: string;             // Sender address
      name: string | null;         // Sender name if known
    };
    to: {
      address: string;             // Recipient address
      name: string | null;         // Recipient name if known
    } | null;
  }>;
  values: Array<{
    commandTypes?: string[];       // Command types for successful transactions
    failed?: boolean;              // Whether transaction failed
    failureReason?: string;        // Failure reason if failed
    gasUsed?: string;             // Gas used
    timestamp?: string;           // Detailed timestamp
    checkpoint?: string;          // Checkpoint number
  }>;
  rawTransactionData: {
    digest: string;               // Transaction hash/digest
    signer: string;               // Transaction signer
    checkpoint: string;           // Checkpoint number
    gasUsed: string;             // Gas used
  };
}
```

## Error Handling

The Move Translate API uses structured error handling:

```typescript
import { TransactionError, ErrorType } from 'noves-sdk';

try {
  const transaction = await translate.getTransaction("sui", "invalid-hash");
} catch (error) {
  if (error instanceof TransactionError) {
    switch (error.errorType) {
      case ErrorType.INVALID_REQUEST:
        console.log('Invalid request parameters');
        break;
      case ErrorType.RATE_LIMIT_EXCEEDED:
        console.log('Rate limit exceeded, please retry later');
        break;
      case ErrorType.INVALID_API_KEY:
        console.log('Invalid API key provided');
        break;
      default:
        console.log('Unknown error:', error.message);
    }
  }
}
```

## Pagination

The `getTransactions` method returns a `TransactionsPage` object with built-in pagination support:

```typescript
// Basic pagination
const firstPage = await translate.getTransactions("sui", address, { 
  pageSize: 20 
});

// Check if more pages are available
if (firstPage.hasNextPage()) {
  const secondPage = await firstPage.getNextPage();
}

// Async iteration through all transactions
for await (const transaction of firstPage) {
  console.log(transaction.rawTransactionData.digest);
}
```

## Advanced Configuration

### Retry Configuration

```typescript
import { Translate, RetryPresets } from 'noves-sdk';

// Use production-optimized retry settings
const translate = Translate.move({
  apiKey: "YOUR_API_KEY",
  retryConfig: RetryPresets.PRODUCTION
});

// Custom retry configuration
const translate = Translate.move({
  apiKey: "YOUR_API_KEY",
  retryConfig: {
    enabled: true,
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  }
});
```

### Environment-based Configuration

```typescript
const translate = Translate.move({
  apiKey: "YOUR_API_KEY",
  environment: "production" // Auto-selects appropriate retry strategy
});
```

## Rate Limits

The Move Translate API has rate limits to ensure fair usage. When rate limits are exceeded, the SDK will automatically retry with exponential backoff (if retry is enabled).

## Best Practices

1. **Use appropriate page sizes**: For bulk operations, use larger page sizes (up to 100). For real-time applications, use smaller page sizes (10-20).

2. **Handle errors gracefully**: Always wrap API calls in try-catch blocks and handle different error types appropriately.

3. **Cache chain information**: The list of supported chains changes infrequently, so cache the results of `getChains()`.

4. **Use pagination efficiently**: Use the built-in pagination methods rather than manually constructing page parameters.

5. **Monitor rate limits**: Implement proper retry logic and respect rate limits to avoid service interruptions.

## Examples

See the [Move examples](../../examples/translate/move.ts) for complete working code samples.
