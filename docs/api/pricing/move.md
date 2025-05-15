# Move Pricing API

The Move Pricing API provides functionality to interact with price data for Move-based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Pricing } from "@noves/noves-sdk";

// Initialize the Move pricing client
const movePricing = Pricing.move("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported Move chains.

```typescript
const chains = await movePricing.getChains();
// Returns: [{ name: "sui", ecosystem: "move", nativeCoin: {...} }, ...]
```

### getChain(name: string)
Get detailed information about a specific chain.

```typescript
const chainInfo = await movePricing.getChain("sui");
```

### getPriceFromPool(chain: string, poolAddress: string, baseTokenAddress: string)
Get the price for a token from a specific liquidity pool.

```typescript
// Get price from a specific pool
const priceFromPool = await movePricing.getPriceFromPool(
  "sui",
  "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026", // SUI-BUCK Aftermath Finance pool
  "0x2::sui::SUI"  // SUI token
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "sui")
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

The SDK throws specific errors for common scenarios:

- `ChainNotFoundError`: Thrown when a requested chain is not supported
- `InvalidApiKeyError`: Thrown when an invalid API key is provided
- `RateLimitError`: Thrown when the API rate limit is exceeded 