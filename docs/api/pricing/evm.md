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
// Returns: EVMPricingChains
```

#### Response Format
```typescript
interface EVMPricingChain {
  name: string;
  ecosystem: "evm";
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
}

type EVMPricingChains = EVMPricingChain[];
```

Example response:
```json
[
  {
    "name": "eth",
    "ecosystem": "evm",
    "nativeCoin": {
      "name": "ETH",
      "symbol": "ETH",
      "address": "ETH",
      "decimals": 18
    }
  },
  {
    "name": "bsc",
    "ecosystem": "evm",
    "nativeCoin": {
      "name": "BNB",
      "symbol": "BNB",
      "address": "BNB",
      "decimals": 18
    }
  }
]
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
interface EVMPricingResponse {
  chain: string;
  block: string;
  token: {
    address: string;
    symbol: string;
    name: string;
  };
  price: {
    amount: string;
    currency: string;
    status: string;
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
  };
  priceType: string;
  priceStatus: string;
}
```

Example response:
```json
{
  "chain": "eth",
  "block": "22640795",
  "token": {
    "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "symbol": "WETH",
    "name": "Wrapped Ether"
  },
  "price": {
    "amount": "2482.5646628243689774470371336",
    "currency": "USD",
    "status": "resolved"
  },
  "pricedBy": {
    "poolAddress": "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
    "exchange": {
      "name": "Uniswap"
    },
    "liquidity": 110641728.42236452025287110906,
    "baseToken": {
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "symbol": "USDC",
      "name": "USD Coin"
    }
  },
  "priceType": "dexHighestLiquidity",
  "priceStatus": "resolved"
}
```

### getPriceFromPool(chain: string, poolAddress: string, baseTokenAddress: string)
Get the price for a token from a specific liquidity pool.

```typescript
// Get price from a specific pool
const priceFromPool = await evmPricing.getPriceFromPool(
  "eth",
  "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640", // ETH-USDC Uniswap V3 pool
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH
);
```

#### Parameters
- `chain` (string): The chain name (e.g., "eth", "bsc")
- `poolAddress` (string): The address of the liquidity pool
- `baseTokenAddress` (string): The address of the base token to get the price for

#### Response Format
```typescript
interface EVMPricingPoolResponse {
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

Example response:
```json
{
  "chain": "eth",
  "exchange": {
    "name": "Uniswap"
  },
  "poolAddress": "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
  "baseToken": {
    "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "symbol": "WETH",
    "name": "Wrapped Ether",
    "decimals": 18
  },
  "quoteToken": {
    "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "symbol": "USDC",
    "name": "USD Coin",
    "decimals": 6
  },
  "price": {
    "amount": "2426.971529"
  }
}
```

### preFetchPrice(tokens: Array<EVMPricingTokenPrefetchRequest>)
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
- `tokens` (Array<EVMPricingTokenPrefetchRequest>): An array of token objects to pre-fetch prices for
  - `tokenAddress` (string): The address of the token
  - `chain` (string): The chain name (e.g., "eth", "bsc"). For a full list of supported chains, use the getChains() method.
  - `priceType` (string): The type of price to retrieve. You can use the PriceType enum for convenience. See [Pricing Strategies](https://docs.noves.fi/reference/pricing-strategies) for available options.
  - `timestamp` (number): Optional timestamp for historical pricing
  - `blockNumber` (number): Optional block number for historical pricing (only provide one of timestamp or blockNumber)

#### Response Format
Returns Promise<Array<EVMPricingTokenPrefetchResult>>. The response is an array of results for each token in the request, with each result containing:
```typescript
interface EVMPricingTokenPrefetchResult {
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

Example response:
```json
{
  "tokens": [
    {
      "request": {
        "tokenAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "chain": "eth",
        "priceType": "dexHighestLiquidity",
        "timestamp": null,
        "blockNumber": 22640917
      },
      "result": {
        "blockNumber": 22640917,
        "priceStatus": "resolved",
        "token": {
          "symbol": "USDC",
          "name": "USD Coin",
          "decimals": 6,
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
        },
        "price": "0.99973",
        "priceType": "ChainlinkStablePricer",
        "pricedBy": null
      },
      "error": null
    }
  ]
}
```

## Examples

For complete examples, see the [EVM Pricing Examples](../../examples/pricing/evm.ts) file.

## Error Handling

The EVM Pricing API uses standard HTTP error responses. Always wrap your API calls in try-catch blocks:

```typescript
try {
  const chains = await evmPricing.getChains();
  const price = await evmPricing.getPrice("eth", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
} catch (error) {
  console.error('API error:', error);
}
``` 