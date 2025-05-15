# SVM Pricing API

The SVM Pricing API provides functionality to interact with price data for Solana Virtual Machine (SVM) based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Pricing, PriceType } from "@noves/noves-sdk";

// Initialize the SVM pricing client
const svmPricing = Pricing.svm("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported SVM chains.

```typescript
const chains = await svmPricing.getChains();
// Returns: [{ name: "solana", ecosystem: "svm", nativeCoin: {...} }, ...]
```

### getChain(name: string)
Get detailed information about a specific chain.

```typescript
const chainInfo = await svmPricing.getChain("solana");
```

### getPrice(chain: string, tokenAddress: string, options?: {priceType?: PriceType | string, timestamp?: number})
Get the price for a token on a specified chain. Optionally include parameters for price type or timestamp.

For a full list of supported pricing strategies, see the [Pricing Strategies](https://docs.noves.fi/reference/pricing-strategies) documentation.

```typescript
// Get current price for a token
const currentPrice = await svmPricing.getPrice(
  "solana",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // USDC
);

// Get historical price by timestamp
const historicalPriceByTime = await svmPricing.getPrice(
  "solana",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  { timestamp: 1625097600 } // July 1, 2021
);

// Get price with specific price type
const priceWithType = await svmPricing.getPrice(
  "solana",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  { priceType: PriceType.DEX_HIGHEST_LIQUIDITY }
);

// Get price using weighted volume average strategy
const weightedAvgPrice = await svmPricing.getPrice(
  "solana",
  "So11111111111111111111111111111111111111112", // Wrapped SOL
  { priceType: PriceType.WEIGHTED_VOLUME_AVERAGE }
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "solana")
- `tokenAddress` (string): The address of the token to get the price for
- `options` (object): Optional parameters
  - `priceType` (PriceType | string): The type of price to retrieve (defaults to PriceType.DEX_HIGHEST_LIQUIDITY if not specified)
  - `timestamp` (number): The timestamp for which to retrieve the price

#### Response Format
```typescript
interface Pricing {
  chain: string;
  token: {
    address: string | null;
    symbol: string | null;
    name: string | null;
  };
  price: {
    amount: string | null;
    currency: string | null;
    status: string | null;
  };
  priceType: string | null;
  priceStatus: string | null;
}
```

Example response:
```json
{
  "chain": "solana",
  "token": {
    "address": "So11111111111111111111111111111111111111112",
    "symbol": "WSOL",
    "name": "Wrapped SOL"
  },
  "price": {
    "amount": "171.3118684318626",
    "currency": "USD",
    "status": "resolved"
  },
  "priceType": "weightedVolumeAverage",
  "priceStatus": "resolved"
}
```

## Examples
For complete examples, see the [SVM Pricing Examples](../../examples/pricing/svm.ts).

## Error Handling
The SVM Pricing API can throw various errors:

- `ChainNotFoundError`: Thrown when a requested chain is not found
- Network-related errors when API requests fail

```typescript
import { ChainNotFoundError } from "@noves/noves-sdk";

try {
  const chainInfo = await svmPricing.getChain("invalid-chain");
} catch (error) {
  if (error instanceof ChainNotFoundError) {
    console.error("Chain not found:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
``` 