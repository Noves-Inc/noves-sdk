# UTXO Pricing API

The UTXO Pricing API provides functionality to interact with price data for Unspent Transaction Output (UTXO) based blockchains.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Pricing, PriceType } from "@noves/noves-sdk";

// Initialize the UTXO pricing client
const utxoPricing = Pricing.utxo("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported UTXO chains.

```typescript
const chains = await utxoPricing.getChains();
// Returns: UTXOPricingChainsResponse
```

**Response Type:** `UTXOPricingChainsResponse`

```typescript
interface UTXOPricingChain {
  name: string;
  ecosystem: 'utxo';
  nativeCoin: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  };
}

type UTXOPricingChainsResponse = UTXOPricingChain[];
```

Example response:
```json
[
  {
    "name": "btc",
    "ecosystem": "utxo",
    "nativeCoin": {
      "name": "BTC",
      "symbol": "BTC",
      "address": "BTC",
      "decimals": 8
    }
  },
  {
    "name": "cardano",
    "ecosystem": "utxo",
    "nativeCoin": {
      "name": "ADA",
      "symbol": "ADA",
      "address": "ADA",
      "decimals": 6
    }
  }
]
```

### getPrice()
Returns the price for any token at the given timestamp. If no timestamp is passed, the price for the latest block will be returned.

```typescript
const price = await utxoPricing.getPrice(
  "btc",           // chain
  "bitcoin",       // token identifier
  {                // optional parameters
    priceType: PriceType.WEIGHTED_VOLUME_AVERAGE,
    timestamp: 1640995200
  }
);
// Returns: UTXOPricingPrice
```

**Parameters:**
- `chain` (string): The name of the chain to retrieve pricing for
- `token` (string): The token identifier to retrieve pricing for
- `options` (optional object):
  - `priceType` (PriceType | string): The type of price to retrieve (defaults to `PriceType.WEIGHTED_VOLUME_AVERAGE`)
  - `timestamp` (number): The timestamp for which to retrieve the price

**Pricing Strategies:**
See [Pricing Strategies Documentation](https://docs.noves.fi/reference/pricing-strategies) for all available strategies.

- `PriceType.DEX_HIGHEST_LIQUIDITY` - Uses the liquidity pool with the highest liquidity
- `PriceType.COINGECKO` - Uses Coingecko as a price source
- `PriceType.CUSTOM` - Uses a custom strategy
- `PriceType.WEIGHTED_VOLUME_AVERAGE` - Uses a weighted volume average across exchanges

**Response Type:** `UTXOPricingPrice`

```typescript
interface UTXOPricingToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

interface UTXOPricingPriceInfo {
  amount: string;
  currency: string;
  status: string;
}

interface UTXOPricingPrice {
  chain: string;
  token: UTXOPricingToken;
  price: UTXOPricingPriceInfo;
  priceType: string;
  priceStatus: string;
}
```

Example response:
```json
{
  "chain": "btc",
  "token": {
    "symbol": "BTC",
    "name": "Bitcoin",
    "address": "btc",
    "decimals": 8
  },
  "price": {
    "amount": "103780.71410240",
    "currency": "USD",
    "status": "resolved"
  },
  "priceType": "weightedVolumeAverage",
  "priceStatus": "resolved"
}
```

## Examples
For complete examples, see the [UTXO Pricing Examples](../../examples/pricing/utxo.ts).

## Error Handling
The UTXO Pricing API can throw various errors:

- Network-related errors when API requests fail
- Invalid parameters or authentication errors

```typescript
try {
  const price = await utxoPricing.getPrice("btc", "bitcoin");
} catch (error) {
  console.error("API error:", error.message);
}
``` 