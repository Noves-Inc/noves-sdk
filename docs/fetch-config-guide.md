# Noves SDK Fetch Configuration Guide

## Quick Start

### Basic Usage (Backward Compatible)
```typescript
// Existing code continues to work unchanged
import { Translate } from '@noves/noves-sdk';
const translate = Translate.evm('your-api-key');
```

### Add a Request Timeout
```typescript
import { Translate } from '@noves/noves-sdk';

const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: {
    timeout: 30000 // 30 seconds per request
  }
});
```

### Add an AbortController Signal
```typescript
import { Translate } from '@noves/noves-sdk';

const controller = new AbortController();

const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: {
    signal: controller.signal
  }
});

// Cancel all in-flight requests at any time:
controller.abort();
```

## FetchConfig Interface

The `FetchConfig` interface allows you to customize the underlying fetch client behavior across all SDK requests.

```typescript
interface FetchConfig {
  /** Request timeout in milliseconds (per-attempt when retries are enabled) */
  timeout?: number;

  /** AbortSignal for global request cancellation */
  signal?: AbortSignal;

  /** Additional headers to include in every request */
  headers?: Record<string, string>;
}
```

### `timeout`

Sets a maximum duration in milliseconds for each API request. When the timeout is exceeded, the request is automatically aborted.

- **Per-attempt**: When retries are enabled, each retry attempt gets a fresh timeout. The timeout does not apply to the total duration of all attempts combined.
- **Retry compatible**: Timed-out requests are treated as network errors and are eligible for retry (when retries are enabled).
- **Default**: No timeout (requests wait indefinitely for a response).

```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: {
    timeout: 15000 // 15 seconds
  }
});
```

### `signal`

Accepts a standard `AbortSignal` for global cancellation of all SDK requests. When the signal is aborted, any in-flight request is immediately cancelled and an `AbortError` is thrown.

- **Immediate cancellation**: Aborted signals bypass the retry mechanism entirely.
- **Error propagation**: A native `AbortError` (DOMException) is thrown, which you can catch specifically.
- **Pre-aborted signals**: If the signal is already aborted when a request starts, the request fails immediately without making a network call.

```typescript
const controller = new AbortController();

const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: {
    signal: controller.signal
  }
});

// Make requests as usual
try {
  const tx = await translate.getTransaction('eth', '0x...');
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}

// Cancel all pending requests
controller.abort();
```

### `headers`

Adds custom headers to every request made by the SDK instance. Useful for tracing, correlation IDs, or custom middleware.

- **Merge behavior**: Custom headers are merged with the SDK's default headers (`apiKey`, `Content-Type`).
- **Precedence**: SDK default headers (`apiKey`, `Content-Type: application/json`) always take precedence over custom headers.

```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: {
    headers: {
      'X-Request-ID': 'trace-12345',
      'X-Client-Version': '2.0.0'
    }
  }
});
```

## Combined Configuration

All `FetchConfig` options can be combined with each other and with existing SDK options like `retryConfig`.

```typescript
const controller = new AbortController();

const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'PRODUCTION',
  fetchConfig: {
    timeout: 30000,
    signal: controller.signal,
    headers: { 'X-Trace-ID': 'abc123' }
  }
});
```

When both `timeout` and `signal` are provided:
- The request aborts when **either** the timeout fires or the signal is aborted, whichever happens first.
- **Timeout**: The timed-out request is eligible for retry (classified as a network error).
- **Signal abort**: The request is cancelled immediately and retries are skipped.

## Works Across All APIs

`FetchConfig` is supported across all SDK modules:

```typescript
// Translate API
const translate = Translate.evm({ apiKey: 'KEY', fetchConfig: { timeout: 30000 } });
const translateSvm = Translate.svm({ apiKey: 'KEY', fetchConfig: { timeout: 30000 } });

// Pricing API
const pricing = Pricing.evm({ apiKey: 'KEY', fetchConfig: { timeout: 15000 } });

// Foresight API
const foresight = ForesightFactory.evm({ apiKey: 'KEY', fetchConfig: { timeout: 20000 } });
```

## Use Cases

### Request Timeout for User-Facing Applications

Prevent your UI from hanging indefinitely if the API is slow:

```typescript
const translate = Translate.evm({
  apiKey: process.env.NOVES_API_KEY!,
  fetchConfig: { timeout: 10000 }, // 10s max per request
  retryConfig: 'REAL_TIME'         // Fast retry for user-facing apps
});
```

### Graceful Shutdown

Cancel all in-flight SDK requests when your server shuts down:

```typescript
const controller = new AbortController();

const translate = Translate.evm({
  apiKey: process.env.NOVES_API_KEY!,
  fetchConfig: { signal: controller.signal }
});

process.on('SIGTERM', () => {
  controller.abort();
  // ... other cleanup
});
```

### Component Lifecycle (React)

Cancel requests when a React component unmounts:

```typescript
useEffect(() => {
  const controller = new AbortController();

  const translate = Translate.evm({
    apiKey: 'YOUR_API_KEY',
    fetchConfig: { signal: controller.signal }
  });

  translate.getTransaction('eth', txHash)
    .then(setTransaction)
    .catch(err => {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    });

  return () => controller.abort(); // Cleanup on unmount
}, [txHash]);
```

### Request Tracing

Add correlation IDs for distributed tracing:

```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: {
    headers: {
      'X-Request-ID': crypto.randomUUID(),
      'X-Service-Name': 'my-backend'
    }
  }
});
```

## Error Handling

### Timeout Errors

When a request times out, the SDK converts it to a failed response (or retries if retries are enabled):

```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: { timeout: 5000 }
});

try {
  const tx = await translate.getTransaction('eth', '0x...');
} catch (error) {
  if (error.message?.includes('timed out')) {
    console.log('Request timed out');
  }
}
```

### Abort Errors

When a request is cancelled via an AbortController signal, a native `AbortError` is thrown:

```typescript
const controller = new AbortController();

const translate = Translate.evm({
  apiKey: 'your-api-key',
  fetchConfig: { signal: controller.signal }
});

try {
  controller.abort(); // Abort before request completes
  const tx = await translate.getTransaction('eth', '0x...');
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled by user');
  }
}
```

## Backward Compatibility

- `FetchConfig` is entirely optional. Existing code continues to work without any changes.
- All new parameters are additive. No existing behavior is modified.
- The `SDKOptions` interface remains backward compatible with existing usage patterns.
- When `fetchConfig` is not provided or is `undefined`, the SDK behaves exactly as before.
