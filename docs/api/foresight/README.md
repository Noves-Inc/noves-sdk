# Foresight API

The Foresight API helps you simulate transactions and estimate gas costs before executing them.

## Table of Contents
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

```typescript
import { Foresight } from "@noves/noves-sdk";

// Initialize the Foresight client
const foresight = new Foresight("YOUR_API_KEY");
```

## API Reference

### getChains()
Returns a list of supported EVM chains with their details.

```typescript
const chains = await foresight.getChains();
```

Response format:
```typescript
interface Chain {
  name: string;        // Chain identifier (e.g., "eth", "polygon")
  ecosystem: string;   // Always "evm"
  nativeCoin: {
    name: string;      // Native coin name (e.g., "ETH", "MATIC")
    symbol: string;    // Native coin symbol
    address: string;   // Native coin address
    decimals: number;  // Number of decimals for the native coin
  };
}
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
    "name": "polygon",
    "ecosystem": "evm",
    "nativeCoin": {
      "name": "POL",
      "symbol": "POL",
      "address": "POL",
      "decimals": 18
    }
  }
]
```

### preview(chain: string, unsignedTransaction: UnsignedTransaction, stateOverrides?: StateOverrides, viewAsAccountAddress?: string, block?: number)
Takes an unsigned transaction object and returns a fully classified transaction, including an enriched English description of the action that is about to take place, and all relevant asset transfers tagged.

```typescript
const preview = await foresight.preview(
  "eth",
  {
    to: "0x123...",
    value: "0x0",
    data: "0x..."
  },
  {
    "0x123...": {
      stateDiff: {
        balance: "0x1"
      }
    }
  },
  "0x456...", // Optional: view as this address
  12345678    // Optional: preview at this block
);
```

### preview4337(chain: string, userOperation: UserOperation, block?: number)
Takes an ERC-4337 userOp object and returns a classified transaction previewing what will happen if the userOp is executed.

```typescript
const preview = await foresight.preview4337(
  "eth",
  {
    sender: "0x123...",
    nonce: 0,
    initCode: "0x...",
    callData: "0x...",
    callGasLimit: 100000,
    verificationGasLimit: 100000,
    preVerificationGas: 100000,
    maxFeePerGas: 1000000000,
    maxPriorityFeePerGas: 1000000000,
    paymasterAndData: "0x...",
    signature: "0x..."
  },
  12345678 // Optional: preview at this block
);
```

### describe(chain: string, unsignedTransaction: UnsignedTransaction)
Returns a description of the action that will take place if the transaction executes.

```typescript
const description = await foresight.describe(
  "eth",
  {
    from: "0x123...",
    to: "0x456...",
    value: "0x0",
    data: "0x..."
  }
);
```

Response format:
```typescript
{
  description: string;  // Human-readable description of the transaction
}
```

Example response:
```json
{
  "description": "Transfer native coin."
}
```

### describe4337(chain: string, userOperation: UserOperation)
Returns a description of what will happen if the ERC-4337 userOp object executes.

```typescript
const description = await foresight.describe4337(
  "eth",
  {
    sender: "0x123...",
    nonce: 0,
    initCode: "0x...",
    callData: "0x...",
    callGasLimit: 100000,
    verificationGasLimit: 100000,
    preVerificationGas: 100000,
    maxFeePerGas: 1000000000,
    maxPriorityFeePerGas: 1000000000,
    paymasterAndData: "0x...",
    signature: "0x..."
  }
);
```

Response format:
```typescript
{
  description: string;  // Human-readable description of the user operation
  type: string;        // Classification type of the user operation
}
```

Example response:
```json
{
  "description": "Account abstraction contract will call 'handleOps' on contract 0x5FF1.",
  "type": "unclassified"
}
```

### screen(chain: string, unsignedTransaction: UnsignedTransaction)
Screens a transaction for potential risks and provides detailed analysis.

```typescript
const screening = await foresight.screen(
  "eth",
  {
    from: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
    to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    value: "0x16345785d8a0000",
    data: "0x",
    gas: "0x5208",
    gasPrice: null,
    maxFeePerGas: "0x4a817c800",
    maxPriorityFeePerGas: "0x3b9aca00",
    type: "0x2"
  }
);
```

Response format:
```typescript
{
  simulation: {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: {
      type: string;
      source: {
        type: string;
      };
      description: string;
      protocol: Record<string, any>;
      sent: Array<{
        action: string;
        from: {
          name: string;
          address: string;
        };
        to: {
          name: string;
          address: string;
        };
        amount: string;
        token: {
          symbol: string;
          name: string;
          decimals: number;
          address: string;
        };
      }>;
      received: Array<any>;
    };
  };
  toAddress: {
    address: string;
    isContract: boolean;
    isVerified: boolean;
    isToken: boolean;
    risksDetected: Array<any>;
  };
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    isVerified: boolean;
    risksDetected: Array<any>;
  }>;
}
```

Example response:
```json
{
  "simulation": {
    "txTypeVersion": 2,
    "chain": "eth",
    "accountAddress": "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
    "classificationData": {
      "type": "sendToken",
      "source": {
        "type": "human"
      },
      "description": "Will send 0.10 ETH.",
      "protocol": {},
      "sent": [
        {
          "action": "sent",
          "from": {
            "name": "@ChrisLally: chrislally.eth",
            "address": "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65"
          },
          "to": {
            "name": "Wrapped Ether (WETH)",
            "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          },
          "amount": "0.1",
          "token": {
            "symbol": "ETH",
            "name": "ETH",
            "decimals": 18,
            "address": "ETH"
          }
        }
      ],
      "received": []
    }
  },
  "toAddress": {
    "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "isContract": false,
    "isVerified": true,
    "isToken": true,
    "risksDetected": []
  },
  "tokens": [
    {
      "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "symbol": "",
      "name": "",
      "isVerified": true,
      "risksDetected": []
    }
  ]
}
```

### screen4337(chain: string, userOperation: UserOperation)
Screens an ERC-4337 user operation for potential risks and provides detailed analysis.

```typescript
const screening = await foresight.screen4337(
  "eth",
  {
    sender: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
    nonce: 0,
    initCode: "0x",
    callData: "0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000de0b6b3a7640000",
    callGasLimit: 100000,
    verificationGasLimit: 100000,
    preVerificationGas: 21000,
    maxFeePerGas: 20000000000,
    maxPriorityFeePerGas: 1000000000,
    paymasterAndData: "0x",
    signature: "0x"
  }
);
```

Response format:
```typescript
{
  simulation: {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: {
      type: string;
      source: {
        type: string | null;
      };
      description: string;
      protocol: Record<string, any>;
      sent: Array<any>;
      received: Array<any>;
    };
    rawTransactionData: {
      fromAddress: string;
      toAddress: string;
      gasUsed: number;
    };
  };
  toAddress: {
    address: string;
    isContract: boolean;
    isVerified: boolean;
    isToken: boolean;
    risksDetected: Array<any>;
  };
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    isVerified: boolean;
    risksDetected: Array<any>;
  }>;
}
```

Example response:
```json
{
  "simulation": {
    "txTypeVersion": 2,
    "chain": "eth",
    "accountAddress": "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
    "classificationData": {
      "type": "unclassified",
      "source": {
        "type": null
      },
      "description": "Account abstraction contract will call 'handleOps' on contract 0x5FF1.",
      "protocol": {},
      "sent": [],
      "received": []
    },
    "rawTransactionData": {
      "fromAddress": "0x9B1054d24dC31a54739B6d8950af5a7dbAa56815",
      "toAddress": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      "gasUsed": 41115
    }
  },
  "toAddress": {
    "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "isContract": true,
    "isVerified": true,
    "isToken": true,
    "risksDetected": []
  },
  "tokens": [
    {
      "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "symbol": "",
      "name": "",
      "isVerified": true,
      "risksDetected": []
    }
  ]
}
```

### screenUrl(url: string)
Screens a URL for potential risks and provides detailed analysis.

```typescript
const screening = await foresight.screenUrl('https://uniswap-v3.com');
```

Response format:
```typescript
{
  domain: string;           // The analyzed domain
  risksDetected: Array<{    // Array of detected risks
    type: string;          // Type of risk (e.g., "blacklisted")
  }>;
}
```

Example response:
```json
{
  "domain": "uniswap-v3.com",
  "risksDetected": [
    {
      "type": "blacklisted"
    }
  ]
}
```

## Error Handling

The SDK provides specific error types for Foresight-related operations:

```typescript
try {
  const preview = await foresight.preview(chain, unsignedTx);
} catch (error) {
  if (error instanceof TransactionError) {
    console.error("Transaction error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Error Types
- `TransactionError`: Thrown for general transaction-related errors 