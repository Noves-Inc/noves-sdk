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
interface UTXOTranslateChain {
  name: string;        // Chain identifier (e.g., "btc", "avalanche-p-chain")
  ecosystem: 'utxo';   // Always "utxo"
  nativeCoin: {
    name: string;      // Native coin name (e.g., "BTC", "AVAX")
    symbol: string;    // Native coin symbol
    address: string;   // Native coin address
    decimals: number;  // Number of decimals for the native coin
  };
  tier: number;        // Chain tier level
}
```



### getTransactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get a pagination object to iterate over transactions pages.

**Transaction Formats:**
The API supports two transaction formats:
- **v2 format** (default): Traditional format with `sent` and `received` arrays in `classificationData`
- **v5 format**: New format with `transfers` and `values` arrays at the root level and `timestamp` at transaction level

```typescript
// Default v2 format
const transactionsPage = await translate.getTransactions('btc', address, {
  pageSize: 10,
  startBlock: 865798,
  endBlock: 868128,
  sort: 'desc'
});

// v5 format - specify in pageOptions
const transactionsPageV5 = await translate.getTransactions('btc', address, {
  pageSize: 10,
  v5Format: true
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

#### Parameters
- `chain` (string): The chain name (e.g., "btc")
- `accountAddress` (string): The account address to get transactions for
- `pageOptions` (PageOptions, optional): Pagination and filtering options
  - `pageSize` (number): Number of transactions per page (default: 10)
  - `startBlock` (number): Starting block number to filter by
  - `endBlock` (number): Ending block number to filter by
  - `startTimestamp` (number): Starting timestamp in milliseconds to filter by
  - `endTimestamp` (number): Ending timestamp in milliseconds to filter by
  - `sort` (string): Sort order ('desc' or 'asc', default: 'desc')
  - `v5Format` (boolean): Whether to use v5 format (default: false)
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
const transactionsPage = await translate.getTransactions('btc', address, {
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
    'btc',
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

### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions) [DEPRECATED]
**⚠️ Deprecated:** Use `getTransactions()` instead. This method will be removed in a future version.

Get paginated transactions for an account. This method is maintained for backward compatibility.

#### Parameters
- `chain` (string): The chain name (e.g., "btc")
- `accountAddress` (string): The account address to fetch transactions for
- `pageOptions` (object, optional):
  - `pageSize` (number, optional): Number of transactions per page. Default: 10, Max: 100
  - `startBlock` (number, optional): Starting block number to filter by
  - `endBlock` (number, optional): Ending block number to filter by
  - `startTimestamp` (number, optional): Starting timestamp in milliseconds to filter by
  - `endTimestamp` (number, optional): Ending timestamp in milliseconds to filter by
  - `sort` (string, optional): Sort order. Valid values: 'desc' (default) or 'asc'

#### Response Format
```typescript
interface TransactionsResponse {
  items: Array<{
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
          address: string | null;
        };
        to: {
          name: string | null;
          address: string | null;
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
          address: string | null;
        };
        to: {
          name: string | null;
          address: string | null;
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
  }>;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}
```

#### Example Response
```json
{
  "items": [
    {
      "txTypeVersion": 2,
      "chain": "btc",
      "accountAddress": "3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL",
      "classificationData": {
        "type": "receiveToken",
        "source": {
          "type": "human"
        },
        "description": "",
        "protocol": {},
        "sent": [],
        "received": [
          {
            "action": "receiveToken",
            "from": {
              "name": "",
              "address": "3FcoNNfPJSfo58w9Zv5B1DmJBMe4Up17HF"
            },
            "to": {
              "name": null,
              "address": "3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL"
            },
            "amount": "0.00016199",
            "token": {
              "symbol": "BTC",
              "name": "Bitcoin",
              "decimals": 8,
              "address": "BTC"
            }
          }
        ],
        "utxo": {
          "summary": {
            "inputs": [
              {
                "senders": ["3FcoNNfPJSfo58w9Zv5B1DmJBMe4Up17HF"],
                "totalSent": {
                  "amount": "0.00024735",
                  "token": {
                    "symbol": "BTC",
                    "name": "Bitcoin",
                    "decimals": 8,
                    "address": "BTC"
                  }
                }
              }
            ],
            "outputs": [
              {
                "receivers": ["36UsxVpZcQjydzke8NpvXTCDd1mvB7NM5p", "3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL"],
                "totalReceived": {
                  "amount": "0.00023769",
                  "token": {
                    "symbol": "BTC",
                    "name": "Bitcoin",
                    "decimals": 8,
                    "address": "BTC"
                  }
                }
              }
            ]
          }
        }
      },
      "rawTransactionData": {
        "transactionHash": "002dbd999b8f3c9d3c3cb57875a0e83512d072df03eeca0c6089374cc1168c78",
        "blockNumber": 868128,
        "transactionFee": {
          "amount": "0.00000966",
          "token": {
            "symbol": "BTC",
            "name": "Bitcoin",
            "decimals": 8,
            "address": "BTC"
          }
        },
        "timestamp": 1730310693
      }
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "hasNextPage": true,
  "nextPageUrl": "https://translate.noves.fi/utxo/btc/txs/3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL?endBlock=865798&pageSize=10"
}
```

### getAddressesByMasterKey(masterKey: string, options?: GetAddressesByMasterKeyOptions)
Utility endpoint for Bitcoin. Returns a list of derived addresses for the given master key (xpub, ypub, or zpub). This endpoint is useful for deriving Bitcoin addresses from an extended public key without needing to perform the derivation locally.

Supports different Bitcoin address types:
- **Legacy (0)**: Legacy P2PKH addresses starting with "1" - Most compatible, higher fees
- **SegWit (1)**: Native SegWit P2WPKH addresses starting with "bc1" - Lower fees, modern standard
- **SegWitP2SH (2)**: SegWit P2SH-P2WPKH addresses starting with "3" - Backward compatible SegWit  
- **Taproot (3)**: Taproot P2TR addresses starting with "bc1p" - Enhanced privacy and flexibility

```typescript
// Default behavior - Returns 20 legacy addresses
const addresses = await translate.getAddressesByMasterKey('xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz');

// Custom count - Returns 50 legacy addresses
const addresses = await translate.getAddressesByMasterKey('xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz', {
  count: 50
});

// Using numeric addressType - Returns 20 SegWit addresses
const addresses = await translate.getAddressesByMasterKey('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXgh3SsEF3C9vLpqHrwfbK6W1H2WdBLiHGvKJ8Q2Dpt6SbGwuL7X4VzNq3a', {
  addressType: 1
});

// Using string addressType - Returns 20 SegWit addresses
const addresses = await translate.getAddressesByMasterKey('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXgh3SsEF3C9vLpqHrwfbK6W1H2WdBLiHGvKJ8Q2Dpt6SbGwuL7X4VzNq3a', {
  addressType: 'SegWit'
});

// Both parameters - Returns 100 SegWitP2SH addresses
const addresses = await translate.getAddressesByMasterKey('ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNpj8ahQn9dDfJdLUKD1Bou4EQvjnyWYCJ8VGzHoLYpqJHYJg9Q7GvgEBXEZj6vDFkJ9pq8ABCD', {
  count: 100,
  addressType: 'SegWitP2SH'
});

// Taproot addresses
const addresses = await translate.getAddressesByMasterKey('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXgh3SsEF3C9vLpqHrwfbK6W1H2WdBLiHGvKJ8Q2Dpt6SbGwuL7X4VzNq3a', {
  count: 25,
  addressType: 'Taproot'
});
```

#### Parameters
- `masterKey` (string): The master key - can be xpub (legacy P2PKH), ypub (P2SH-wrapped SegWit), or zpub (native SegWit)
- `options` (GetAddressesByMasterKeyOptions, optional): Configuration options for address derivation
  - `count` (number, optional): Number of addresses to derive from the master key. Values between 1-10000. Default: 20
  - `addressType` (BitcoinAddressType, optional): Bitcoin address type to generate. Supports both numeric (0-3) and string values. Default: 'Legacy' (0)
    - `0` or `'Legacy'`: Legacy P2PKH addresses starting with "1"
    - `1` or `'SegWit'`: Native SegWit P2WPKH addresses starting with "bc1"
    - `2` or `'SegWitP2SH'`: SegWit P2SH-P2WPKH addresses starting with "3"
    - `3` or `'Taproot'`: Taproot P2TR addresses starting with "bc1p"

#### Examples with API endpoint equivalents:
- `getAddressesByMasterKey(masterKey)` → `GET /utxo/btc/addresses/{masterKey}` (20 legacy addresses)
- `getAddressesByMasterKey(masterKey, {count: 50, addressType: 1})` → `GET /utxo/btc/addresses/{masterKey}?count=50&addressType=1` (50 SegWit addresses)
- `getAddressesByMasterKey(masterKey, {count: 100, addressType: 'SegWit'})` → `GET /utxo/btc/addresses/{masterKey}?count=100&addressType=1` (100 SegWit addresses)

### getAddressesByXpub(xpub: string, options?: GetAddressesByMasterKeyOptions) **(Deprecated)**
**⚠️ Deprecated:** Use `getAddressesByMasterKey` instead. This method will be removed in v2.0.0.

Utility endpoint for Bitcoin. Returns a list of derived addresses for the given xpub master key. Now supports the same options as `getAddressesByMasterKey` for backward compatibility.

```typescript
// Legacy usage
const addresses = await translate.getAddressesByXpub('xpub...');

// With new options (backward compatible)
const addresses = await translate.getAddressesByXpub('xpub...', {
  count: 50,
  addressType: 'SegWit'
});
```

#### Response Format
```typescript
string[] // Array of derived Bitcoin addresses
```

Example response:
```json
[
  "1FZMpLkc9W9hqv5dFvtTPqDwzEP8tZvm7z",
  "1NPBJiJSvdPrRtYt2Y9732Hvvhs5tCAiw9",
  "1AD83uQSNhQ3FMeiigaRAxkGowrnVpHXPk"
]
```

#### Error Handling
The endpoint may return the following errors:

- `TransactionError` with status 400 if:
  - The xpub format is invalid
  - The xpub is not a valid Bitcoin extended public key
- `TransactionError` with status 500 if there's an internal server error

Example error response:
```json
{
  "status": 400,
  "errors": {
    "xpub": ["Invalid xpub format"]
  }
}
```

### getTransaction(chain: string, hash: string, txTypeVersion?: number, viewAsAccountAddress?: string)
Get detailed information about a specific transaction.

**Transaction Formats:**
The API supports two transaction formats:
- **v2 format**: Traditional format with `sent` and `received` arrays in `classificationData` and `timestamp` in `rawTransactionData`
- **v5 format** (default): New format with `transfers` and `values` arrays at the root level and `timestamp` at transaction level

```typescript
// Default v5 format
const txInfo = await translate.getTransaction('btc', '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e');

// Specify v2 format
const txInfoV2 = await translate.getTransaction('btc', '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e', 2);

// v5 format with viewAsAccountAddress parameter
const txInfo = await translate.getTransaction(
  'btc',
  '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e',
  5,
  '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL'
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "btc")
- `hash` (string): The transaction hash
- `txTypeVersion` (number, optional): The transaction format version (2 or 5). Defaults to 5
- `viewAsAccountAddress` (string, optional): The account address to view the transaction from its perspective

#### Response Format
The response format is the same as a single transaction item in the Transactions endpoint response.

### getTokenBalances(chain: string, accountAddress: string, options?: TokenBalanceOptions)
Get token balances for an account address.

```typescript
// Get current balances
const balances = await translate.getTokenBalances('btc', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

// Get balances as of a specific block
const balancesAtBlock = await translate.getTokenBalances('btc', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', {
  blockNumber: 865798
});

// Get balances with custom options
const balancesWithOptions = await translate.getTokenBalances('btc', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', {
  includePrices: true,
  excludeZeroPrices: false
});
```

#### Parameters
- `chain` (string): The chain name (e.g., "btc")
- `accountAddress` (string): The account address to fetch balances for
- `options` (object, optional):
  - `blockNumber` (number, optional): Block number to retrieve balances as of
  - `timestamp` (number, optional): Timestamp to retrieve balances as of
  - `includePrices` (boolean, optional): Whether to include token prices in the response. Default: true
  - `excludeZeroPrices` (boolean, optional): Whether to exclude tokens with zero price. Default: false

#### Response Format
```typescript
interface TokenBalance {
  balance: string;  // Token balance as a string
  token: {
    symbol: string;    // Token symbol (e.g., "BTC")
    name: string;      // Token name (e.g., "Bitcoin")
    decimals: number;  // Number of decimals for the token
    address: string;   // Token address
  };
}
```

Example response:
```json
[
  {
    "balance": "103.06451383",
    "token": {
      "symbol": "BTC",
      "name": "Bitcoin",
      "decimals": 8,
      "address": "BTC"
    }
  }
]
```
