# EVM Pricing API

The EVM Pricing API provides functionality to interact with price data for Ethereum Virtual Machine (EVM) based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Pricing, PriceType } from "@noves/noves-sdk";

// Initialize the EVM pricing client
const evmPricing = Pricing.evm("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported EVM chains.

```typescript
const chains = await evmPricing.getChains();
// Returns: [{ name: "eth", ecosystem: "evm", nativeCoin: {...} }, ...]
```

### getChain(name: string)
Get detailed information about a specific chain.

```typescript
const chainInfo = await evmPricing.getChain("eth");
```

### getPrice(chain: string, tokenAddress: string, options?: {priceType?: PriceType | string, timestamp?: number, blockNumber?: number})
Get the price for a token on a specified chain. Optionally include parameters for price type, timestamp, or block number.

For a full list of supported pricing strategies, see the [Pricing Strategies](https://docs.noves.fi/reference/pricing-strategies) documentation.

```typescript
// Get current price for a token
const currentPrice = await evmPricing.getPrice(
  "eth",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC
);

// Get historical price by timestamp
const historicalPriceByTime = await evmPricing.getPrice(
  "eth",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  { timestamp: 1625097600 } // July 1, 2021
);

// Get historical price by block number
const historicalPriceByBlock = await evmPricing.getPrice(
  "eth",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  { blockNumber: 12345678 }
);

// Get price with specific price type
const priceWithType = await evmPricing.getPrice(
  "eth",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  { priceType: PriceType.DEX_HIGHEST_LIQUIDITY }
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth", "bsc")
- `tokenAddress` (string): The address of the token to get the price for
- `options` (object): Optional parameters
  - `priceType` (PriceType | string): The type of price to retrieve (defaults to PriceType.DEX_HIGHEST_LIQUIDITY if not specified)
  - `timestamp` (number): The timestamp for which to retrieve the price
  - `blockNumber` (number): The block number for which to retrieve the price

#### Response Format
```typescript
interface Pricing {
  chain: string;
  block: string;
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
  pricedBy: {
    poolAddress: string;
    exchange: {
      name: string;
    };
    liquidity: number;
    baseToken: {
      address: string;
      symbol: string;
      name: string;
    };
  } | string | null;
  priceType: string | null;
  priceStatus: string | null;
}
```

### getPriceFromPool(chain: string, poolAddress: string, baseTokenAddress: string)
Get the price for a token from a specific liquidity pool.

```typescript
// Get price from a specific pool
const priceFromPool = await evmPricing.getPriceFromPool(
  "eth",
  "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // ETH-USDC Uniswap V3 pool
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth", "bsc")
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

### preFetchPrice(tokens: Array<{tokenAddress: string | null, chain: string | null, priceType: PriceType | string | null, timestamp?: number, blockNumber?: number}>)
Pre-fetch prices for multiple tokens in a single request.

This endpoint takes an array of tokens that need pricing. Each token needs an address, a chain identifier, and the type of price desired. Valid values for 'priceType' are: dexHighestLiquidity, coingecko, and others (see Pricing Strategies).

Returns an array of results for each token that you passed. If any of the results have a status of "findingSolution", you can call the regular /price endpoint for a final answer on that token in about ~2 minutes.

```typescript
// Pre-fetch prices for multiple tokens
const tokens = [
  {
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    chain: "eth",
    priceType: PriceType.DEX_HIGHEST_LIQUIDITY
  },
  {
    tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    chain: "eth",
    priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
    // Optional: you can provide timestamp OR blockNumber for historical pricing
    timestamp: 1625097600 // July 1, 2021
  }
];

const preFetchResults = await evmPricing.preFetchPrice(tokens);
// preFetchResults will contain an array of price results for each token
```

#### Parameters
- `tokens` (Array<object>): An array of token objects to pre-fetch prices for
  - `tokenAddress` (string | null): The address of the token
  - `chain` (string | null): The chain name (e.g., "eth", "bsc"). For a full list of supported chains, use the getChains() method.
  - `priceType` (PriceType | string | null): The type of price to retrieve. You can use the PriceType enum for convenience. See [Pricing Strategies](https://docs.noves.fi/reference/pricing-strategies) for available options.
  - `timestamp` (number): Optional timestamp for historical pricing
  - `blockNumber` (number): Optional block number for historical pricing (only provide one of timestamp or blockNumber)

#### Response Format
The response is an array of results for each token in the request, with each result containing:
```typescript
interface PrefetchResult {
  request: {
    tokenAddress: string;
    chain: string;
    priceType: string;
    timestamp: number | null;
    blockNumber: number | null;
  };
  result: {
    blockNumber: number;
    priceStatus: string;
    token: {
      symbol: string;
      name: string;
      decimals: number;
      address: string;
    };
    price: string;
    priceType: string;
    pricedBy: any | null;
  } | null;
  error: string | null;
}
```

## Examples

For complete examples, see the [EVM Pricing Examples](../../examples/pricing/evm.ts) file.

## Error Handling

The EVM Pricing API throws specific error types that you can catch and handle:

```typescript
import { ChainNotFoundError } from "@noves/noves-sdk";

try {
  const chainInfo = await evmPricing.getChain("invalid-chain");
} catch (error) {
  if (error instanceof ChainNotFoundError) {
    console.error('Chain not found:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
``` 