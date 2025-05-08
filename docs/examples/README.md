# Noves SDK Examples

This directory contains example code demonstrating how to use the Noves SDK for different blockchain ecosystems.

## Directory Structure

```
examples/
├── translate/           # Examples for the Translate API
│   ├── cosmos.ts       # Cosmos ecosystem examples
│   ├── evm.ts          # EVM ecosystem examples
│   └── ...
├── pricing/            # Examples for the Pricing API
│   └── ...
└── foresight/          # Examples for the Foresight API
    └── ...
```

## Running the Examples

1. Install dependencies:
```bash
npm install
```

2. Set your API key:
```bash
export NOVES_API_KEY=your_api_key_here
```

3. Run an example:
```bash
# Run the Cosmos Translate example
npx ts-node examples/translate/cosmos.ts

# Run the EVM Translate example
npx ts-node examples/translate/evm.ts
```

## Example Categories

### Translate API Examples
- Basic usage examples
- Error handling examples
- Advanced usage examples
- Pagination examples
- Transaction job examples

### Pricing API Examples
- Token price queries
- Pool price queries
- Historical price data

### Foresight API Examples
- Transaction simulation
- Gas estimation
- State overrides


## Notes

- Examples use TypeScript for better type safety and developer experience
- All examples include proper error handling
- Examples demonstrate both basic and advanced usage patterns
- Each example is self-contained and can be run independently 