# Cosmos Pricing API

The Cosmos Pricing API provides functionality to interact with price data for Cosmos-based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Type Definitions](#type-definitions)
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

**Returns:** `Promise<COSMOSPricingChainsResponse>`

```typescript
const chains = await cosmosPricing.getChains();
// Returns: [{ name: "secret", ecosystem: "cosmos", nativeCoin: {...} }, ...]
```

**Example Response:**
```typescript
[
  {
    name: "secret",
    ecosystem: "cosmos",
    nativeCoin: {
      name: "SCRT",
      symbol: "SCRT", 
      address: "SCRT",
      decimals: 6
    }
  }
]
```



### getPriceFromPool(chain: string, poolAddress: string, baseTokenAddress: string)
Get the price for a token from a specific liquidity pool.

**Parameters:**
- `chain` (string): The name of the chain
- `poolAddress` (string): The address of the pool
- `baseTokenAddress` (string): The address of the base token

**Returns:** `Promise<COSMOSPricingPoolPricing>`

```typescript
const poolPrice = await cosmosPricing.getPriceFromPool(
  "secret",
  "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj", // pool address
  "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm" // base token address
);
```

**Example Response:**
```typescript
{
  "chain": "secret",
  "exchange": {
    "name": null
  },
  "poolAddress": "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj",
  "baseToken": {
    "address": "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
    "symbol": "SHD",
    "name": "Shade",
    "decimals": 8
  },
  "quoteToken": {
    "address": "secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
    "symbol": "SILK",
    "name": "Silk Stablecoin",
    "decimals": 6
  },
  "price": {
    "amount": "0.613678"
  }
}
```

## Type Definitions

### COSMOSPricingChain
```typescript
interface COSMOSPricingChain {
  name: string;
  ecosystem: string;
  nativeCoin: COSMOSPricingNativeCoin;
}
```

### COSMOSPricingNativeCoin
```typescript
interface COSMOSPricingNativeCoin {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}
```

### COSMOSPricingPoolPricing
```typescript
interface COSMOSPricingPoolPricing {
  chain: string;
  exchange: COSMOSPricingExchange;
  poolAddress: string;
  baseToken: COSMOSPricingToken;
  quoteToken: COSMOSPricingToken;
  price: COSMOSPricingPrice;
}
```

### COSMOSPricingToken
```typescript
interface COSMOSPricingToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}
```

### COSMOSPricingExchange
```typescript
interface COSMOSPricingExchange {
  name: string | null;
}
```

### COSMOSPricingPrice
```typescript
interface COSMOSPricingPrice {
  amount: string;
}
```

## Error Handling

The SDK throws specific errors for common scenarios:

- `InvalidApiKeyError`: Thrown when an invalid API key is provided
- `RateLimitError`: Thrown when the API rate limit is exceeded 