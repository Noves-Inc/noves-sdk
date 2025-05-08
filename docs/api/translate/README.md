# Translate API

The Translate API provides functionality to interact with multiple blockchain ecosystems and classify transactions.

## Supported Ecosystems

- [EVM](./evm.md) - Ethereum Virtual Machine chains
- [Cosmos](./cosmos.md) - Cosmos-based chains
- [Solana](./solana.md) - Solana blockchain
- [UTXO](./utxo.md) - UTXO-based chains (Bitcoin, etc.)
- [TVM](./tvm.md) - Tron Virtual Machine
- [Polkadot](./polkadot.md) - Polkadot ecosystem

## Common Features

All ecosystem modules provide the following features:

- Get transaction details
- Get account transaction history
- Get token balances (where applicable)
- Start transaction jobs
- Get transaction job results

## API Reference

### Common Methods

#### getChains()
Returns a list of supported chains for the ecosystem.

```typescript
const chains = await translate.getChains();
```

#### getTransaction(chain: string, txHash: string)
Get detailed information about a specific transaction.

```typescript
const txInfo = await translate.getTransaction(chain, txHash);
```

#### Transactions(chain: string, accountAddress: string, pageOptions?: PageOptions)
Get paginated transactions for an account.

```typescript
const transactions = await translate.Transactions(chain, address, {
  pageSize: 10,
  sort: 'desc'
});
```

### Ecosystem-Specific Methods

Each ecosystem may provide additional methods specific to its functionality. See the ecosystem-specific documentation for details.

## Response Types

### Transaction
```typescript
interface Transaction {
  txTypeVersion: number;
  chain: string;
  accountAddress: string;
  classificationData: ClassificationData;
  rawTransactionData: RawTransactionData;
}
```

### ClassificationData
```typescript
interface ClassificationData {
  type: string;
  description: string;
  sent: SentReceived[];
  received: SentReceived[];
}
```

### RawTransactionData
```typescript
interface RawTransactionData {
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  blockNumber: number;
  gas: number;
  gasPrice: number;
  transactionFee: number;
  timestamp: number;
}
```

## Examples

See the [examples directory](../../examples/translate/) for complete working examples for each ecosystem. 