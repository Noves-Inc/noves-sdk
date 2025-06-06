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

#### Response Format
```typescript
interface MOVEPricingChain {
  name: string;
  ecosystem: string;
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
}
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
interface MOVEPricingPoolResponse {
  chain: string;
  exchange: {
    name: string;
  };
  poolAddress: string;
  baseToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  quoteToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  price: {
    amount: string;
  };
}
```

#### Example Response
```json
{
  "chain": "sui",
  "exchange": {
    "name": "Aftermath Finance"
  },
  "poolAddress": "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
  "baseToken": {
    "address": "0x2::sui::SUI",
    "symbol": "SUI",
    "name": "Sui",
    "decimals": 9
  },
  "quoteToken": {
    "address": "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
    "symbol": "BUCK",
    "name": "Bucket USD",
    "decimals": 9
  },
  "price": {
    "amount": "2.911229208"
  }
}
```

## Error Handling

The SDK throws specific errors for common scenarios:

- `InvalidApiKeyError`: Thrown when an invalid API key is provided
- `RateLimitError`: Thrown when the API rate limit is exceeded
- `404 Error`: Thrown when an invalid pool address or token address is provided

## Type Safety

The Move Pricing API uses strict typing based on actual API responses:

- All fields return actual values (no nullable fields)
- Chain information uses `MOVEPricingChain` interface
- Pool pricing responses use `MOVEPricingPoolResponse` interface
- Native coin information follows the actual API response structure
- API either returns valid data or throws an error (no partial/null responses) 