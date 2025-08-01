# XRPL Translate API

The XRPL Translate API provides human-readable transaction descriptions and metadata for XRP Ledger transactions.

## Quick Start

```typescript
import { Translate } from 'noves-sdk';

const translateXRPL = Translate.xrpl('your-api-key');
```

## Methods

### getChains()

Returns a list of supported XRPL chains.

```typescript
const chains = await translateXRPL.getChains();
console.log(chains);
// Output: [{ name: 'xrpl', tier: 1, nativeCoin: { name: 'XRP', symbol: 'XRP', address: 'XRP', decimals: 6 } }]
```

### getTransaction(chain, txHash, viewAsAccountAddress?)

Returns a single transaction with human-readable classification.

**Parameters:**
- `chain` (string): The chain name
- `txHash` (string): Hash of the transaction (64-character hexadecimal string)
- `viewAsAccountAddress` (string, optional): Results are returned with the view/perspective of this account address

```typescript
const transaction = await translateXRPL.getTransaction(
  'xrpl', 
  'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE'
);

console.log(transaction.classificationData.description);
// Output: "Sent 50,000 LOX to r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf."

// With perspective of specific account
const transactionFromPerspective = await translateXRPL.getTransaction(
  'xrpl',
  'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE',
  'r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf'
);
```

### getTransactions(chain, accountAddress, pageOptions?)

Returns a paginated list of transactions for the given account address.

**Parameters:**
- `chain` (string): The chain name
- `accountAddress` (string): The XRP Ledger account address (starts with 'r')
- `pageOptions` (PageOptions, optional): Pagination and filtering options

```typescript
// Get recent transactions
const transactionsPage = await translateXRPL.getTransactions(
  'xrpl',
  'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye'
);

console.log(transactionsPage.transactions);

// Get transactions with pagination
const transactionsWithPaging = await translateXRPL.getTransactions(
  'xrpl',
  'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye',
  { pageSize: 20 }
);

// Navigate through pages
if (transactionsWithPaging.hasNext()) {
  const hasNext = await transactionsWithPaging.next();
  if (hasNext) {
    console.log(transactionsWithPaging.getTransactions());
  }
}
```

### getTokenBalances(chain, accountAddress, includePrices?, ledgerIndex?, ledgerHash?)

Returns the current token balances for the provided XRP Ledger account address.

**Parameters:**
- `chain` (string): The chain name
- `accountAddress` (string): The XRP Ledger account address (starts with 'r')
- `includePrices` (boolean, optional): If true, includes token prices in USD. Default: false
- `ledgerIndex` (string, optional): The ledger index for historical balances. Can be a number or 'validated', 'current', 'closed'
- `ledgerHash` (string, optional): The ledger hash for historical balances. Alternative to ledgerIndex

```typescript
// Get current balances
const balances = await translateXRPL.getTokenBalances(
  'xrpl',
  'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn'
);

console.log(balances.balances);
// Output: [{ balance: '2.009992', token: { symbol: 'XRP', name: 'XRP', ... } }]

// Get balances with prices
const balancesWithPrices = await translateXRPL.getTokenBalances(
  'xrpl',
  'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
  true
);

// Get historical balances at specific ledger
const historicalBalances = await translateXRPL.getTokenBalances(
  'xrpl',
  'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
  false,
  'validated'
);
```

## Response Types

### Transaction Structure

XRPL transactions use `txTypeVersion: 6` and have the following structure:

```typescript
interface XRPLTranslateTransaction {
  txTypeVersion: 6;
  chain: string;
  accountAddress: string;
  classificationData: {
    type: string;
    description: string;
    protocol: { name: string | null };
    source: { type: string };
  };
  transfers: Array<{
    action: string;
    amount: string;
    from: { name: string | null; address: string | null };
    to: { name: string | null; address: string | null };
    token: {
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      issuer: string | null; // XRPL-specific field
    };
  }>;
  values: Record<string, any>;
  rawTransactionData: {
    signature: string;
    account: string;
    type: string;
    fee: string;
    sequence: number;
    destination?: string;
    result: string;
    ledger_index: number;
    validated?: boolean;
  };
  timestamp: number;
}
```

### Token Structure

XRPL tokens include an `issuer` field that's specific to the XRP Ledger:

```typescript
interface XRPLTranslateToken {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  issuer: string | null; // null for XRP, address for issued tokens
}
```

## Pagination

XRPL uses cursor-based pagination with markers:

```typescript
const transactionsPage = await translateXRPL.getTransactions('xrpl', 'rAddress...');

// Check if there are more pages
if (transactionsPage.hasNext()) {
  const hasNext = await transactionsPage.next();
  if (hasNext) {
    console.log(transactionsPage.getTransactions());
  }
}

// Check if you can go back
if (transactionsPage.hasPrevious()) {
  const hasPrevious = await transactionsPage.previous();
  if (hasPrevious) {
    console.log(transactionsPage.getTransactions());
  }
}
```

## Error Handling

```typescript
import { TransactionError } from 'noves-sdk';

try {
  const transaction = await translateXRPL.getTransaction('xrpl', 'invalid-hash');
} catch (error) {
  if (error instanceof TransactionError) {
    console.error('Transaction error:', error.message);
    console.error('Error details:', error.errors);
  }
}
```

## Common Use Cases

### Portfolio Tracking

```typescript
// Get all balances for a wallet
const balances = await translateXRPL.getTokenBalances(
  'xrpl',
  'rYourWalletAddress...',
  true // Include prices
);

// Calculate total portfolio value
const totalValue = balances.balances.reduce((sum, balance) => {
  const price = balance.token.price ? parseFloat(balance.token.price) : 0;
  const amount = parseFloat(balance.balance);
  return sum + (amount * price);
}, 0);
```

### Transaction History Analysis

```typescript
// Get recent transactions
const transactionsPage = await translateXRPL.getTransactions(
  'xrpl',
  'rYourAddress...',
  { pageSize: 50 }
);

// Filter by transaction type
const sendTransactions = transactionsPage.getTransactions().filter(
  tx => tx.classificationData.type === 'sendToken'
);

// Get human-readable descriptions
sendTransactions.forEach(tx => {
  console.log(`${tx.timestamp}: ${tx.classificationData.description}`);
});
```

### Historical Balance Tracking

```typescript
// Get balances at a specific ledger
const historicalBalances = await translateXRPL.getTokenBalances(
  'xrpl',
  'rYourAddress...',
  false,
  '12345678' // specific ledger index
);

// Compare with current balances
const currentBalances = await translateXRPL.getTokenBalances(
  'xrpl',
  'rYourAddress...'
);

// Calculate changes
// ... comparison logic
```