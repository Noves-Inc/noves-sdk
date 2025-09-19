# Exchange Translate API

The Exchange Translate API provides functionality to interact with centralized cryptocurrency exchanges.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize the Exchange translator
const exchangeTranslate = Translate.exchange("YOUR_API_KEY");
```

## API Reference

### getExchanges()
Returns a list of supported exchanges that can be used with the Exchange Translate API.

```typescript
const exchanges = await exchangeTranslate.getExchanges();
```

#### Response Format
```typescript
interface ExchangeTranslateExchange {
  name: string;
  ecosystem: "exchange";
  tier: number;
}

type ExchangeTranslateExchanges = ExchangeTranslateExchange[];
```

#### Example Response
```typescript
[
  {
    name: "hyperliquid",
    ecosystem: "exchange",
    tier: 2
  }
]
```

#### Field Descriptions
- `name`: The exchange identifier used in other API calls
- `ecosystem`: Always "exchange" for centralized exchanges
- `tier`: Support tier level (1 = full support, 2 = basic support)

### getAccounts(exchange: string, authRequest: ExchangeTranslateAuthRequest)
Returns the accounts available for the requested exchange using the provided credentials.

```typescript
const authRequest = {
  auth: {
    apiKey: "YOUR_EXCHANGE_API_KEY",
    walletAddress: "0x1234567890123456789012345678901234567890",
    testnet: false
  }
};

const accounts = await exchangeTranslate.getAccounts("hyperliquid", authRequest);
```

#### Request Format
```typescript
interface ExchangeTranslateAuthRequest {
  auth: {
    apiKey: string;
    walletAddress: string;
    testnet?: boolean;
  };
}
```

#### Response Format
```typescript
interface ExchangeTranslateAccount {
  id: string;
  type: string;
  name: string;
  code: string;
}

interface ExchangeTranslateAccountsResponse {
  accounts: ExchangeTranslateAccount[];
}
```

#### Example Response
```typescript
{
  accounts: [
    {
      id: "0x1234567890123456789012345678901234567890",
      type: "spot",
      name: "HyperLiquid Account (0x1234567890123456789012345678901234567890)",
      code: "USDC"
    }
  ]
}
```

#### Parameters
- `exchange`: The exchange name (from getExchanges())
- `authRequest`: Authentication credentials for the exchange

#### Field Descriptions
- `id`: Unique identifier for the account
- `type`: Account type (e.g., "spot", "futures")
- `name`: Human-readable account name
- `code`: Account currency or denomination

### getBalances(exchange: string, authRequest: ExchangeTranslateAuthRequest)
Returns the token balances for the requested exchange account.

```typescript
const authRequest = {
  auth: {
    apiKey: "YOUR_EXCHANGE_API_KEY",
    walletAddress: "0x1234567890123456789012345678901234567890",
    testnet: false
  }
};

const balances = await exchangeTranslate.getBalances("hyperliquid", authRequest);
```

#### Response Format
```typescript
interface ExchangeTranslateToken {
  symbol: string;
  name: string;
  decimals: string;
}

interface ExchangeTranslateBalance {
  balance: string;
  token: ExchangeTranslateToken;
}

interface ExchangeTranslateBalancesResponse {
  balances: ExchangeTranslateBalance[];
}
```

#### Example Response
```typescript
{
  balances: [
    {
      balance: "0.000280",
      token: {
        symbol: "BTC-PERP",
        name: "BTC-PERP",
        decimals: "8"
      }
    },
    {
      balance: "13.740014",
      token: {
        symbol: "USDC",
        name: "USD Coin",
        decimals: "6"
      }
    }
  ]
}
```

#### Parameters
- `exchange`: The exchange name (from getExchanges())
- `authRequest`: Authentication credentials for the exchange

#### Field Descriptions
- `balance`: The token balance as a string
- `token.symbol`: Token symbol (e.g., "USDC", "BTC-PERP")
- `token.name`: Full token name
- `token.decimals`: Number of decimal places for the token

### getTransactions(exchange: string, authRequest: ExchangeTranslateAuthRequest, pageOptions?: ExchangeTranslatePageOptions)
Returns all transactions for the requested exchange and account. This includes deposits/bridge transactions, as well as trades and withdrawals.

```typescript
const authRequest = {
  auth: {
    apiKey: "YOUR_EXCHANGE_API_KEY",
    walletAddress: "0x1234567890123456789012345678901234567890",
    testnet: false
  }
};

// Get all transactions
const transactions = await exchangeTranslate.getTransactions("hyperliquid", authRequest);

// Get transactions with pagination and filtering
const filteredTransactions = await exchangeTranslate.getTransactions("hyperliquid", authRequest, {
  startTimestamp: 1756000000000,
  endTimestamp: 1756500000000,
  pageSize: 10,
  pageKey: "nextPageKey"
});
```

#### Page Options Format
```typescript
interface ExchangeTranslatePageOptions {
  startTimestamp?: number;
  endTimestamp?: number;
  pageSize?: number;
  pageKey?: string;
}
```

#### Response Format
```typescript
interface ExchangeTranslateTransaction {
  txTypeVersion: number;
  source: {
    type: string;
  };
  chain: string;
  timestamp: number;
  classificationData: {
    type: string;
  };
  transfers: ExchangeTranslateTransfer[];
  values: ExchangeTranslateValue[];
  rawTransactionData: {
    status: string;
    destinationTx: {
      chain: string;
      to: string | null;
      transactionHash: string;
      timestamp: number;
    };
  };
}

interface ExchangeTranslateTransactionsResponse {
  items: ExchangeTranslateTransaction[];
  pageSize: number;
  hasNextPage: boolean;
  nextPageUrl?: string;
}
```

#### Example Response
```typescript
{
  items: [
    {
      txTypeVersion: 6,
      source: {
        type: "human"
      },
      chain: "hyperliquid",
      timestamp: 1756419311861,
      classificationData: {
        type: "sendToBridge"
      },
      transfers: [
        {
          action: "withdrawalDebited",
          from: {
            name: "Exchange Account",
            address: null
          },
          to: {
            name: "External Wallet",
            address: null
          },
          amount: 1.0,
          asset: {
            symbol: "USDC"
          }
        }
      ],
      values: [],
      rawTransactionData: {
        status: "complete",
        destinationTx: {
          chain: "hyperliquid",
          to: null,
          transactionHash: "0x6ae570f80af6236b12e57d810fa7e4f11e63560dd20cfe3d28f06b9d4af3e7e3",
          timestamp: 1756419311861
        }
      }
    }
  ],
  pageSize: 2,
  hasNextPage: false
}
```

#### Parameters
- `exchange`: The exchange name (from getExchanges())
- `authRequest`: Authentication credentials for the exchange
- `pageOptions` (optional): Pagination and filtering options
  - `startTimestamp`: Filter transactions after this timestamp
  - `endTimestamp`: Filter transactions before this timestamp
  - `pageSize`: Number of transactions to return per page
  - `pageKey`: Page key for pagination

#### Field Descriptions
- `txTypeVersion`: Version of the transaction format (currently 6)
- `source.type`: Source of the transaction (e.g., "human")
- `chain`: Exchange name or chain identifier
- `timestamp`: Transaction timestamp in milliseconds
- `classificationData.type`: Type of transaction (e.g., "sendToBridge")
- `transfers`: Array of asset transfers in the transaction
- `values`: Additional value information (currently empty)
- `rawTransactionData`: Raw transaction details including status and destination info
- `pageSize`: Number of items per page
- `hasNextPage`: Whether there are more pages of results
- `nextPageUrl`: URL for retrieving the next page (if hasNextPage is true)

## Examples

### Basic Usage
```typescript
import { Translate } from "@noves/noves-sdk";

const exchangeTranslate = Translate.exchange("YOUR_API_KEY");

// Get available exchanges
const exchanges = await exchangeTranslate.getExchanges();
console.log("Available exchanges:", exchanges);

// Set up authentication for HyperLiquid
const authRequest = {
  auth: {
    apiKey: "YOUR_HYPERLIQUID_API_KEY",
    walletAddress: "0x1234567890123456789012345678901234567890",
    testnet: false
  }
};

// Get accounts
const accounts = await exchangeTranslate.getAccounts("hyperliquid", authRequest);
console.log("Available accounts:", accounts);

// Get balances
const balances = await exchangeTranslate.getBalances("hyperliquid", authRequest);
console.log("Account balances:", balances);

// Get recent transactions
const transactions = await exchangeTranslate.getTransactions("hyperliquid", authRequest);
console.log("Recent transactions:", transactions);
```

### Paginated Transaction Retrieval
```typescript
// Get transactions with specific time range and pagination
const pageOptions = {
  startTimestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // Last 7 days
  endTimestamp: Date.now(),
  pageSize: 50
};

let allTransactions = [];
let hasMore = true;
let currentPageKey = undefined;

while (hasMore) {
  const response = await exchangeTranslate.getTransactions("hyperliquid", authRequest, {
    ...pageOptions,
    pageKey: currentPageKey
  });
  
  allTransactions.push(...response.items);
  hasMore = response.hasNextPage;
  
  // Extract pageKey from nextPageUrl if present
  if (response.nextPageUrl) {
    const url = new URL(response.nextPageUrl);
    currentPageKey = url.searchParams.get('pageKey') || undefined;
  } else {
    currentPageKey = undefined;
  }
}

console.log(`Retrieved ${allTransactions.length} transactions`);
```

## Error Handling

The Exchange Translate API uses the same error handling patterns as other Noves SDK modules. All methods can throw `TransactionError` instances with detailed error information.

```typescript
import { TransactionError } from "@noves/noves-sdk";

try {
  const exchanges = await exchangeTranslate.getExchanges();
} catch (error) {
  if (error instanceof TransactionError) {
    console.error("API Error:", error.message);
    console.error("Error Type:", error.errorType);
    console.error("Status Code:", error.statusCode);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Common Error Scenarios

1. **Invalid API Key**: Thrown when the Noves API key is invalid
2. **Invalid Exchange Credentials**: Thrown when exchange-specific credentials are invalid
3. **Rate Limiting**: Thrown when API rate limits are exceeded
4. **Exchange Not Supported**: Thrown when requesting data for an unsupported exchange
5. **Network Errors**: Thrown when network connectivity issues occur

### Authentication Requirements

**Important**: For exchange API calls (getAccounts, getBalances, getTransactions), you need to provide valid exchange-specific credentials:

- For **HyperLiquid**: You need an API key generated from the HyperLiquid portal and the associated wallet address
- The `testnet` flag determines whether to use testnet or mainnet credentials
- Never expose sensitive API keys in client-side code or public repositories

For more detailed error handling information, see the [Error Handling Guide](../../error-handling.md).
