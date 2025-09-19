import { RetryPresets, RetryConfigBuilder, RetryRecommendations } from '../../src/utils/retryPresets';
import { ErrorType } from '../../src/errors/ErrorTypes';

describe('RetryPresets', () => {
  describe('PRODUCTION preset', () => {
    test('should have conservative settings', () => {
      const config = RetryPresets.PRODUCTION;
      
      expect(config.enabled).toBe(true);
      expect(config.maxAttempts).toBe(2);
      expect(config.baseDelay).toBe(2000);
      expect(config.circuitBreakerThreshold).toBe(3);
      expect(config.respectRetryAfter).toBe(true);
    });

    test('should only retry safe error types', () => {
      const config = RetryPresets.PRODUCTION;
      
      expect(config.retryableErrors).toContain(ErrorType.RATE_LIMIT_EXCEEDED);
      expect(config.retryableErrors).toContain(ErrorType.NETWORK_ERROR);
      expect(config.retryableErrors).not.toContain(ErrorType.VALIDATION_ERROR);
      expect(config.retryableErrors).not.toContain(ErrorType.UNAUTHORIZED);
    });
  });

  describe('DEVELOPMENT preset', () => {
    test('should have more aggressive settings', () => {
      const config = RetryPresets.DEVELOPMENT;
      
      expect(config.enabled).toBe(true);
      expect(config.maxAttempts).toBe(5);
      expect(config.baseDelay).toBe(500);
      expect(config.circuitBreakerThreshold).toBe(8);
    });

    test('should retry more error types', () => {
      const config = RetryPresets.DEVELOPMENT;
      
      expect(config.retryableErrors).toContain(ErrorType.UNKNOWN_ERROR);
      expect(config.retryableErrors.length).toBeGreaterThan(RetryPresets.PRODUCTION.retryableErrors.length);
    });
  });

  describe('REAL_TIME preset', () => {
    test('should have fast-fail settings', () => {
      const config = RetryPresets.REAL_TIME;
      
      expect(config.enabled).toBe(true);
      expect(config.maxAttempts).toBe(3);
      expect(config.maxDelay).toBe(8000);
      expect(config.circuitBreakerThreshold).toBe(2);
      expect(config.circuitBreakerResetTime).toBe(15000);
    });
  });

  describe('BATCH_PROCESSING preset', () => {
    test('should have high-throughput settings', () => {
      const config = RetryPresets.BATCH_PROCESSING;
      
      expect(config.enabled).toBe(true);
      expect(config.maxAttempts).toBe(8);
      expect(config.circuitBreakerThreshold).toBe(10);
      expect(config.retryableErrors).toContain(ErrorType.JOB_PROCESSING);
    });
  });

  describe('CRITICAL preset', () => {
    test('should have minimal retry settings', () => {
      const config = RetryPresets.CRITICAL;
      
      expect(config.enabled).toBe(true);
      expect(config.maxAttempts).toBe(1);
      expect(config.jitter).toBe(false);
      expect(config.retryableErrors).toEqual([ErrorType.NETWORK_ERROR]);
    });
  });

  describe('DISABLED preset', () => {
    test('should disable all retries', () => {
      const config = RetryPresets.DISABLED;
      
      expect(config.enabled).toBe(false);
      expect(config.maxAttempts).toBe(0);
      expect(config.retryableErrors).toEqual([]);
    });
  });
});

describe('RetryConfigBuilder', () => {
  describe('basic functionality', () => {
    test('should create empty builder', () => {
      const builder = RetryConfigBuilder.create();
      expect(builder).toBeInstanceOf(RetryConfigBuilder);
    });

    test('should create from preset', () => {
      const builder = RetryConfigBuilder.fromPreset(RetryPresets.PRODUCTION);
      const config = builder.build();
      
      expect(config.maxAttempts).toBe(2);
      expect(config.baseDelay).toBe(2000);
    });

    test('should support method chaining', () => {
      const config = RetryConfigBuilder.create()
        .enable()
        .maxAttempts(5)
        .delays(1000, 30000)
        .exponentialBackoff(2)
        .withJitter()
        .build();

      expect(config.enabled).toBe(true);
      expect(config.maxAttempts).toBe(5);
      expect(config.baseDelay).toBe(1000);
      expect(config.maxDelay).toBe(30000);
      expect(config.exponentialBase).toBe(2);
      expect(config.jitter).toBe(true);
    });
  });

  describe('validation', () => {
    test('should throw on negative maxAttempts', () => {
      expect(() => {
        RetryConfigBuilder.create().maxAttempts(-1);
      }).toThrow('maxAttempts must be non-negative');
    });

    test('should throw on negative baseDelay', () => {
      expect(() => {
        RetryConfigBuilder.create().delays(-100);
      }).toThrow('baseDelay must be non-negative');
    });

    test('should throw on maxDelay < baseDelay', () => {
      expect(() => {
        RetryConfigBuilder.create().delays(1000, 500);
      }).toThrow('maxDelay must be >= baseDelay');
    });

    test('should throw on exponentialBase < 1', () => {
      expect(() => {
        RetryConfigBuilder.create().exponentialBackoff(0.5);
      }).toThrow('exponentialBase must be >= 1');
    });

    test('should throw on invalid jitterFactor', () => {
      expect(() => {
        RetryConfigBuilder.create().withJitter(true, 1.5);
      }).toThrow('jitterFactor must be between 0 and 1');
    });

    test('should throw on negative circuit breaker values', () => {
      expect(() => {
        RetryConfigBuilder.create().circuitBreaker(-1, 1000);
      }).toThrow('threshold must be non-negative');

      expect(() => {
        RetryConfigBuilder.create().circuitBreaker(5, -1000);
      }).toThrow('resetTimeMs must be non-negative');
    });
  });

  describe('error handling configuration', () => {
    test('should add retryable errors', () => {
      const config = RetryConfigBuilder.create()
        .retryOn(ErrorType.RATE_LIMIT_EXCEEDED, ErrorType.NETWORK_ERROR)
        .retryOn(ErrorType.JOB_NOT_READY)
        .build();

      expect(config.retryableErrors).toContain(ErrorType.RATE_LIMIT_EXCEEDED);
      expect(config.retryableErrors).toContain(ErrorType.NETWORK_ERROR);
      expect(config.retryableErrors).toContain(ErrorType.JOB_NOT_READY);
    });

    test('should add retryable status codes', () => {
      const config = RetryConfigBuilder.create()
        .retryOnStatusCodes(429, 500)
        .retryOnStatusCodes(502, 503)
        .build();

      expect(config.retryableStatusCodes).toContain(429);
      expect(config.retryableStatusCodes).toContain(500);
      expect(config.retryableStatusCodes).toContain(502);
      expect(config.retryableStatusCodes).toContain(503);
    });
  });

  describe('callback configuration', () => {
    test('should set retry callbacks', () => {
      const onRetry = jest.fn();
      const onSuccess = jest.fn();
      const onFailure = jest.fn();

      const config = RetryConfigBuilder.create()
        .onRetry(onRetry)
        .onSuccess(onSuccess)
        .onFailure(onFailure)
        .build();

      expect(config.onRetry).toBe(onRetry);
      expect(config.onSuccess).toBe(onSuccess);
      expect(config.onFailure).toBe(onFailure);
    });
  });
});

describe('RetryRecommendations', () => {
  describe('recommendStrategy', () => {
    test('should recommend PRODUCTION for production environment', () => {
      const strategy = RetryRecommendations.recommendStrategy({
        environment: 'production',
        usage: 'general',
        errorTolerance: 'medium',
        performanceRequirement: 'balanced'
      });

      expect(strategy).toEqual(RetryPresets.PRODUCTION);
    });

    test('should recommend CRITICAL for production critical usage', () => {
      const strategy = RetryRecommendations.recommendStrategy({
        environment: 'production',
        usage: 'critical',
        errorTolerance: 'low',
        performanceRequirement: 'balanced'
      });

      expect(strategy).toEqual(RetryPresets.CRITICAL);
    });

    test('should recommend REAL_TIME for production real-time usage', () => {
      const strategy = RetryRecommendations.recommendStrategy({
        environment: 'production',
        usage: 'real-time',
        errorTolerance: 'medium',
        performanceRequirement: 'fast'
      });

      expect(strategy).toEqual(RetryPresets.REAL_TIME);
    });

    test('should recommend BATCH_PROCESSING for production batch usage', () => {
      const strategy = RetryRecommendations.recommendStrategy({
        environment: 'production',
        usage: 'batch',
        errorTolerance: 'high',
        performanceRequirement: 'thorough'
      });

      expect(strategy).toEqual(RetryPresets.BATCH_PROCESSING);
    });

    test('should recommend DEVELOPMENT for development environment', () => {
      const strategy = RetryRecommendations.recommendStrategy({
        environment: 'development',
        usage: 'general',
        errorTolerance: 'high',
        performanceRequirement: 'balanced'
      });

      expect(strategy).toEqual(RetryPresets.DEVELOPMENT);
    });
  });

  describe('analyzeConfiguration', () => {
    test('should give perfect score for well-configured preset', () => {
      const analysis = RetryRecommendations.analyzeConfiguration(RetryPresets.PRODUCTION);
      
      expect(analysis.score).toBeGreaterThan(80);
      expect(analysis.warnings.length).toBe(0);
    });

    test('should detect high maxAttempts', () => {
      const config = { ...RetryPresets.PRODUCTION, maxAttempts: 15 };
      const analysis = RetryRecommendations.analyzeConfiguration(config);
      
      expect(analysis.score).toBeLessThan(100);
      expect(analysis.warnings.some(w => w.includes('Very high maxAttempts'))).toBe(true);
    });

    test('should detect low baseDelay', () => {
      const config = { ...RetryPresets.PRODUCTION, baseDelay: 200 };
      const analysis = RetryRecommendations.analyzeConfiguration(config);
      
      expect(analysis.suggestions.some(s => s.includes('Consider increasing baseDelay'))).toBe(true);
    });

    test('should detect disabled jitter', () => {
      const config = { ...RetryPresets.PRODUCTION, jitter: false };
      const analysis = RetryRecommendations.analyzeConfiguration(config);
      
      expect(analysis.suggestions.some(s => s.includes('Enable jitter'))).toBe(true);
    });

    test('should detect validation error retry', () => {
      const config = { 
        ...RetryPresets.PRODUCTION, 
        retryableErrors: [...RetryPresets.PRODUCTION.retryableErrors, ErrorType.VALIDATION_ERROR]
      };
      const analysis = RetryRecommendations.analyzeConfiguration(config);
      
      expect(analysis.warnings.some(w => w.includes('Retrying validation errors'))).toBe(true);
    });

    test('should detect ignored Retry-After headers', () => {
      const config = { ...RetryPresets.PRODUCTION, respectRetryAfter: false };
      const analysis = RetryRecommendations.analyzeConfiguration(config);
      
      expect(analysis.warnings.some(w => w.includes('Ignoring Retry-After headers'))).toBe(true);
    });

    test('should detect disabled circuit breaker', () => {
      const config = { ...RetryPresets.PRODUCTION, circuitBreakerThreshold: 0 };
      const analysis = RetryRecommendations.analyzeConfiguration(config);
      
      expect(analysis.suggestions.some(s => s.includes('Consider enabling circuit breaker'))).toBe(true);
    });
  });
});
