import { DEFAULT_RETRY_CONFIG } from './apiUtils';
import { RetryConfig } from '../types/common';
import { ErrorType } from '../errors/ErrorTypes';

/**
 * Pre-configured retry strategies for common scenarios
 */
export class RetryPresets {
  
  /**
   * Conservative retry strategy for production environments
   * - Low retry counts to minimize resource usage
   * - Longer delays to respect API limits
   * - Strict circuit breaker settings
   */
  static readonly PRODUCTION: RetryConfig = {
    enabled: true,
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitter: true,
    jitterFactor: 0.1,
    retryableErrors: [
      ErrorType.RATE_LIMIT_EXCEEDED,
      ErrorType.NETWORK_ERROR,
      ErrorType.JOB_NOT_READY,
      ErrorType.INVALID_RESPONSE_FORMAT
    ],
    retryableStatusCodes: [429, 500, 502, 503, 504],
    respectRetryAfter: true,
    circuitBreakerThreshold: 3,
    circuitBreakerResetTime: 60000
  };

  /**
   * Aggressive retry strategy for development/testing
   * - Higher retry counts for thorough testing
   * - Faster retries for quicker feedback
   * - More lenient circuit breaker
   */
  static readonly DEVELOPMENT: RetryConfig = {
    enabled: true,
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 15000,
    exponentialBase: 1.5,
    jitter: true,
    jitterFactor: 0.2,
    retryableErrors: [
      ErrorType.RATE_LIMIT_EXCEEDED,
      ErrorType.NETWORK_ERROR,
      ErrorType.JOB_NOT_READY,
      ErrorType.INVALID_RESPONSE_FORMAT,
      ErrorType.UNKNOWN_ERROR
    ],
    retryableStatusCodes: [429, 500, 502, 503, 504, 408],
    respectRetryAfter: true,
    circuitBreakerThreshold: 8,
    circuitBreakerResetTime: 30000
  };

  /**
   * High-throughput strategy for batch processing
   * - Optimized for bulk operations
   * - Fast retries with higher limits
   * - Specialized for job processing scenarios
   */
  static readonly BATCH_PROCESSING: RetryConfig = {
    enabled: true,
    maxAttempts: 8,
    baseDelay: 1000,
    maxDelay: 45000,
    exponentialBase: 1.8,
    jitter: true,
    jitterFactor: 0.15,
    retryableErrors: [
      ErrorType.RATE_LIMIT_EXCEEDED,
      ErrorType.NETWORK_ERROR,
      ErrorType.JOB_NOT_READY,
      ErrorType.JOB_PROCESSING,
      ErrorType.INVALID_RESPONSE_FORMAT
    ],
    retryableStatusCodes: [429, 500, 502, 503, 504, 425],
    respectRetryAfter: true,
    circuitBreakerThreshold: 10,
    circuitBreakerResetTime: 120000
  };

  /**
   * Real-time strategy for user-facing applications
   * - Fast retries for good UX
   * - Lower retry counts to prevent delays
   * - Quick circuit breaking to fail fast
   */
  static readonly REAL_TIME: RetryConfig = {
    enabled: true,
    maxAttempts: 3,
    baseDelay: 800,
    maxDelay: 8000,
    exponentialBase: 2.5,
    jitter: true,
    jitterFactor: 0.1,
    retryableErrors: [
      ErrorType.RATE_LIMIT_EXCEEDED,
      ErrorType.NETWORK_ERROR
    ],
    retryableStatusCodes: [429, 502, 503, 504],
    respectRetryAfter: true,
    circuitBreakerThreshold: 2,
    circuitBreakerResetTime: 15000
  };

  /**
   * Conservative strategy for critical operations
   * - Minimal retries to avoid side effects
   * - Only retry the safest error types
   * - Strict error filtering
   */
  static readonly CRITICAL: RetryConfig = {
    enabled: true,
    maxAttempts: 1,
    baseDelay: 3000,
    maxDelay: 10000,
    exponentialBase: 1,
    jitter: false,
    jitterFactor: 0,
    retryableErrors: [
      ErrorType.NETWORK_ERROR
    ],
    retryableStatusCodes: [502, 503, 504],
    respectRetryAfter: true,
    circuitBreakerThreshold: 1,
    circuitBreakerResetTime: 300000 // 5 minutes
  };

  /**
   * Disabled strategy for manual retry handling
   */
  static readonly DISABLED: RetryConfig = {
    enabled: false,
    maxAttempts: 0,
    baseDelay: 0,
    maxDelay: 0,
    exponentialBase: 1,
    jitter: false,
    jitterFactor: 0,
    retryableErrors: [],
    retryableStatusCodes: [],
    respectRetryAfter: false,
    circuitBreakerThreshold: 0,
    circuitBreakerResetTime: 0
  };
}

/**
 * Fluent builder for creating custom retry configurations
 */
export class RetryConfigBuilder {
  private config: Partial<RetryConfig> = {};

  static create(): RetryConfigBuilder {
    return new RetryConfigBuilder();
  }

  static fromPreset(preset: RetryConfig): RetryConfigBuilder {
    const builder = new RetryConfigBuilder();
    builder.config = { ...preset };
    return builder;
  }

  enable(enabled: boolean = true): RetryConfigBuilder {
    this.config.enabled = enabled;
    return this;
  }

  maxAttempts(attempts: number): RetryConfigBuilder {
    if (attempts < 0) throw new Error('maxAttempts must be non-negative');
    this.config.maxAttempts = attempts;
    return this;
  }

  delays(baseDelay: number, maxDelay?: number): RetryConfigBuilder {
    if (baseDelay < 0) throw new Error('baseDelay must be non-negative');
    this.config.baseDelay = baseDelay;
    if (maxDelay !== undefined) {
      if (maxDelay < baseDelay) throw new Error('maxDelay must be >= baseDelay');
      this.config.maxDelay = maxDelay;
    }
    return this;
  }

  exponentialBackoff(base: number = 2): RetryConfigBuilder {
    if (base < 1) throw new Error('exponentialBase must be >= 1');
    this.config.exponentialBase = base;
    return this;
  }

  withJitter(enabled: boolean = true, factor: number = 0.1): RetryConfigBuilder {
    if (factor < 0 || factor > 1) throw new Error('jitterFactor must be between 0 and 1');
    this.config.jitter = enabled;
    this.config.jitterFactor = factor;
    return this;
  }

  retryOn(...errorTypes: ErrorType[]): RetryConfigBuilder {
    this.config.retryableErrors = [...(this.config.retryableErrors || []), ...errorTypes];
    return this;
  }

  retryOnStatusCodes(...statusCodes: number[]): RetryConfigBuilder {
    this.config.retryableStatusCodes = [...(this.config.retryableStatusCodes || []), ...statusCodes];
    return this;
  }

  circuitBreaker(threshold: number, resetTimeMs: number): RetryConfigBuilder {
    if (threshold < 0) throw new Error('threshold must be non-negative');
    if (resetTimeMs < 0) throw new Error('resetTimeMs must be non-negative');
    this.config.circuitBreakerThreshold = threshold;
    this.config.circuitBreakerResetTime = resetTimeMs;
    return this;
  }

  respectRetryAfter(respect: boolean = true): RetryConfigBuilder {
    this.config.respectRetryAfter = respect;
    return this;
  }

  onRetry(callback: (attempt: number, error: any, delay: number) => void): RetryConfigBuilder {
    this.config.onRetry = callback;
    return this;
  }

  onSuccess(callback: (attempt: number) => void): RetryConfigBuilder {
    this.config.onSuccess = callback;
    return this;
  }

  onFailure(callback: (attempts: number, finalError: any) => void): RetryConfigBuilder {
    this.config.onFailure = callback;
    return this;
  }

  build(): RetryConfig {
    // Merge with defaults and validate
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...this.config };
    this.validateConfig(finalConfig);
    return finalConfig;
  }

  private validateConfig(config: RetryConfig): void {
    if (config.maxAttempts < 0) {
      throw new Error('maxAttempts must be non-negative');
    }
    if (config.baseDelay < 0) {
      throw new Error('baseDelay must be non-negative');
    }
    if (config.maxDelay < config.baseDelay) {
      throw new Error('maxDelay must be >= baseDelay');
    }
    if (config.exponentialBase < 1) {
      throw new Error('exponentialBase must be >= 1');
    }
    if (config.jitterFactor < 0 || config.jitterFactor > 1) {
      throw new Error('jitterFactor must be between 0 and 1');
    }
  }
}

/**
 * Retry strategy recommendation system
 */
export class RetryRecommendations {
  
  /**
   * Recommend retry strategy based on usage patterns
   */
  static recommendStrategy(context: {
    environment: 'production' | 'development' | 'testing';
    usage: 'real-time' | 'batch' | 'critical' | 'general';
    errorTolerance: 'low' | 'medium' | 'high';
    performanceRequirement: 'fast' | 'balanced' | 'thorough';
  }): RetryConfig {
    
    // Environment-based recommendations
    if (context.environment === 'production') {
      if (context.usage === 'critical') {
        return RetryPresets.CRITICAL;
      }
      if (context.usage === 'real-time') {
        return RetryPresets.REAL_TIME;
      }
      if (context.usage === 'batch') {
        return RetryPresets.BATCH_PROCESSING;
      }
      return RetryPresets.PRODUCTION;
    }

    if (context.environment === 'development') {
      return RetryPresets.DEVELOPMENT;
    }

    // Testing environment
    if (context.performanceRequirement === 'fast') {
      return RetryPresets.REAL_TIME;
    }
    if (context.performanceRequirement === 'thorough') {
      return RetryPresets.DEVELOPMENT;
    }

    return RetryPresets.PRODUCTION;
  }

  /**
   * Analyze current configuration and suggest improvements
   */
  static analyzeConfiguration(config: RetryConfig): {
    score: number;
    suggestions: string[];
    warnings: string[];
  } {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check for common misconfigurations
    if (config.maxAttempts > 10) {
      warnings.push('Very high maxAttempts may lead to resource exhaustion');
      score -= 15;
    }

    if (config.baseDelay < 500) {
      suggestions.push('Consider increasing baseDelay to reduce API pressure');
      score -= 5;
    }

    if (config.maxDelay > 120000) {
      warnings.push('Very high maxDelay may impact user experience');
      score -= 10;
    }

    if (!config.jitter) {
      suggestions.push('Enable jitter to prevent thundering herd problems');
      score -= 10;
    }

    if (config.retryableErrors.includes(ErrorType.VALIDATION_ERROR)) {
      warnings.push('Retrying validation errors is usually not beneficial');
      score -= 20;
    }

    if (!config.respectRetryAfter) {
      warnings.push('Ignoring Retry-After headers may worsen rate limiting');
      score -= 15;
    }

    if (config.circuitBreakerThreshold === 0) {
      suggestions.push('Consider enabling circuit breaker for better resilience');
      score -= 5;
    }

    return { score: Math.max(0, score), suggestions, warnings };
  }
}
