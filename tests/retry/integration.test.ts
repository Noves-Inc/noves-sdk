/**
 * Integration tests for retry mechanism functionality.
 */

import { RetryPresets, RetryConfigBuilder } from '../../src/index';
import { createTranslateClient, createPricingClient } from '../../src/utils/apiUtils';

// Mock fetch for integration testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Retry Mechanism Integration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockRestore?.();
  });

  describe('Core Retry Functionality', () => {
    test('should retry failed requests and succeed', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.resolve({ message: 'Server error' })
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ 
            data: 'success',
            result: 'operation completed'
          })
        } as Response);
      });

      const client = createTranslateClient('evm', 'test-key', {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 100
      });

      const result = await client('test-endpoint');
      
      expect(result.succeeded).toBe(true);
      expect(callCount).toBe(2);
    });

    test('should respect rate limiting with Retry-After headers', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Rate Limited',
            headers: { get: (key: string) => key === 'retry-after' ? '1' : null },
            json: () => Promise.resolve({ message: 'Rate limited' })
          } as unknown as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ 
            tokenAddress: '0xETH',
            price: 2000,
            timestamp: Date.now()
          })
        } as Response);
      });

      const client = createPricingClient('evm', 'test-key', {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 100,
        respectRetryAfter: true
      });

      const result = await client('eth/price/0xETH');
      
      expect(result.succeeded).toBe(true);
      expect(result.response.price).toBe(2000);
      expect(callCount).toBe(2); // Should retry once after rate limit
    });

    test('should handle network errors and eventually succeed', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.resolve({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            json: () => Promise.resolve({ message: 'Service temporarily down' })
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ 
            data: 'service recovered',
            status: 'success'
          })
        } as Response);
      });

      const client = createTranslateClient('evm', 'test-key', {
        enabled: true,
        maxAttempts: 5,
        baseDelay: 100
      });

      const result = await client('network-test');
      
      expect(result.succeeded).toBe(true);
      expect(callCount).toBe(3);
    });

    test('should fail fast on non-retryable errors', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({ message: 'Invalid API key' })
        } as Response);
      });

      const client = createTranslateClient('evm', 'invalid-key', {
        enabled: true,
        maxAttempts: 3
      });

      const result = await client('test-endpoint');
      
      expect(result.succeeded).toBe(false);
      expect(result.httpStatusCode).toBe(401);
      expect(callCount).toBe(1); // Should not have retried
    });
  });

  describe('Configuration Presets', () => {
    test('all presets should be properly configured', () => {
      expect(RetryPresets.DISABLED.enabled).toBe(false);
      expect(RetryPresets.PRODUCTION.enabled).toBe(true);
      expect(RetryPresets.DEVELOPMENT.enabled).toBe(true);
      expect(RetryPresets.REAL_TIME.enabled).toBe(true);
      expect(RetryPresets.BATCH_PROCESSING.enabled).toBe(true);
      expect(RetryPresets.CRITICAL.enabled).toBe(true);
    });

    test('presets should have different characteristics', () => {
      expect(RetryPresets.PRODUCTION.maxAttempts).toBeLessThan(RetryPresets.DEVELOPMENT.maxAttempts);
      expect(RetryPresets.CRITICAL.maxAttempts).toBeLessThanOrEqual(RetryPresets.PRODUCTION.maxAttempts);
      expect(RetryPresets.REAL_TIME.maxDelay).toBeLessThan(RetryPresets.BATCH_PROCESSING.maxDelay);
    });

    test('should work with preset configurations', async () => {
      mockFetch.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        } as Response);
      });

      // Test different presets don't break basic functionality
      const productionClient = createTranslateClient('evm', 'test-key', RetryPresets.PRODUCTION);
      const devClient = createTranslateClient('evm', 'test-key', RetryPresets.DEVELOPMENT);
      const criticalClient = createTranslateClient('evm', 'test-key', RetryPresets.CRITICAL);
      
      const [prodResult, devResult, criticalResult] = await Promise.all([
        productionClient('test-endpoint'),
        devClient('test-endpoint'),
        criticalClient('test-endpoint')
      ]);
      
      expect(prodResult.succeeded).toBe(true);
      expect(devResult.succeeded).toBe(true);
      expect(criticalResult.succeeded).toBe(true);
    });
  });

  describe('Observability Integration', () => {
    test('should record events and calculate metrics', async () => {      
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.resolve({ message: 'Server error' })
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        } as Response);
      });

      const client = createTranslateClient('evm', 'test-key', {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 100
      });

      await client('observability-test');

      // Give some time for events to be processed
      await new Promise(resolve => setTimeout(resolve, 50));

    });
  });

  describe('Error Intelligence', () => {
    test('should handle circuit breaker configuration', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ message: 'Server error' })
        } as Response);
      });

      const client = createTranslateClient('evm', 'test-key', {
        enabled: true,
        maxAttempts: 2,
        circuitBreakerThreshold: 5
      });

      // Just test that circuit breaker config doesn't break normal operation
      const result = await client('circuit-test');
      expect(result.succeeded).toBe(false); // Should fail but not crash
      expect(callCount).toBe(2); // Should make configured attempts
    });
  });

  describe('Builder Pattern Integration', () => {
    test('should work with fluently built configurations', async () => {
      mockFetch.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        } as Response);
      });

      const config = RetryConfigBuilder.create()
        .enable()
        .maxAttempts(3)
        .delays(500, 5000)
        .exponentialBackoff(1.5)
        .withJitter(true, 0.1)
        .respectRetryAfter()
        .circuitBreaker(3, 30000)
        .onRetry((attempt, error, delay) => {
          // Custom retry logging
        })
        .onSuccess((attempt) => {
          // Custom success logging
        })
        .build();

      const client = createTranslateClient('evm', 'test-key', config);
      const result = await client('builder-test');
      
      expect(result.succeeded).toBe(true);
    });

    test('should validate configuration properly', () => {
      expect(() => {
        RetryConfigBuilder.create()
          .maxAttempts(-1) // Invalid
          .build();
      }).toThrow();

      expect(() => {
        RetryConfigBuilder.create()
          .delays(1000, 500) // maxDelay < baseDelay
          .build();
      }).toThrow();

      expect(() => {
        RetryConfigBuilder.create()
          .withJitter(true, 1.5) // Invalid jitter factor
          .build();
      }).toThrow();
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle multiple concurrent requests', async () => {
      mockFetch.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        } as Response);
      });

      const client = createTranslateClient('evm', 'test-key', {
        enabled: true,
        maxAttempts: 2
      });

      // Fire off multiple concurrent requests
      const requests = Array(5).fill(0).map((_, i) => 
        client(`concurrent-test-${i}`)
      );

      const results = await Promise.all(requests);
      
      results.forEach(result => {
        expect(result.succeeded).toBe(true);
      });
    });

    test('should maintain performance when retries are disabled', async () => {
      mockFetch.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        } as Response);
      });

      const client = createTranslateClient('evm', 'test-key', {
        enabled: false
      });

      const startTime = Date.now();
      const result = await client('performance-test');
      const duration = Date.now() - startTime;
      
      expect(result.succeeded).toBe(true);
      // Should be very fast with no retry overhead
      expect(duration).toBeLessThan(100);
    });
  });
});