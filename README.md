<p align="center" style="padding: 10px 0;">
  <img src="assets/noves-logo.png" width="300" alt="noves" />
</p>

# **Noves SDK**

This is the **official SDK** for interacting with the [Noves API](https://docs.noves.fi/reference/api-overview).

**The Noves SDK is a powerful toolkit that streamlines your interaction with complex blockchain data.** By providing a user-friendly interface to the underlying Noves API, the SDK empowers developers to efficiently extract meaningful insights from on-chain activity.

### Translate

The [Noves Translate Module](https://docs.noves.fi/reference/translate-api-quickstart) categorize transactions, standardizing them across chains and across protocols to produce a rich set of data that allows you to easily answer the question **"what did this transaction do?"**. By leveraging the Translate library, you can effortlessly

- **Classify transactions**: Understand the purpose of transactions with clear labels (e.g., "Claimed 100 USDC in rewards").
- **Standardize data**: Compare transactions across different blockchains and protocols.
- **Access rich metadata**: Obtain detailed information about involved assets, including type, contract address, and more.

### Foresight

[Foresight Module](https://docs.noves.fi/reference/foresight-api-quickstart) is our transaction pre-sign insights product. Leveraging the same processing layer underneath the Translate API, the [Foresight API](https://docs.noves.fi/reference/foresight-api-quickstart) **will tell you what a transaction is about to do**, before it is executed.

- **Describe Endpoints**: These lightweight endpoints provide a concise English description of the impending transaction, giving you a quick understanding of its purpose.
- **Simulate Endpoints**: Go deeper with full transaction simulations. This endpoint mimics the execution and then classifies it just like the Translate API would for a real transaction. Additionally, it returns a detailed description and labels associated with each asset transfer (e.g., "You're about to stake 2 ETH and claim 100 USDC in rewards").

## Documentation

Browse the full documentation:

- [API Documentation](https://docs.noves.fi/reference/translate-api-quickstart)
- [Getting Started](https://docs.noves.fi/reference/translate-api-quickstart)

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
