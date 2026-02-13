// tests/utils/fetchConfig.test.ts

import { jest } from '@jest/globals';
import { createTranslateClient, createForesightClient, createPricingClient } from '../../src/utils/apiUtils';
import { FetchConfig } from '../../src/types/common';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Helper function to create mock Response objects
function createMockResponse(data: any, status: number = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

jest.setTimeout(30000);

describe('FetchConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Timeout Support', () => {
    test('should abort request when timeout is exceeded', async () => {
      // Mock a slow response that respects the AbortSignal
      mockFetch.mockImplementation((_url: any, init: any) => {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            resolve(createMockResponse({ data: 'success' }));
          }, 500); // Response takes 500ms

          if (init?.signal) {
            if (init.signal.aborted) {
              clearTimeout(timeoutId);
              reject(new DOMException('The operation was aborted.', 'AbortError'));
              return;
            }
            init.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          }
        });
      });

      const fetchConfig: FetchConfig = { timeout: 50 }; // 50ms timeout
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      const result = await client('test-endpoint');

      // Should fail due to timeout (converted to network error)
      expect(result.succeeded).toBe(false);
      expect(result.response.message).toContain('timed out');
    });

    test('should succeed when response is within timeout', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const fetchConfig: FetchConfig = { timeout: 5000 }; // 5s timeout
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(result.response).toEqual({ data: 'success' });
    });

    test('timeout should apply per-attempt with retries', async () => {
      let callCount = 0;
      mockFetch.mockImplementation((_url: any, init: any) => {
        callCount++;
        if (callCount === 1) {
          // First call times out (slow response that respects signal)
          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => resolve(createMockResponse({ data: 'late' })), 500);
            if (init?.signal) {
              if (init.signal.aborted) {
                clearTimeout(timeoutId);
                reject(new DOMException('The operation was aborted.', 'AbortError'));
                return;
              }
              init.signal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }
          });
        }
        // Second call succeeds quickly
        return Promise.resolve(createMockResponse({ data: 'success' }));
      });

      const fetchConfig: FetchConfig = { timeout: 50 }; // 50ms timeout
      const client = createTranslateClient('evm', 'test-api-key', {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 10
      }, fetchConfig);

      const result = await client('test-endpoint');

      // Should succeed on retry after first timeout
      expect(result.succeeded).toBe(true);
      expect(callCount).toBe(2);
    });

    test('timeout should work with createPricingClient', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ price: 2000 }));

      const fetchConfig: FetchConfig = { timeout: 5000 };
      const client = createPricingClient('evm', 'test-api-key', undefined, fetchConfig);

      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(result.response).toEqual({ price: 2000 });
    });

    test('timeout should work with createForesightClient', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ description: 'swap' }));

      const fetchConfig: FetchConfig = { timeout: 5000 };
      const client = createForesightClient('test-api-key', undefined, fetchConfig);

      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(result.response).toEqual({ description: 'swap' });
    });
  });

  describe('AbortSignal Support', () => {
    test('should abort request when signal is triggered', async () => {
      const controller = new AbortController();

      mockFetch.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            resolve(createMockResponse({ data: 'success' }));
          }, 500);

          controller.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        });
      });

      const fetchConfig: FetchConfig = { signal: controller.signal };
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      // Abort after a short delay
      setTimeout(() => controller.abort(), 20);

      // Should throw AbortError
      await expect(client('test-endpoint')).rejects.toThrow();
    });

    test('should abort immediately when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort(); // Abort immediately

      const fetchConfig: FetchConfig = { signal: controller.signal };
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      await expect(client('test-endpoint')).rejects.toThrow();
      expect(mockFetch).not.toHaveBeenCalled(); // Should not even attempt fetch
    });

    test('should not retry when user signal aborts', async () => {
      const controller = new AbortController();
      let callCount = 0;

      mockFetch.mockImplementation(() => {
        callCount++;
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            resolve(createMockResponse({ data: 'success' }));
          }, 500);

          controller.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        });
      });

      const fetchConfig: FetchConfig = { signal: controller.signal };
      const client = createTranslateClient('evm', 'test-api-key', {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 10
      }, fetchConfig);

      // Abort after a short delay
      setTimeout(() => controller.abort(), 20);

      await expect(client('test-endpoint')).rejects.toThrow();
      // Should only call once - user abort should not trigger retries
      expect(callCount).toBe(1);
    });

    test('signal should work with createPricingClient', async () => {
      const controller = new AbortController();
      controller.abort();

      const fetchConfig: FetchConfig = { signal: controller.signal };
      const client = createPricingClient('evm', 'test-api-key', undefined, fetchConfig);

      await expect(client('test-endpoint')).rejects.toThrow();
    });

    test('signal should work with createForesightClient', async () => {
      const controller = new AbortController();
      controller.abort();

      const fetchConfig: FetchConfig = { signal: controller.signal };
      const client = createForesightClient('test-api-key', undefined, fetchConfig);

      await expect(client('test-endpoint')).rejects.toThrow();
    });
  });

  describe('Custom Headers Support', () => {
    test('should include custom headers in requests', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const fetchConfig: FetchConfig = {
        headers: { 'X-Custom-Header': 'my-value', 'X-Request-ID': '12345' }
      };
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      await client('test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://translate.noves.fi/evm/test-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'my-value',
            'X-Request-ID': '12345',
            'apiKey': 'test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('SDK headers should take precedence over custom headers', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const fetchConfig: FetchConfig = {
        headers: { 'apiKey': 'should-be-overridden', 'Content-Type': 'text/plain' }
      };
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      await client('test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'apiKey': 'test-api-key', // SDK header takes precedence
            'Content-Type': 'application/json' // SDK header takes precedence
          })
        })
      );
    });

    test('custom headers should work with all client factories', async () => {
      const fetchConfig: FetchConfig = {
        headers: { 'X-Custom': 'value' }
      };

      // Translate client
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));
      const translateClient = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);
      await translateClient('test-endpoint');
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom': 'value' })
        })
      );

      // Pricing client
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));
      const pricingClient = createPricingClient('evm', 'test-api-key', undefined, fetchConfig);
      await pricingClient('test-endpoint');
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom': 'value' })
        })
      );

      // Foresight client
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));
      const foresightClient = createForesightClient('test-api-key', undefined, fetchConfig);
      await foresightClient('test-endpoint');
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom': 'value' })
        })
      );
    });
  });

  describe('Combined Configuration', () => {
    test('should support timeout with custom headers', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const fetchConfig: FetchConfig = {
        timeout: 5000,
        headers: { 'X-Custom': 'value' }
      };
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom': 'value' }),
          signal: expect.any(AbortSignal)
        })
      );
    });

    test('should support signal with timeout (both abort sources)', async () => {
      const controller = new AbortController();
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const fetchConfig: FetchConfig = {
        timeout: 5000,
        signal: controller.signal
      };
      const client = createTranslateClient('evm', 'test-api-key', undefined, fetchConfig);

      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      // Should have a combined signal
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      );
    });

    test('should support all options together (timeout + signal + headers + retry)', async () => {
      const controller = new AbortController();
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const fetchConfig: FetchConfig = {
        timeout: 5000,
        signal: controller.signal,
        headers: { 'X-Trace-ID': 'abc123' }
      };
      const client = createTranslateClient('evm', 'test-api-key', {
        enabled: true,
        maxAttempts: 2,
        baseDelay: 10
      }, fetchConfig);

      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Trace-ID': 'abc123',
            'apiKey': 'test-api-key'
          }),
          signal: expect.any(AbortSignal)
        })
      );
    });
  });

  describe('Backward Compatibility', () => {
    test('should work without fetchConfig (existing behavior)', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const client = createTranslateClient('evm', 'test-api-key');
      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(result.response).toEqual({ data: 'success' });
    });

    test('should work with undefined fetchConfig', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const client = createTranslateClient('evm', 'test-api-key', undefined, undefined);
      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(result.response).toEqual({ data: 'success' });
    });

    test('should work with empty fetchConfig', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const client = createTranslateClient('evm', 'test-api-key', undefined, {});
      const result = await client('test-endpoint');

      expect(result.succeeded).toBe(true);
      expect(result.response).toEqual({ data: 'success' });
    });

    test('retry config should work alongside fetchConfig', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          statusText: 'Error',
          headers: { 'Content-Type': 'application/json' }
        }))
        .mockResolvedValueOnce(createMockResponse({ data: 'success' }));

      const client = createTranslateClient('evm', 'test-api-key', {
        enabled: true,
        maxAttempts: 2,
        baseDelay: 10
      }, { headers: { 'X-Custom': 'value' } });

      const result = await client('test-endpoint');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.succeeded).toBe(true);
    });
  });

  describe('Factory Pattern Integration', () => {
    test('TranslateEVM should accept fetchConfig via constructor', () => {
      // Test that constructors accept fetchConfig without error
      const { TranslateEVM } = require('../../src/translate/translateEVM');
      expect(() => new TranslateEVM('test-api-key', undefined, { timeout: 5000 })).not.toThrow();
    });

    test('PricingEVM should accept fetchConfig via constructor', () => {
      const { PricingEVM } = require('../../src/pricing/pricingEVM');
      expect(() => new PricingEVM('test-api-key', undefined, { timeout: 5000 })).not.toThrow();
    });

    test('Foresight should accept fetchConfig via constructor', () => {
      const { Foresight } = require('../../src/foresight/foresight');
      expect(() => new Foresight('test-api-key', undefined, { timeout: 5000 })).not.toThrow();
    });

    test('SDKOptions fetchConfig should flow through Translate factory', () => {
      const { Translate } = require('../../src/index');
      expect(() => Translate.evm({
        apiKey: 'test-api-key',
        fetchConfig: { timeout: 5000 }
      })).not.toThrow();
    });

    test('SDKOptions fetchConfig should flow through Pricing factory', () => {
      const { Pricing } = require('../../src/index');
      expect(() => Pricing.evm({
        apiKey: 'test-api-key',
        fetchConfig: { timeout: 5000 }
      })).not.toThrow();
    });

    test('backward compatible - factories work with string API key', () => {
      const { Translate, Pricing } = require('../../src/index');
      expect(() => Translate.evm('test-api-key')).not.toThrow();
      expect(() => Pricing.evm('test-api-key')).not.toThrow();
    });

    test('backward compatible - factories work with SDKOptions without fetchConfig', () => {
      const { Translate, Pricing } = require('../../src/index');
      expect(() => Translate.evm({ apiKey: 'test-api-key' })).not.toThrow();
      expect(() => Pricing.evm({ apiKey: 'test-api-key' })).not.toThrow();
    });
  });
});
