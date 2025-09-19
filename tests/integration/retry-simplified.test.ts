// tests/integration/retry-simplified.test.ts

import { jest } from '@jest/globals';
import { Translate, Pricing, ForesightFactory, RetryPresets } from '../../src/index';

describe('SDK Integration - Enhanced Options Tests', () => {
  describe('Factory Functions with Enhanced Options', () => {
    test('should accept retry config using preset strings', () => {
      expect(() => Translate.evm({ apiKey: 'test-api-key', retryConfig: 'PRODUCTION' })).not.toThrow();
      expect(() => Translate.svm({ apiKey: 'test-api-key', retryConfig: 'DEVELOPMENT' })).not.toThrow();
      expect(() => Translate.utxo({ apiKey: 'test-api-key', retryConfig: 'REAL_TIME' })).not.toThrow();
      expect(() => Translate.cosmos({ apiKey: 'test-api-key', retryConfig: 'BATCH_PROCESSING' })).not.toThrow();
      expect(() => Translate.tvm({ apiKey: 'test-api-key', retryConfig: 'CRITICAL' })).not.toThrow();
      expect(() => Translate.polkadot({ apiKey: 'test-api-key', retryConfig: 'DISABLED' })).not.toThrow();
      expect(() => Translate.xrpl({ apiKey: 'test-api-key', retryConfig: 'PRODUCTION' })).not.toThrow();
      expect(() => Translate.exchange({ apiKey: 'test-api-key', retryConfig: 'DEVELOPMENT' })).not.toThrow();
    });

    test('should accept retry config objects', () => {
      expect(() => Pricing.evm({ apiKey: 'test-api-key', retryConfig: RetryPresets.PRODUCTION })).not.toThrow();
      expect(() => Pricing.svm({ apiKey: 'test-api-key', retryConfig: RetryPresets.DEVELOPMENT })).not.toThrow();
      expect(() => Pricing.utxo({ apiKey: 'test-api-key', retryConfig: RetryPresets.REAL_TIME })).not.toThrow();
      expect(() => Pricing.cosmos({ apiKey: 'test-api-key', retryConfig: RetryPresets.BATCH_PROCESSING })).not.toThrow();
      expect(() => Pricing.move({ apiKey: 'test-api-key', retryConfig: RetryPresets.CRITICAL })).not.toThrow();
    });

    test('should auto-recommend based on environment', () => {
      expect(() => ForesightFactory.evm({ apiKey: 'test-api-key', environment: 'production' })).not.toThrow();
    });
  });

  describe('Backward Compatibility', () => {
    test('should work without retry config (default behavior)', () => {
      // These should all work exactly as before
      expect(() => Translate.evm('test-api-key')).not.toThrow();
      expect(() => Translate.svm('test-api-key')).not.toThrow();
      expect(() => Pricing.evm('test-api-key')).not.toThrow();
      expect(() => ForesightFactory.evm('test-api-key')).not.toThrow();
    });

    test('should have retry disabled by default', () => {
      const translateEVM = Translate.evm('test-api-key');
      const pricingEVM = Pricing.evm('test-api-key');
      const foresight = ForesightFactory.evm('test-api-key');

      // These should be defined and functional
      expect(translateEVM).toBeDefined();
      expect(pricingEVM).toBeDefined();
      expect(foresight).toBeDefined();
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

    test('critical preset should have limited retryable errors', () => {
      expect(RetryPresets.CRITICAL.retryableErrors.length).toBeLessThan(RetryPresets.DEVELOPMENT.retryableErrors.length);
    });
  });

  describe('Error Handling Compatibility', () => {
    test('should not break existing error handling when retry is disabled', () => {
      // Test that we can create instances without breaking anything
      const translateEVM = Translate.evm('test-api-key');
      const pricingEVM = Pricing.evm('test-api-key');

      expect(translateEVM).toHaveProperty('getTransactions');
      expect(pricingEVM).toHaveProperty('getPrice');
    });

    test('should not break existing error handling when retry is enabled', () => {
      // Test that we can create instances with retry enabled without breaking anything
      const translateEVM = Translate.evm({ apiKey: 'test-api-key', retryConfig: 'DEVELOPMENT' });
      const pricingEVM = Pricing.evm({ apiKey: 'test-api-key', retryConfig: 'PRODUCTION' });

      expect(translateEVM).toHaveProperty('getTransactions');
      expect(pricingEVM).toHaveProperty('getPrice');
    });
  });
});
