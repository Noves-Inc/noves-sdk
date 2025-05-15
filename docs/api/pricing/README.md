# Pricing API Documentation

The Pricing API provides functionality to retrieve pricing information for tokens across various blockchains.

## Available Ecosystems

The Pricing API supports the following ecosystems:

- [EVM-based blockchains](./evm.md) (Ethereum, Binance Smart Chain, Polygon, etc.)
- [Cosmos-based blockchains](./cosmos.md) (Cosmos Hub, Osmosis, etc.)
- [Move-based blockchains](./move.md) (Aptos, Sui, etc.)

## Getting Started

### Installing the SDK

```bash
npm install @noves/noves-sdk
```

### Basic Usage

```typescript
import { Pricing } from "@noves/noves-sdk";

// Initialize the pricing client for the ecosystem you want to use
const evmPricing = Pricing.evm("YOUR_API_KEY");
const cosmosPricing = Pricing.cosmos("YOUR_API_KEY");
const movePricing = Pricing.move("YOUR_API_KEY");

// Examples
async function examples() {
  // Get supported chains
  const evmChains = await evmPricing.getChains();
  
  // Get token price
  const tokenPrice = await evmPricing.getPrice("eth", "0x1234567890123456789012345678901234567890");
  
  // Get price from a specific pool
  const poolPrice = await evmPricing.getPriceFromPool(
    "eth", 
    "0x1234567890123456789012345678901234567890", // pool address
    "0x0987654321098765432109876543210987654321"  // token address
  );
}
```

## API Reference

For detailed API documentation for each ecosystem, please refer to the specific documentation pages linked above. 