<p align="center" style="padding: 10px 0;">
  <img src="assets/noves-logo.png" width="300" alt="noves" />
</p>

# **Noves SDK** 🚀

This is the **official SDK** for interacting with the [Noves API](https://docs.noves.fi/reference/api-overview).

## Table of Contents 📑

- [Overview](#overview)
- [Documentation](#documentation)
- [Supported Ecosystems](#supported-ecosystems)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
  - [Initialize SDK](#initialize-the-sdk)
  - [Get Supported Chains](#get-supported-chains)
  - [Transaction Information](#transaction-information)
  - [Token Balances](#token-balances)
  - [Pagination Examples](#pagination-examples)
  - [Transaction History](#transaction-history)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Support](#support)

## Overview 💡

**The Noves SDK is a powerful toolkit that streamlines your interaction with complex blockchain data.** By providing a user-friendly interface to the underlying Noves API, the SDK empowers developers to efficiently extract meaningful insights from on-chain activity.

### Translate 🔄

The [Noves Translate Module](https://docs.noves.fi/reference/translate-api-quickstart) categorize transactions, standardizing them across chains and across protocols to produce a rich set of data that allows you to easily answer the question **"what did this transaction do?"**. By leveraging the Translate library, you can effortlessly:

- **Classify transactions**: Understand the purpose of transactions with clear labels (e.g., "Claimed 100 USDC in rewards").
- **Standardize data**: Compare transactions across different blockchains and protocols.
- **Access rich metadata**: Obtain detailed information about involved assets, including type, contract address, and more.

### Foresight 🔮

[Foresight Module](https://docs.noves.fi/reference/foresight-api-quickstart) is our transaction pre-sign insights product. Leveraging the same processing layer underneath the Translate API, the [Foresight API](https://docs.noves.fi/reference/foresight-api-quickstart) **will tell you what a transaction is about to do**, before it is executed.

- **Describe Endpoints**: These lightweight endpoints provide a concise English description of the impending transaction, giving you a quick understanding of its purpose.
- **Simulate Endpoints**: Go deeper with full transaction simulations. This endpoint mimics the execution and then classifies it just like the Translate API would for a real transaction. Additionally, it returns a detailed description and labels associated with each asset transfer (e.g., "You're about to stake 2 ETH and claim 100 USDC in rewards").

### Pricing 💰

The [Noves Pricing Module](https://docs.noves.fi/reference/pricing-api-quickstart) provides real-time and historical pricing data for tokens across different chains. It offers various endpoints to fetch prices from different sources and with different parameters:

- **Get token prices**: Fetch current or historical token prices across chains
- **Query specific pools**: Get prices directly from liquidity pools
- **Pre-fetch multiple prices**: Optimize performance by fetching prices in bulk
- **Multiple price sources**: Support for DEX liquidity pools and CoinGecko
- **Multiple ecosystems**: Support for EVM, Cosmos, and Move chains

### Pricing Examples

The SDK supports pricing for multiple ecosystems. Here's how to use each:

#### EVM Pricing

```typescript
import { PricingEVM } from "@noves/noves-sdk";

// Initialize the EVM pricing module
const pricingEVM = new PricingEVM("YOUR_API_KEY");

// Get current price
const currentPrice = await pricingEVM.getPrice(
  "eth",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" // WETH
);

// Get historical price
const historicalPrice = await pricingEVM.getPrice(
  "eth",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  {
    blockNumber: 17000000,
    priceType: "dexHighestLiquidity",
  }
);

// Query specific pool
const poolPrice = await pricingEVM.getPriceFromPool(
  "eth",
  "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // USDC/ETH Pool
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" // WETH
);
```

#### Cosmos Pricing

```typescript
import { PricingCosmos } from "@noves/noves-sdk";

// Initialize the Cosmos pricing module
const pricingCosmos = new PricingCosmos("YOUR_API_KEY");

// Get token price
const atomPrice = await pricingCosmos.getPrice(
  "cosmos",
  "uatom" // ATOM token
);
```

#### Move Pricing

```typescript
import { PricingMove } from "@noves/noves-sdk";

// Initialize the Move pricing module
const pricingMove = new PricingMove("YOUR_API_KEY");

// Get token price
const aptPrice = await pricingMove.getPrice(
  "aptos",
  "APT" // Aptos native token
);
```

#### Pre-fetch Multiple Prices (EVM Example)

```typescript
const tokens = [
  {
    chain: "eth",
    tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    priceType: "dexHighestLiquidity",
  },
  {
    chain: "polygon",
    tokenAddress: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    priceType: "dexHighestLiquidity",
    blockNumber: 47000000,
  },
];

const prices = await pricingEVM.preFetchPrice(tokens);
```

### Supported Price Types

The Pricing module supports different price sources:

- `dexHighestLiquidity`: Prices from DEX pools with highest liquidity
- `coingecko`: Prices from CoinGecko (where available)

### Error Handling

```typescript
try {
  const price = await pricingEVM.getPrice("eth", "invalid-token");
} catch (error) {
  if (error instanceof ChainNotFoundError) {
    console.error("Invalid chain specified:", error.message);
  } else {
    console.error("Error fetching price:", error);
  }
}
```

## Documentation

Browse the full documentation:

- [API Documentation](https://docs.noves.fi/reference/translate-api-quickstart)
- [Getting Started](https://docs.noves.fi/reference/translate-api-quickstart)

## Supported Ecosystems 🌐

The Noves SDK provides support for multiple blockchain ecosystems through specialized modules:

### EVM (Ethereum Virtual Machine)

```typescript
import { Translate } from "@noves/noves-sdk";
const evmTranslate = Translate.evm("YOUR_API_KEY");

// Supports chains like:
// - Ethereum
// - Polygon
// - Arbitrum
// - Optimism
// - BNB Chain
// and more...
```

### Other Supported Ecosystems

```typescript
// Solana (SVM)
const solanaTranslate = Translate.svm("YOUR_API_KEY");

// Cosmos
const cosmosTranslate = Translate.cosmos("YOUR_API_KEY");

// UTXO (Bitcoin-like)
const utxoTranslate = Translate.utxo("YOUR_API_KEY");

// TRON (TVM)
const tvmTranslate = Translate.tvm("YOUR_API_KEY");

// Polkadot
const polkadotTranslate = Translate.polkadot("YOUR_API_KEY");
```

Each ecosystem module provides the same consistent interface while handling the underlying differences between blockchain architectures.

## Installation

---

You can install the SDK using npm:

```bash
npm install @noves/noves-sdk
```

## Usage Examples

The Noves SDK provides a comprehensive set of tools to interact with blockchain data. Below are detailed examples of how to use the main features of the SDK.

### Initialize the SDK

First, you'll need to initialize the SDK with your API key. You can obtain an API key by signing up at [Noves Platform](https://docs.noves.fi).

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize the EVM translator with your API key
const translate = Translate.evm("YOUR_API_KEY");
```

### Get Supported Chains

The SDK supports multiple EVM-compatible chains. You can query available chains and get specific chain information:

```typescript
// Get all supported chains
const chains = await translate.getChains();
// Returns an array of supported chains with their details:
// [
//   { ecosystem: "evm", evmChainId: 1, name: "eth" },
//   { ecosystem: "evm", evmChainId: 137, name: "polygon" },
//   ...
// ]

// Get specific chain info
const ethChain = await translate.getChain("eth");
// Returns detailed information about Ethereum chain:
// {
//   ecosystem: "evm",
//   evmChainId: 1,
//   name: "eth",
//   // ... additional chain metadata
// }
```

### Transaction Information

The SDK provides two ways to get transaction information: detailed and simplified. This is particularly useful when building transaction explorers or wallet interfaces.

```typescript
// Get detailed transaction information
const txInfo = await translate.getTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
// Returns comprehensive transaction data including:
// - Raw transaction data
// - Decoded input data
// - Asset transfers
// - Protocol interactions
// - Gas usage and more

// Get simplified transaction description
// Useful for displaying user-friendly transaction summaries
const txDescription = await translate.describeTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
// Returns a human-readable description:
// {
//   type: "addLiquidity",
//   description: "Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool."
// }
```

### Token Balances

Query token balances for any address across multiple tokens in a single call. This is particularly useful for portfolio tracking or wallet applications.

```typescript
// Define the tokens you want to check
const tokens = [
  "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", // ENS
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
];

// Get token balances for an address
const balances = await translate.getTokenBalances(
  "eth",
  "0x9B1054d24dC31a54739B6d8950af5a7dbAa56815",
  tokens
);
// Returns detailed balance information for each token:
// [
//   {
//     balance: "1000000000000000000", // Raw balance
//     token: {
//       symbol: "WETH",
//       name: "Wrapped Ether",
//       decimals: 18,
//       address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
//     }
//   },
//   // ... other token balances
// ]
```

### Pagination Examples

The SDK provides powerful pagination capabilities for handling large datasets efficiently. This is essential when working with blockchain history or transaction lists.

```typescript
// Get transactions with default pagination (10 items per page)
const txPaginator = await translate.Transactions(
  "eth",
  "0xA1EFa0adEcB7f5691605899d13285928AE025844"
);

// Get current page transactions
const currentTxs = txPaginator.getTransactions();

// Check if there are more pages and load them
const hasMorePages = await txPaginator.next();

// For more control, use custom pagination options
const customPaging = {
  startBlock: 20104079, // Start from specific block
  sort: "desc", // Sort direction (desc/asc)
  limit: 20, // Items per page
};

const customPaginator = await translate.Transactions(
  "eth",
  "0xA1EFa0adEcB7f5691605899d13285928AE025844",
  customPaging
);
```

### Transaction History

The History endpoint provides a comprehensive view of an address's transaction history, with built-in pagination support.

```typescript
// Get transaction history with automatic pagination
const historyPaginator = await translate.History(
  "eth",
  "0xA1EFa0adEcB7f5691605899d13285928AE025844"
);

// Get current page history (returns up to 100 transactions)
const currentHistory = historyPaginator.getTransactions();

// Example: Process all historical transactions
while (await historyPaginator.next()) {
  const pageTransactions = historyPaginator.getTransactions();
  for (const tx of pageTransactions) {
    console.log(`Transaction ${tx.hash}: ${tx.description}`);
    // Process each transaction as needed...
  }
}
```

### Error Handling

The SDK provides detailed error handling to help you manage various edge cases and API responses:

```typescript
try {
  const tx = await translate.getTransaction("eth", "invalid-hash");
} catch (error) {
  if (error instanceof TransactionError) {
    console.error("Transaction validation failed:", error.errors);
    // Handle specific validation errors
    // e.g., invalid transaction hash, unsupported chain, etc.
  } else if (error instanceof ChainNotFoundError) {
    console.error("Invalid chain specified:", error.message);
    // Handle invalid chain errors
    // e.g., show supported chains to the user
  } else {
    console.error("Unexpected error:", error);
    // Handle other types of errors
  }
}
```

## API Reference

### TranslateEVM Class

The main class for interacting with EVM-compatible blockchains.

#### Methods

- `getChains()`: Returns supported EVM chains
- `getChain(name: string)`: Returns specific chain information
- `getTransaction(chain: string, txHash: string)`: Returns full transaction details
- `describeTransaction(chain: string, txHash: string, viewAsAccountAddress?: string)`: Returns simplified transaction description
- `getTokenBalances(chain: string, accountAddress: string, tokens: string[], block?: number)`: Returns token balances
- `Transactions(chain: string, walletAddress: string, pageOptions?: PageOptions)`: Returns paginated transaction list
- `History(chain: string, walletAddress: string, pageOptions?: PageOptions)`: Returns paginated transaction history

### Pagination Classes

Both `TransactionsPage` and `HistoryPage` provide methods for navigating through paginated results:

- `getTransactions()`: Returns current page transactions
- `getCurrentPageKeys()`: Returns current pagination keys
- `getNextPageKeys()`: Returns next page keys
- `next()`: Loads next page of results

## Support

Feel free to join our [Telegram community](https://t.me/+tsK4RSu0Q1VjNzVh) to get help or feedback.
