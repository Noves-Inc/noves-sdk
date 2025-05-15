# Cosmos Pricing API

The Cosmos Pricing API provides functionality to interact with price data for Cosmos-based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Pricing, PriceType } from "@noves/noves-sdk";

// Initialize the Cosmos pricing client
const cosmosPricing = Pricing.cosmos("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported Cosmos chains.

```typescript
const chains = await cosmosPricing.getChains();
// Returns: [{ name: "secret", ecosystem: "cosmos", nativeCoin: {...} }, ...]
```

### getChain(name: string)
Get detailed information about a specific chain.

```typescript
const chainInfo = await cosmosPricing.getChain("secret");
```

### getPrice(chain: string, tokenAddress: string, options?: {priceType?: PriceType | string, timestamp?: number})
Get the price for a token on a specified chain. Optionally include parameters for price type or timestamp.

For a full list of supported pricing strategies, see the [Pricing Strategies](https://docs.noves.fi/reference/pricing-strategies) documentation.

```typescript
// Get current price for a token
const currentPrice = await cosmosPricing.getPrice(
  "secret",
  "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek" // SCRT
);

// Get historical price by timestamp
const historicalPriceByTime = await cosmosPricing.getPrice(
  "secret",
  "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek",
  { timestamp: 1625097600 } // July 1, 2021
);

// Get price with specific price type
const priceWithType = await cosmosPricing.getPrice(
  "secret",
  "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek",
  { priceType: PriceType.DEX_HIGHEST_LIQUIDITY }
);
```

### getPriceFromPool(chain: string, poolAddress: string, baseTokenAddress: string)
Get the price for a token from a specific liquidity pool.

```typescript
// Get price from a specific pool
const priceFromPool = await cosmosPricing.getPriceFromPool(
  "secret",
  "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj", // pool address
  "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm"  // base token address
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "secret", "osmosis")
- `poolAddress` (string): The address of the liquidity pool
- `baseTokenAddress` (string): The address of the base token to get the price for

#### Response Format
```typescript
interface PoolPricing {
  chain: string | null;
  exchange: {
    name: string | null;
  };
  poolAddress: string | null;
  baseToken: {
    address: string | null;
    symbol: string | null;
    name: string | null;
    decimals: number | null;
  };
  quoteToken: {
    address: string | null;
    symbol: string | null;
    name: string | null;
    decimals: number | null;
  };
  price: {
    amount: string | null;
  };
}
```

## Error Handling

The SDK provides specific error types for common error scenarios:

```typescript
import { ChainNotFoundError } from "@noves/noves-sdk";

try {
  const chain = await cosmosPricing.getChain("invalid-chain");
} catch (error) {
  if (error instanceof ChainNotFoundError) {
    console.error("Chain not found:", error.message);
  }
}
``` 