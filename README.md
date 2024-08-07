<p align="center">
  <img src="assets/noves-logo.png" width="300" alt="noves" />
</p>

# **Noves SDK**

---

This is the **official SDK** for interacting with the [Noves API](https://docs.noves.fi/reference/api-overview).

**The Noves SDK is a powerful toolkit that streamlines your interaction with complex blockchain data.** By providing a user-friendly interface to the underlying Noves API, the SDK empowers developers to efficiently extract meaningful insights from on-chain activity.

### Documentation

---

Browse the full documentation:

- [API Documentation](https://docs.noves.fi/reference/translate-api-quickstart)
- [Getting Started](https://docs.noves.fi/reference/translate-api-quickstart)

## Features

---

The SDK's initial focus is on the [Noves Translate API](https://docs.noves.fi/reference/translate-api-quickstart), which specializes in categorizing and standardizing blockchain transactions. By leveraging the Translate library, you can effortlessly:

- **Classify transactions**: Understand the purpose of transactions with clear labels (e.g., "Claimed 100 USDC in rewards").
- **Standardize data**: Compare transactions across different blockchains and protocols.
- **Access rich metadata**: Obtain detailed information about involved assets, including type, contract address, and more.

## Installation

---

You can install the SDK using npm:

```bash
npm install @noves/noves-sdk
```

### Initialization

---

First, import and initialize the SDK with your API key:

```typescript
import { Translate } from "@noves/noves-sdk";
const translate = new Translate.evm("YOUR_API_KEY");
```
