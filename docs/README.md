# Noves SDK Documentation

Welcome to the Noves SDK documentation. This documentation provides comprehensive information about the SDK, its features, and how to use it effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Documentation](./api/README.md)
3. [Examples](./examples/README.md)

## Getting Started

### Installation

```bash
npm install @noves/noves-sdk
```

### Quick Start

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize the SDK with your API key
const translate = Translate.evm("YOUR_API_KEY");

// Get transaction details
const txInfo = await translate.getTransaction(
  "ethereum",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
console.log(txInfo);
```

## Documentation Structure

```
docs/
├── api/                # API documentation
│   ├── translate/     # Translate API docs
│   ├── pricing/       # Pricing API docs
│   └── foresight/     # Foresight API docs
├── examples/          # Code examples
│   ├── translate/     # Translate examples
│   ├── pricing/       # Pricing examples
│   └── foresight/     # Foresight examples
└── README.md          # This file
```

## Features

### Translate API
- Multi-chain support (EVM, Cosmos, Solana, etc.)
- Transaction classification
- Rich transaction metadata
- Token balance tracking
- Pagination support

### Pricing API
- Real-time token prices
- Historical price data
- Pool price queries
- Price feeds

### Foresight API
- Transaction simulation
- Gas estimation
- State overrides
- User operation simulation

## Examples

See the [examples directory](./examples/README.md) for complete working examples for each module.