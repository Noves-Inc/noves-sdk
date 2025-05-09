# UTXO Translate API

The UTXO Translate API provides functionality to interact with UTXO-based blockchains like Bitcoin, Avalanche, and Cardano.

## Supported Chains

The following UTXO chains are currently supported:

- Bitcoin (BTC)
- Avalanche P-Chain
- Avalanche X-Chain
- Cardano

## API Reference

### getChains()
Returns a list of supported UTXO chains with their details.

```typescript
const chains = await translate.getChains();
```

Response format:
```typescript
interface Chain {
  name: string;        // Chain identifier (e.g., "btc", "avalanche-p-chain")
  ecosystem: string;   // Always "utxo"
  nativeCoin: {
    name: string;      // Native coin name (e.g., "BTC", "AVAX")
    symbol: string;    // Native coin symbol
    address: string;   // Native coin address
    decimals: number;  // Number of decimals for the native coin
  };
  tier: number;        // Chain tier level
}
```

### getChain(name: string)
Get details for a specific UTXO chain by name.

```typescript
const chain = await translate.getChain('btc');
```

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get paginated transactions for an account.

```typescript
const transactions = await translate.Transactions('btc', address, {
  pageSize: 10,
  sort: 'desc'
});
```

### getAddressesByXpub(xpub: string)
Utility endpoint for Bitcoin. Returns a list of derived addresses for the given xpub address. This endpoint is useful for deriving Bitcoin addresses from an extended public key (xpub) without needing to perform the derivation locally.

```typescript
const addresses = await translate.getAddressesByXpub('xpub...');
```

Response format:
```typescript
string[] // Array of derived Bitcoin addresses
```

Example response:
```json
[
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "1B1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb"
]
```

Error handling:
- Returns `TransactionError` if the xpub format is invalid
- Returns `TransactionError` with a general error message if there's an internal server error

### getTransaction(chain: string, txHash: string)
Get detailed information about a specific transaction.

```typescript
const txInfo = await translate.getTransaction('btc', '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e');
```

Response format:
```typescript
interface Transaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string;
  classificationData: {
    type: string;
    source: {
      type: string;
    };
    description: string;
    protocol: Record<string, any>;
    sent: Array<{
      action: string;
      from: {
        name: string | null;
        address: string;
      };
      to: {
        name: string | null;
        address: string;
      };
      amount: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
    }>;
    received: Array<{
      action: string;
      from: {
        name: string | null;
        address: string;
      };
      to: {
        name: string | null;
        address: string;
      };
      amount: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
    }>;
    utxo: {
      summary: {
        inputs: Array<{
          senders: string[];
          totalSent: {
            amount: string;
            token: {
              symbol: string;
              name: string;
              decimals: number;
              address: string;
            };
          };
        }>;
        outputs: Array<{
          receivers: string[];
          totalReceived: {
            amount: string;
            token: {
              symbol: string;
              name: string;
              decimals: number;
              address: string;
            };
          };
        }>;
      };
    };
  };
  rawTransactionData: {
    transactionHash: string;
    blockNumber: number;
    transactionFee: {
      amount: string;
      token: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
      };
    };
    timestamp: number;
  };
}
```

## Error Handling

The API uses the following error types:

- `ChainNotFoundError`: Thrown when a requested chain is not supported
- `TransactionError`: Thrown for transaction-related errors

## Example Usage

```typescript
import { Translate } from '@noves/sdk';

// Initialize the UTXO translator
const translate = Translate.utxo('your-api-key');

// Get all supported chains
const chains = await translate.getChains();
console.log('Supported chains:', chains);

// Get transactions for a Bitcoin address
const transactions = await translate.Transactions('btc', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
for await (const tx of transactions) {
  console.log('Transaction:', tx);
}
``` 