# Cosmos Pricing API

The Cosmos Pricing API provides functionality to interact with price data for Cosmos-based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Pricing } from "@noves/noves-sdk";

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

### getPriceFromPool(chain: string, poolAddress: string, baseTokenAddress: string)
Get the price for a token from a specific liquidity pool.

```typescript
const poolPrice = await cosmosPricing.getPriceFromPool(
  "secret",
  "0x...", // pool address
  "0x..." // base token address
);
```

## Error Handling

The SDK throws specific errors for common scenarios:

- `ChainNotFoundError`: Thrown when a requested chain is not supported
- `InvalidApiKeyError`: Thrown when an invalid API key is provided
- `RateLimitError`: Thrown when the API rate limit is exceeded 