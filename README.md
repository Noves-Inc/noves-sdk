<p align="center" style="padding: 10px 0;">
  <img src="https://raw.githubusercontent.com/Noves-Inc/noves-sdk/refs/heads/main/assets/noves-logo.png" width="300" alt="Noves Logo" />
</p>

# Noves SDK 🚀

The official SDK for interacting with the [Noves API](https://docs.noves.fi/reference/api-overview).

## 🌟 Features

- **Translate**: Understand what transactions do with clear labels and rich metadata
- **Foresight**: Get pre-sign insights about transactions before execution
- **Pricing**: Access real-time and historical token prices across chains
- **Multi-chain Support**: EVM, Cosmos, Solana, UTXO, TVM, and Polkadot
- **TypeScript Support**: Full type definitions and autocompletion

## 📦 Installation

```bash
npm install @noves/noves-sdk
```

## 🚀 Quick Start

```typescript
import { Translate } from "@noves/noves-sdk";

// Initialize with your API key
const translate = Translate.evm("YOUR_API_KEY");

// Get transaction details
const txInfo = await translate.getTransaction(
  "eth",
  "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22"
);
```

## 📚 Documentation

For detailed documentation, please visit our [Documentation Site](https://docs.noves.fi).

### API Documentation

- [Translate API](docs/api/translate/README.md)
  - [EVM](docs/api/translate/evm.md)
  - [Cosmos](docs/api/translate/cosmos.md)
  - [Solana](docs/api/translate/svm.md)
  - [UTXO](docs/api/translate/utxo.md)
  - [TVM](docs/api/translate/tvm.md)
  - [Polkadot](docs/api/translate/polkadot.md)
- [Pricing API](docs/api/pricing/README.md)
  - [EVM](docs/api/pricing/evm.md)
  - [Cosmos](docs/api/pricing/cosmos.md)
  - [Move](docs/api/pricing/move.md)
- [Foresight API](docs/api/foresight/README.md)

### Examples

Check out our [examples directory](docs/examples/) for complete code samples.