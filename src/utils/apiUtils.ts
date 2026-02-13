import { ApiResponse, RetryConfig, RetryContext, FetchConfig } from '../types/common';
import { ErrorType } from '../errors/ErrorTypes';
import { TransactionError } from '../errors/TransactionError';

const TRANSLATE_URL = 'https://translate.noves.fi';
const FORESIGHT_URL = 'https://foresight.noves.fi';
const PRICING_URL = 'https://pricing.noves.fi';

/**
 * Default retry configuration that provides sensible defaults for most use cases.
 * Retry is disabled by default to maintain 100% backward compatibility.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    enabled: false,
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitter: true,
    jitterFactor: 0.1,
    retryableErrors: [
        ErrorType.RATE_LIMIT_EXCEEDED,
        ErrorType.NETWORK_ERROR,
        ErrorType.JOB_NOT_READY,
        ErrorType.UNKNOWN_ERROR
    ],
    retryableStatusCodes: [429, 500, 502, 503, 504],
    respectRetryAfter: true,
    circuitBreakerThreshold: 5,
    circuitBreakerResetTime: 60000
};

/**
 * Convenience presets for common retry scenarios.
 * These provide different retry strategies optimized for various use cases.
 */
export const RETRY_PRESETS = {
    /**
     * Completely disables retry mechanism (default for backward compatibility)
     */
    disabled: { 
        ...DEFAULT_RETRY_CONFIG, 
        enabled: false 
    },
    
    /**
     * Conservative retry strategy with minimal retries and longer delays.
     * Suitable for rate-limited environments or when being respectful of server resources.
     */
    conservative: { 
        ...DEFAULT_RETRY_CONFIG, 
        enabled: true, 
        maxAttempts: 2, 
        baseDelay: 2000,
        maxDelay: 15000,
        circuitBreakerThreshold: 3
    },
    
    /**
     * Standard retry strategy with balanced settings.
     * Good default for most production applications.
     */
    standard: { 
        ...DEFAULT_RETRY_CONFIG, 
        enabled: true 
    },
    
    /**
     * Aggressive retry strategy with more attempts and shorter delays.
     * Use when high availability is critical and server resources allow.
     */
    aggressive: { 
        ...DEFAULT_RETRY_CONFIG, 
        enabled: true, 
        maxAttempts: 5, 
        baseDelay: 500,
        maxDelay: 20000,
        circuitBreakerThreshold: 8
    },
    
    /**
     * Production-optimized retry strategy with circuit breaker tuned for high-traffic scenarios.
     * Balances resilience with resource protection.
     */
    production: { 
        ...DEFAULT_RETRY_CONFIG, 
        enabled: true, 
        maxAttempts: 3, 
        baseDelay: 1000,
        maxDelay: 10000,
        circuitBreakerThreshold: 3,
        circuitBreakerResetTime: 30000
    },
    
    /**
     * Fast-fail strategy with minimal retries for time-sensitive operations.
     * Only retries obvious transient errors like rate limits.
     */
    fastFail: {
        ...DEFAULT_RETRY_CONFIG,
        enabled: true,
        maxAttempts: 2,
        baseDelay: 500,
        maxDelay: 2000,
        retryableErrors: [ErrorType.RATE_LIMIT_EXCEEDED, ErrorType.NETWORK_ERROR],
        circuitBreakerThreshold: 2,
        circuitBreakerResetTime: 10000
    }
};

/**
 * Merges user-provided retry configuration with defaults.
 * Ensures all required properties are present with sensible defaults.
 * 
 * @param baseConfig Base configuration to merge from (defaults to DEFAULT_RETRY_CONFIG)
 * @param userConfig Partial retry configuration provided by user
 * @returns Complete retry configuration with defaults applied
 */
export function mergeRetryConfig(
    baseConfig?: RetryConfig | Partial<RetryConfig>, 
    userConfig?: Partial<RetryConfig>
): RetryConfig {
    // Handle overloaded signature - if only one parameter provided, it's the user config
    if (arguments.length === 1 && baseConfig) {
        userConfig = baseConfig as Partial<RetryConfig>;
        baseConfig = DEFAULT_RETRY_CONFIG;
    }
    
    const base = baseConfig || DEFAULT_RETRY_CONFIG;
    
    if (!userConfig) {
        return { ...base } as RetryConfig;
    }
    
    return {
        ...base,
        ...userConfig,
        // Ensure arrays are properly merged, not replaced
        retryableErrors: userConfig.retryableErrors || (base as RetryConfig).retryableErrors,
        retryableStatusCodes: userConfig.retryableStatusCodes || (base as RetryConfig).retryableStatusCodes
    } as RetryConfig;
}

/**
 * Error-specific retry strategy configuration.
 * Defines how different error types should be handled with tailored retry behaviors.
 */
interface ErrorSpecificStrategy {
  errorType: ErrorType;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffType: 'exponential' | 'linear' | 'fixed' | 'adaptive';
  jitterFactor: number;
  shouldRetry: (attempt: number, error: any, context: AdaptiveRetryContext) => boolean;
  calculateDelay: (attempt: number, baseDelay: number, context: AdaptiveRetryContext) => number;
}

/**
 * Enhanced retry context with adaptive capabilities and error history.
 * Tracks performance patterns and error history for intelligent decision making.
 */
interface AdaptiveRetryContext {
  operationId: string;
  startTime: number;
  failures: number;
  lastFailureTime: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  errorHistory: Array<{
    errorType: ErrorType;
    timestamp: number;
    recoveryTime?: number;
  }>;
  successfulRecoveries: number;
  avgRecoveryTime: number;
  recentPerformance: 'good' | 'degraded' | 'poor';
  lastError?: any;
}

/**
 * Retry budget configuration for preventing resource exhaustion.
 */
interface RetryBudget {
  maxRetries: number;
  windowSizeMs: number;
  currentRetries: number;
  windowStart: number;
}

/**
 * Error-type specific circuit breaker state.
 */
interface ErrorTypeCircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  errorType: ErrorType;
}

/**
 * Context information for tracking retry attempts and circuit breaker state.
 * Used internally by the retry engine to maintain state across operations.
 */
interface RetryContextInternal {
  operationId: string;
  startTime: number;
  failures: number;
  lastFailureTime: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

/**
 * Intelligent retry engine with error-specific strategies and adaptive behavior.
 * This enhanced engine learns from patterns and adapts retry behavior accordingly.
 */
class IntelligentRetryEngine {
  private adaptiveContexts = new Map<string, AdaptiveRetryContext>();
  private globalPerformanceMetrics = {
    avgResponseTime: 1000,
    successRate: 0.95,
    errorRateByType: new Map<ErrorType, number>()
  };

  /**
   * Execute a request function with intelligent retry logic applied.
   * @param requestFn Function that makes the actual request
   * @param config Retry configuration to use
   * @param operationId Unique identifier for this operation type
   * @returns Promise that resolves with the request result
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    config: RetryConfig,
    operationId: string
  ): Promise<T> {
    if (!config.enabled) {
      return requestFn();
    }

    // Check retry budget
    if (!retryBudgetManager.canRetry(operationId)) {
      throw new Error(`Retry budget exhausted for operation: ${operationId}`);
    }

    const context = this.getOrCreateAdaptiveContext(operationId);
    const strategy = this.determineRetryStrategy(context, config);
    
    if (this.isCircuitOpen(context, strategy, config)) {
      throw new Error(`Circuit breaker is open for operation: ${operationId}`);
    }

    // Check predictive failure
    if (predictiveAnalyzer.shouldPreemptivelyFail(operationId, context)) {
      throw new Error(`Predictive analysis suggests operation will fail: ${operationId}`);
    }

    let lastError: any;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
      try {
        // Consume retry budget
        retryBudgetManager.consumeRetry(operationId);
        
        const result = await requestFn();
        const responseTime = Date.now() - startTime;
        
        this.recordSuccess(context, responseTime);
        this.updatePerformanceMetrics(operationId, true, responseTime);
        predictiveAnalyzer.recordMetrics(operationId, true, responseTime);
        
        if (config.onSuccess) {
          config.onSuccess(attempt);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        const errorType = this.extractErrorType(error);
        
        this.recordError(context, errorType);
        predictiveAnalyzer.recordMetrics(operationId, false, Date.now() - startTime, errorType);
        
        if (attempt === strategy.maxAttempts || !strategy.shouldRetry(attempt, error, context)) {
          this.recordFailure(context);
          this.updatePerformanceMetrics(operationId, false, Date.now() - startTime);
          
          if (config.onFailure) {
            config.onFailure(attempt, error);
          }
          
          throw this.enhanceErrorWithRetryInfo(error, attempt, context);
        }

        const delay = strategy.calculateDelay(attempt, strategy.baseDelay, context);
        
        if (config.onRetry) {
          config.onRetry(attempt, error, delay);
        }

        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Determine the optimal retry strategy based on error type and context.
   */
  private determineRetryStrategy(
    context: AdaptiveRetryContext, 
    config: RetryConfig
  ): ErrorSpecificStrategy {
    // Use error-specific strategy if available
    if (context.errorHistory.length > 0) {
      const lastErrorType = context.errorHistory[context.errorHistory.length - 1].errorType;
      if (ERROR_SPECIFIC_STRATEGIES[lastErrorType]) {
        return this.adaptStrategy(ERROR_SPECIFIC_STRATEGIES[lastErrorType], context, config);
      }
    }

    // Fallback to general strategy based on performance
    return this.createGeneralStrategy(context, config);
  }

  /**
   * Adapt strategy based on recent performance and context.
   */
  private adaptStrategy(
    baseStrategy: ErrorSpecificStrategy,
    context: AdaptiveRetryContext,
    config: RetryConfig
  ): ErrorSpecificStrategy {
    // Adapt strategy based on recent performance
    const adapted = { ...baseStrategy };

    if (context.recentPerformance === 'poor') {
      // Be more conservative when performance is poor
      adapted.maxAttempts = Math.max(1, Math.floor(adapted.maxAttempts * 0.7));
      adapted.baseDelay = Math.floor(adapted.baseDelay * 1.5);
    } else if (context.recentPerformance === 'good' && context.successfulRecoveries > 3) {
      // Be more aggressive when performance is good
      adapted.maxAttempts = Math.min(10, Math.floor(adapted.maxAttempts * 1.2));
      adapted.baseDelay = Math.floor(adapted.baseDelay * 0.8);
    }

    // Override with user configuration if provided
    if (config.maxAttempts !== DEFAULT_RETRY_CONFIG.maxAttempts) {
      adapted.maxAttempts = config.maxAttempts;
    }
    if (config.baseDelay !== DEFAULT_RETRY_CONFIG.baseDelay) {
      adapted.baseDelay = config.baseDelay;
    }

    return adapted;
  }

  /**
   * Create a general strategy when no error-specific strategy is available.
   */
  private createGeneralStrategy(
    context: AdaptiveRetryContext,
    config: RetryConfig
  ): ErrorSpecificStrategy {
    return {
      errorType: ErrorType.UNKNOWN_ERROR,
      maxAttempts: config.maxAttempts,
      baseDelay: config.baseDelay,
      maxDelay: config.maxDelay,
      backoffType: 'exponential',
      jitterFactor: config.jitterFactor,
      shouldRetry: (attempt) => attempt <= config.maxAttempts,
      calculateDelay: (attempt, baseDelay) => {
        return Math.min(baseDelay * Math.pow(config.exponentialBase, attempt - 1), config.maxDelay);
      }
    };
  }

  /**
   * Extract error type from various error formats.
   */
  private extractErrorType(error: any): ErrorType {
    if (error instanceof TransactionError) {
      return error.errorType;
    }
    
    // Try to infer from HTTP status
    if (error.response?.status === 429) {
      return ErrorType.RATE_LIMIT_EXCEEDED;
    }
    if (error.response?.status === 401) {
      return ErrorType.UNAUTHORIZED;
    }
    if (error.response?.status === 425) {
      return ErrorType.JOB_NOT_READY;
    }
    
    // Network error detection
    if (error instanceof TypeError || error.code === 'NETWORK_ERROR') {
      return ErrorType.NETWORK_ERROR;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Record error occurrence and update context.
   */
  private recordError(context: AdaptiveRetryContext, errorType: ErrorType): void {
    context.errorHistory.push({
      errorType,
      timestamp: Date.now()
    });

    // Keep only recent history (last 50 errors)
    if (context.errorHistory.length > 50) {
      context.errorHistory = context.errorHistory.slice(-50);
    }

    // Store last error for strategy decisions
    context.lastError = errorType;

    // Update performance assessment
    this.updatePerformanceAssessment(context);
  }

  /**
   * Record successful operation and recovery metrics.
   */
  private recordSuccess(context: AdaptiveRetryContext, responseTime: number): void {
    // Record recovery if this follows an error
    if (context.errorHistory.length > 0) {
      const lastError = context.errorHistory[context.errorHistory.length - 1];
      if (!lastError.recoveryTime) {
        lastError.recoveryTime = Date.now() - lastError.timestamp;
        context.successfulRecoveries++;
        
        // Update average recovery time
        const recoveryTimes = context.errorHistory
          .filter(e => e.recoveryTime)
          .map(e => e.recoveryTime!);
        
        if (recoveryTimes.length > 0) {
          context.avgRecoveryTime = recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
        }
      }
    }

    this.updatePerformanceAssessment(context);
  }

  /**
   * Update performance assessment based on recent patterns.
   */
  private updatePerformanceAssessment(context: AdaptiveRetryContext): void {
    const recentErrors = context.errorHistory.filter(
      e => Date.now() - e.timestamp < 300000 // Last 5 minutes
    );

    const errorRate = recentErrors.length / Math.max(context.successfulRecoveries + recentErrors.length, 1);

    if (errorRate > 0.3) {
      context.recentPerformance = 'poor';
    } else if (errorRate > 0.1) {
      context.recentPerformance = 'degraded';
    } else {
      context.recentPerformance = 'good';
    }
  }

  /**
   * Check if circuit breaker should prevent requests.
   */
  private isCircuitOpen(
    context: AdaptiveRetryContext, 
    strategy: ErrorSpecificStrategy,
    config: RetryConfig
  ): boolean {
    if (strategy.errorType) {
      return !intelligentCircuitBreaker.shouldAllowRequest(
        context.operationId, 
        strategy.errorType, 
        config
      );
    }
    
    // Fallback to basic circuit breaker logic
    if (context.circuitBreakerState === 'OPEN') {
      const now = Date.now();
      if (now - context.lastFailureTime > config.circuitBreakerResetTime) {
        context.circuitBreakerState = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Record failure and update circuit breaker state.
   */
  private recordFailure(context: AdaptiveRetryContext): void {
    context.failures++;
    context.lastFailureTime = Date.now();
    
    if (context.failures >= 5) {
      context.circuitBreakerState = 'OPEN';
    }
  }

  /**
   * Enhance error with retry metadata for debugging.
   */
  private enhanceErrorWithRetryInfo(
    error: any, 
    attempts: number, 
    context: AdaptiveRetryContext
  ): any {
    if (error instanceof TransactionError) {
      // Add retry metadata to existing error
      (error as any).retryMetadata = {
        attempts,
        totalDuration: Date.now() - context.startTime,
        errorHistory: context.errorHistory.slice(-5), // Last 5 errors
        recentPerformance: context.recentPerformance
      };
    }
    return error;
  }

  /**
   * Get or create adaptive context for operation tracking.
   */
  private getOrCreateAdaptiveContext(operationId: string): AdaptiveRetryContext {
    if (!this.adaptiveContexts.has(operationId)) {
      this.adaptiveContexts.set(operationId, {
        operationId,
        startTime: Date.now(),
        failures: 0,
        lastFailureTime: 0,
        circuitBreakerState: 'CLOSED',
        errorHistory: [],
        successfulRecoveries: 0,
        avgRecoveryTime: 0,
        recentPerformance: 'good'
      });
    }
    return this.adaptiveContexts.get(operationId)!;
  }

  /**
   * Update global performance metrics for adaptive decisions.
   */
  private updatePerformanceMetrics(operationId: string, success: boolean, responseTime: number): void {
    if (success) {
      this.globalPerformanceMetrics.avgResponseTime = 
        (this.globalPerformanceMetrics.avgResponseTime * 0.9) + (responseTime * 0.1);
    }
    
    // Update success rate
    this.globalPerformanceMetrics.successRate = 
      (this.globalPerformanceMetrics.successRate * 0.95) + (success ? 0.05 : 0);
  }

  /**
   * Delay execution for the specified number of milliseconds.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error-specific retry strategies with optimized patterns for different failure types.
 * Each strategy is tailored to the expected behavior and recovery patterns of specific errors.
 */
const ERROR_SPECIFIC_STRATEGIES: Record<ErrorType, ErrorSpecificStrategy> = {
  [ErrorType.RATE_LIMIT_EXCEEDED]: {
    errorType: ErrorType.RATE_LIMIT_EXCEEDED,
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 60000,
    backoffType: 'exponential',
    jitterFactor: 0.25, // Higher jitter to spread out requests
    shouldRetry: (attempt, error, context) => {
      // Always retry rate limits, but respect Retry-After
      return attempt <= 5;
    },
    calculateDelay: (attempt, baseDelay, context) => {
      // Respect Retry-After header + exponential backoff
      const retryAfter = extractRetryAfterFromError(context.lastError);
      if (retryAfter) {
        return Math.min(retryAfter * 1000, 60000);
      }
      return Math.min(baseDelay * Math.pow(2, attempt - 1), 60000);
    }
  },

  [ErrorType.JOB_NOT_READY]: {
    errorType: ErrorType.JOB_NOT_READY,
    maxAttempts: 10,
    baseDelay: 3000,
    maxDelay: 30000,
    backoffType: 'linear', // Jobs typically become ready at predictable intervals
    jitterFactor: 0.1,
    shouldRetry: (attempt, error, context) => {
      // Retry jobs for longer periods as they may take time to process
      const timeSinceStart = Date.now() - context.startTime;
      return attempt <= 10 && timeSinceStart < 300000; // 5 minute max
    },
    calculateDelay: (attempt, baseDelay, context) => {
      // Linear backoff for job processing
      return Math.min(baseDelay + (attempt * 1000), 30000);
    }
  },

  [ErrorType.JOB_PROCESSING]: {
    errorType: ErrorType.JOB_PROCESSING,
    maxAttempts: 8,
    baseDelay: 5000,
    maxDelay: 45000,
    backoffType: 'linear',
    jitterFactor: 0.15,
    shouldRetry: (attempt, error, context) => {
      // Similar to JOB_NOT_READY but with longer initial delays
      const timeSinceStart = Date.now() - context.startTime;
      return attempt <= 8 && timeSinceStart < 420000; // 7 minute max
    },
    calculateDelay: (attempt, baseDelay, context) => {
      return Math.min(baseDelay + (attempt * 2000), 45000);
    }
  },

  [ErrorType.NETWORK_ERROR]: {
    errorType: ErrorType.NETWORK_ERROR,
    maxAttempts: 4,
    baseDelay: 1000,
    maxDelay: 15000,
    backoffType: 'exponential',
    jitterFactor: 0.2,
    shouldRetry: (attempt, error, context) => {
      // Quick retries for network issues
      return attempt <= 4;
    },
    calculateDelay: (attempt, baseDelay, context) => {
      return Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
    }
  },

  [ErrorType.INVALID_RESPONSE_FORMAT]: {
    errorType: ErrorType.INVALID_RESPONSE_FORMAT,
    maxAttempts: 3,
    baseDelay: 1500,
    maxDelay: 10000,
    backoffType: 'exponential',
    jitterFactor: 0.1,
    shouldRetry: (attempt, error, context) => {
      // Retry format errors but not too aggressively
      return attempt <= 3;
    },
    calculateDelay: (attempt, baseDelay, context) => {
      return Math.min(baseDelay * Math.pow(1.5, attempt - 1), 10000);
    }
  },

  [ErrorType.UNKNOWN_ERROR]: {
    errorType: ErrorType.UNKNOWN_ERROR,
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffType: 'exponential',
    jitterFactor: 0.15,
    shouldRetry: (attempt, error, context) => {
      // Conservative retries for unknown errors
      return attempt <= 2;
    },
    calculateDelay: (attempt, baseDelay, context) => {
      return Math.min(baseDelay * Math.pow(2, attempt - 1), 8000);
    }
  },

  // Non-retryable errors
  [ErrorType.UNAUTHORIZED]: {
    errorType: ErrorType.UNAUTHORIZED,
    maxAttempts: 0, // Never retry auth errors
    baseDelay: 0,
    maxDelay: 0,
    backoffType: 'fixed',
    jitterFactor: 0,
    shouldRetry: () => false,
    calculateDelay: () => 0
  },

  [ErrorType.INVALID_API_KEY]: {
    errorType: ErrorType.INVALID_API_KEY,
    maxAttempts: 0,
    baseDelay: 0,
    maxDelay: 0,
    backoffType: 'fixed',
    jitterFactor: 0,
    shouldRetry: () => false,
    calculateDelay: () => 0
  },

  [ErrorType.VALIDATION_ERROR]: {
    errorType: ErrorType.VALIDATION_ERROR,
    maxAttempts: 0,
    baseDelay: 0,
    maxDelay: 0,
    backoffType: 'fixed',
    jitterFactor: 0,
    shouldRetry: () => false,
    calculateDelay: () => 0
  },

  [ErrorType.INVALID_REQUEST]: {
    errorType: ErrorType.INVALID_REQUEST,
    maxAttempts: 0,
    baseDelay: 0,
    maxDelay: 0,
    backoffType: 'fixed',
    jitterFactor: 0,
    shouldRetry: () => false,
    calculateDelay: () => 0
  },

  [ErrorType.JOB_NOT_FOUND]: {
    errorType: ErrorType.JOB_NOT_FOUND,
    maxAttempts: 0,
    baseDelay: 0,
    maxDelay: 0,
    backoffType: 'fixed',
    jitterFactor: 0,
    shouldRetry: () => false,
    calculateDelay: () => 0
  }
};

/**
 * Helper function to extract Retry-After from error objects.
 */
function extractRetryAfterFromError(error: any): number | undefined {
  if (!error) return undefined;
  
  // Extract from TransactionError details
  if (error instanceof TransactionError && error.details?.retryAfter) {
    return error.details.retryAfter;
  }
  
  // Extract from HTTP response headers
  if (error.response?.headers?.['retry-after']) {
    return parseInt(error.response.headers['retry-after'], 10);
  }
  
  return undefined;
}

/**
 * Retry budget manager to prevent resource exhaustion.
 * Tracks retry attempts within time windows to avoid overwhelming the system.
 */
class RetryBudgetManager {
  private budgets = new Map<string, RetryBudget>();
  
  canRetry(operationId: string, maxRetriesPerWindow = 50, windowSizeMs = 60000): boolean {
    const budget = this.getOrCreateBudget(operationId, maxRetriesPerWindow, windowSizeMs);
    
    // Reset window if expired
    if (Date.now() - budget.windowStart > budget.windowSizeMs) {
      budget.currentRetries = 0;
      budget.windowStart = Date.now();
    }
    
    return budget.currentRetries < budget.maxRetries;
  }
  
  consumeRetry(operationId: string): void {
    const budget = this.budgets.get(operationId);
    if (budget) {
      budget.currentRetries++;
    }
  }
  
  private getOrCreateBudget(
    operationId: string, 
    maxRetries: number, 
    windowSizeMs: number
  ): RetryBudget {
    if (!this.budgets.has(operationId)) {
      this.budgets.set(operationId, {
        maxRetries,
        windowSizeMs,
        currentRetries: 0,
        windowStart: Date.now()
      });
    }
    return this.budgets.get(operationId)!;
  }
}

/**
 * Predictive analyzer for optimizing retry attempts.
 * Tracks patterns and performance metrics to predict failure likelihood.
 */
class PredictiveAnalyzer {
  private operationMetrics = new Map<string, {
    recentLatencies: number[];
    errorPatterns: Array<{ timestamp: number; errorType: ErrorType }>;
    successRate: number;
    avgResponseTime: number;
  }>();

  shouldPreemptivelyFail(operationId: string, context: AdaptiveRetryContext): boolean {
    const metrics = this.operationMetrics.get(operationId);
    if (!metrics) return false;

    // Check if error rate is extremely high recently
    const recentErrors = metrics.errorPatterns.filter(
      e => Date.now() - e.timestamp < 30000 // Last 30 seconds
    );
    
    if (recentErrors.length > 10) {
      return true; // Too many recent errors
    }

    // Check for systematic failure patterns
    const lastFiveErrors = context.errorHistory.slice(-5);
    if (lastFiveErrors.length === 5) {
      const errorTypes = lastFiveErrors.map(e => e.errorType);
      const uniqueTypes = new Set(errorTypes);
      
      // If all recent errors are the same non-retryable type
      if (uniqueTypes.size === 1 && 
          [ErrorType.UNAUTHORIZED, ErrorType.INVALID_API_KEY, ErrorType.VALIDATION_ERROR]
            .includes(lastFiveErrors[0].errorType)) {
        return true;
      }
    }

    return false;
  }

  recordMetrics(operationId: string, success: boolean, responseTime: number, errorType?: ErrorType): void {
    if (!this.operationMetrics.has(operationId)) {
      this.operationMetrics.set(operationId, {
        recentLatencies: [],
        errorPatterns: [],
        successRate: 1.0,
        avgResponseTime: responseTime
      });
    }

    const metrics = this.operationMetrics.get(operationId)!;
    
    if (success) {
      metrics.recentLatencies.push(responseTime);
      if (metrics.recentLatencies.length > 20) {
        metrics.recentLatencies = metrics.recentLatencies.slice(-20);
      }
      
      metrics.avgResponseTime = 
        (metrics.avgResponseTime * 0.9) + (responseTime * 0.1);
      
      metrics.successRate = (metrics.successRate * 0.95) + 0.05;
    } else if (errorType) {
      metrics.errorPatterns.push({ timestamp: Date.now(), errorType });
      if (metrics.errorPatterns.length > 50) {
        metrics.errorPatterns = metrics.errorPatterns.slice(-50);
      }
      
      metrics.successRate = metrics.successRate * 0.95;
    }
  }

  getHealthScore(operationId: string): number {
    const metrics = this.operationMetrics.get(operationId);
    if (!metrics) return 1.0;

    // Combine success rate and response time health
    const responseTimeHealth = metrics.avgResponseTime < 5000 ? 1.0 : 
                              metrics.avgResponseTime < 15000 ? 0.7 : 0.3;
    
    return (metrics.successRate * 0.7) + (responseTimeHealth * 0.3);
  }
}

/**
 * Intelligent circuit breaker with error-type awareness.
 * Maintains separate circuit states for different error types.
 */
class IntelligentCircuitBreaker {
  private circuits = new Map<string, Map<ErrorType, ErrorTypeCircuitState>>();

  shouldAllowRequest(operationId: string, errorType: ErrorType, config: RetryConfig): boolean {
    const circuitMap = this.getOrCreateCircuitMap(operationId);
    const circuit = this.getOrCreateCircuit(circuitMap, errorType);

    switch (circuit.state) {
      case 'CLOSED':
        return true;
        
      case 'OPEN':
        // Check if circuit should transition to HALF_OPEN
        const timeSinceLastFailure = Date.now() - circuit.lastFailureTime;
        const resetTime = this.getResetTimeForErrorType(errorType, config);
        
        if (timeSinceLastFailure > resetTime) {
          circuit.state = 'HALF_OPEN';
          return true;
        }
        return false;
        
      case 'HALF_OPEN':
        return true; // Allow one request to test if service recovered
    }
  }

  recordSuccess(operationId: string, errorType: ErrorType): void {
    const circuitMap = this.circuits.get(operationId);
    if (circuitMap) {
      const circuit = circuitMap.get(errorType);
      if (circuit) {
        circuit.failures = 0;
        circuit.state = 'CLOSED';
      }
    }
  }

  recordFailure(operationId: string, errorType: ErrorType, config: RetryConfig): void {
    const circuitMap = this.getOrCreateCircuitMap(operationId);
    const circuit = this.getOrCreateCircuit(circuitMap, errorType);

    circuit.failures++;
    circuit.lastFailureTime = Date.now();

    const threshold = this.getThresholdForErrorType(errorType, config);
    if (circuit.failures >= threshold) {
      circuit.state = 'OPEN';
    }
  }

  private getThresholdForErrorType(errorType: ErrorType, config: RetryConfig): number {
    // Different thresholds for different error types
    switch (errorType) {
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return 3; // Quick circuit break for rate limits
      case ErrorType.NETWORK_ERROR:
        return 5; // Network issues might be transient
      case ErrorType.JOB_NOT_READY:
      case ErrorType.JOB_PROCESSING:
        return 8; // Job processing errors are expected
      default:
        return config.circuitBreakerThreshold;
    }
  }

  private getResetTimeForErrorType(errorType: ErrorType, config: RetryConfig): number {
    // Different reset times for different error types
    switch (errorType) {
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return 60000; // 1 minute for rate limits
      case ErrorType.NETWORK_ERROR:
        return 30000; // 30 seconds for network errors
      case ErrorType.JOB_NOT_READY:
      case ErrorType.JOB_PROCESSING:
        return 120000; // 2 minutes for job processing
      default:
        return config.circuitBreakerResetTime;
    }
  }

  private getOrCreateCircuitMap(operationId: string): Map<ErrorType, ErrorTypeCircuitState> {
    if (!this.circuits.has(operationId)) {
      this.circuits.set(operationId, new Map());
    }
    return this.circuits.get(operationId)!;
  }

  private getOrCreateCircuit(
    circuitMap: Map<ErrorType, ErrorTypeCircuitState>, 
    errorType: ErrorType
  ): ErrorTypeCircuitState {
    if (!circuitMap.has(errorType)) {
      circuitMap.set(errorType, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
        errorType
      });
    }
    return circuitMap.get(errorType)!;
  }
}

/**
 * Error recovery patterns for specific Noves API scenarios.
 * Provides specialized handling for common error patterns.
 */
class ErrorRecoveryPatterns {
  
  static async handleJobProcessingError(
    context: AdaptiveRetryContext,
    error: TransactionError,
    config: RetryConfig
  ): Promise<{ shouldRetry: boolean; delay: number; strategy?: string }> {
    
    // Job processing errors often require longer waits
    const jobDetails = error.details;
    
    if (jobDetails?.estimatedTimeRemaining) {
      // If API provides estimated time, use it
      const estimatedDelay = Math.min(jobDetails.estimatedTimeRemaining * 1000, 60000);
      return {
        shouldRetry: true,
        delay: estimatedDelay,
        strategy: 'estimated-completion-time'
      };
    }
    
    // Use historical data to estimate delay
    const avgRecoveryTime = context.avgRecoveryTime || 10000;
    const adaptiveDelay = Math.min(avgRecoveryTime * 1.2, 45000);
    
    return {
      shouldRetry: context.errorHistory.length < 8,
      delay: adaptiveDelay,
      strategy: 'historical-adaptive'
    };
  }

  static async handleRateLimitError(
    context: AdaptiveRetryContext,
    error: TransactionError,
    config: RetryConfig
  ): Promise<{ shouldRetry: boolean; delay: number; strategy?: string }> {
    
    // Extract Retry-After header if available
    const retryAfter = error.details?.retryAfter || 
                      error.httpStatusCode === 429 ? 60 : null;
    
    if (retryAfter) {
      return {
        shouldRetry: true,
        delay: Math.min(retryAfter * 1000, 120000), // Max 2 minutes
        strategy: 'retry-after-header'
      };
    }
    
    // Exponential backoff with higher base for rate limits
    const baseDelay = 5000; // Start with 5 seconds
    const attempt = context.errorHistory.filter(
      e => e.errorType === ErrorType.RATE_LIMIT_EXCEEDED
    ).length;
    
    const delay = Math.min(baseDelay * Math.pow(2, attempt), 120000);
    
    return {
      shouldRetry: attempt < 5,
      delay,
      strategy: 'exponential-backoff-with-limit'
    };
  }

  static async handleNetworkError(
    context: AdaptiveRetryContext,
    error: any,
    config: RetryConfig
  ): Promise<{ shouldRetry: boolean; delay: number; strategy?: string }> {
    
    // Quick retries for network errors
    const networkAttempts = context.errorHistory.filter(
      e => e.errorType === ErrorType.NETWORK_ERROR
    ).length;
    
    if (networkAttempts >= 4) {
      return { shouldRetry: false, delay: 0, strategy: 'max-network-retries-exceeded' };
    }
    
    // Quick exponential backoff for network issues
    const delay = Math.min(1000 * Math.pow(2, networkAttempts), 8000);
    
    return {
      shouldRetry: true,
      delay,
      strategy: 'fast-network-recovery'
    };
  }

  static getRecoveryPattern(errorType: ErrorType) {
    switch (errorType) {
      case ErrorType.JOB_PROCESSING:
      case ErrorType.JOB_NOT_READY:
        return this.handleJobProcessingError;
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return this.handleRateLimitError;
      case ErrorType.NETWORK_ERROR:
        return this.handleNetworkError;
      default:
        return null;
    }
  }
}

// Global intelligent components
const retryBudgetManager = new RetryBudgetManager();
const predictiveAnalyzer = new PredictiveAnalyzer();
const intelligentCircuitBreaker = new IntelligentCircuitBreaker();

// Export ErrorRecoveryPatterns for testing
export { ErrorRecoveryPatterns };

// Global intelligent retry engine instance
const retryEngine = new IntelligentRetryEngine();

/**
 * Combines multiple AbortSignals into a single signal that aborts when any input signal aborts.
 * Used internally to merge user-provided signals with timeout-generated signals.
 * @param signals Array of AbortSignal instances to combine
 * @returns A single AbortSignal that aborts when any input signal aborts
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  if (signals.length === 1) return signals[0];

  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

/**
 * Builds the AbortSignal and cleanup function for a single fetch request attempt.
 * Handles combining timeout signals, user-provided signals, and per-request signals.
 * @param fetchConfig Optional SDK-level fetch configuration
 * @param perRequestSignal Optional per-request AbortSignal from RequestInit
 * @returns Object with the combined signal and a cleanup function to clear timeouts
 */
function buildRequestSignal(
  fetchConfig?: FetchConfig,
  perRequestSignal?: AbortSignal | null
): { signal: AbortSignal | undefined; cleanup: () => void } {
  const signals: AbortSignal[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timeoutController: AbortController | undefined;

  // Setup per-attempt timeout
  if (fetchConfig?.timeout) {
    timeoutController = new AbortController();
    timeoutId = setTimeout(() => timeoutController!.abort(), fetchConfig.timeout);
    signals.push(timeoutController.signal);
  }

  // User-provided global signal
  if (fetchConfig?.signal) {
    signals.push(fetchConfig.signal);
  }

  // Per-request signal from options
  if (perRequestSignal) {
    signals.push(perRequestSignal);
  }

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  if (signals.length === 0) {
    return { signal: undefined, cleanup };
  }

  if (signals.length === 1) {
    return { signal: signals[0], cleanup };
  }

  return { signal: combineAbortSignals(...signals), cleanup };
}

/**
 * Unified response processing function that handles errors consistently across all clients.
 * @param response The fetch Response object
 * @returns Promise that resolves to an ApiResponse
 */
async function processResponse(response: Response): Promise<ApiResponse> {
  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    const error = new Error('Rate limit exceeded');
    (error as any).response = { status: 429, headers: { 'retry-after': retryAfter } };
    throw error;
  }

  // Handle unauthorized
  if (response.status === 401) {
    return {
      succeeded: false,
      response: { message: 'Unauthorized' },
      httpStatusCode: 401,
      errorType: 'UNAUTHORIZED'
    };
  }

  // Handle job not ready (425 Too Early)
  if (response.status === 425) {
    const responseData = await response.json();
    return {
      succeeded: false,
      response: { message: 'Job not ready yet', detail: responseData.detail },
      httpStatusCode: 425,
      errorType: 'JOB_NOT_READY'
    };
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    // Handle empty or invalid JSON responses
    return {
      succeeded: false,
      response: { message: 'Invalid response format' },
      httpStatusCode: response.status,
      errorType: 'INVALID_RESPONSE_FORMAT'
    };
  }

  if (!response.ok) {
    // For retryable status codes, throw an error to trigger retry mechanism
    if ([425, 429, 500, 502, 503, 504].includes(response.status)) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).response = { status: response.status, data: responseData };
      throw error;
    }
    
    // For non-retryable errors, return error response
    return {
      succeeded: false,
      response: responseData,
      httpStatusCode: response.status
    };
  }

  return {
    succeeded: true,
    response: responseData,
    httpStatusCode: response.status
  };
}

/**
 * Creates a retry-enabled HTTP client for the Translate API.
 * @param ecosystem The blockchain ecosystem identifier
 * @param apiKey The API key for authentication
 * @param retryConfig Optional retry configuration for enhanced resilience
 * @param fetchConfig Optional fetch configuration for timeouts, abort signals, and custom headers
 * @returns A request function with retry capabilities
 */
export function createTranslateClient(
    ecosystem: string, 
    apiKey: string, 
    retryConfig?: Partial<RetryConfig>,
    fetchConfig?: FetchConfig
) {
  const config = mergeRetryConfig(retryConfig);
  
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const operationId = `translate-${ecosystem}-${endpoint}`;
    
    try {
      return await retryEngine.executeWithRetry(
        async () => {
          // Check if user signal is already aborted before attempting
          if (fetchConfig?.signal?.aborted) {
            throw new DOMException('The operation was aborted.', 'AbortError');
          }

          const url = `${TRANSLATE_URL}/${ecosystem}/${endpoint}`;
          const { signal, cleanup } = buildRequestSignal(fetchConfig, options.signal as AbortSignal | undefined);

          try {
            const response = await fetch(url, {
              ...options,
              method,
              signal,
              headers: {
                ...fetchConfig?.headers,
                ...options.headers,
                'apiKey': apiKey,
                'Content-Type': 'application/json',
              },
            });

            return processResponse(response);
          } catch (error: any) {
            // Differentiate between timeout and user-initiated abort
            if (error.name === 'AbortError') {
              if (fetchConfig?.signal?.aborted) {
                // User-initiated abort - propagate directly (non-retryable)
                throw error;
              }
              if (fetchConfig?.timeout) {
                // Timeout - convert to network error for retry eligibility
                const timeoutError = new Error(`Request timed out after ${fetchConfig.timeout}ms`);
                (timeoutError as any).code = 'NETWORK_ERROR';
                throw timeoutError;
              }
              // Per-request signal abort - propagate directly
              throw error;
            }
            throw error;
          } finally {
            cleanup();
          }
        },
        config,
        operationId
      );
    } catch (error: any) {
      // Propagate abort errors directly to the user
      if (error.name === 'AbortError') {
        throw error;
      }
      // Convert thrown errors to ApiResponse format for consistency
      return {
        succeeded: false,
        response: { message: error.message || 'Request failed after retries' },
        httpStatusCode: error.response?.status || 500
      };
    }
  };
}

/**
 * Creates a retry-enabled HTTP client for the Foresight API.
 * @param apiKey The API key for authentication
 * @param retryConfig Optional retry configuration for enhanced resilience
 * @param fetchConfig Optional fetch configuration for timeouts, abort signals, and custom headers
 * @returns A request function with retry capabilities
 */
export function createForesightClient(
    apiKey: string,
    retryConfig?: Partial<RetryConfig>,
    fetchConfig?: FetchConfig
) {
  const config = mergeRetryConfig(retryConfig);
  
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const operationId = `foresight-${endpoint}`;
    
    try {
      return await retryEngine.executeWithRetry(
        async () => {
          // Check if user signal is already aborted before attempting
          if (fetchConfig?.signal?.aborted) {
            throw new DOMException('The operation was aborted.', 'AbortError');
          }

          const { signal, cleanup } = buildRequestSignal(fetchConfig, options.signal as AbortSignal | undefined);

          try {
            const response = await fetch(`${FORESIGHT_URL}/${endpoint}`, {
              ...options,
              method,
              signal,
              headers: {
                ...fetchConfig?.headers,
                ...options.headers,
                'apiKey': apiKey,
                'Content-Type': 'application/json',
              },
            });

            return processResponse(response);
          } catch (error: any) {
            if (error.name === 'AbortError') {
              if (fetchConfig?.signal?.aborted) {
                throw error;
              }
              if (fetchConfig?.timeout) {
                const timeoutError = new Error(`Request timed out after ${fetchConfig.timeout}ms`);
                (timeoutError as any).code = 'NETWORK_ERROR';
                throw timeoutError;
              }
              throw error;
            }
            throw error;
          } finally {
            cleanup();
          }
        },
        config,
        operationId
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      return {
        succeeded: false,
        response: { message: error.message || 'Request failed after retries' },
        httpStatusCode: error.response?.status || 500
      };
    }
  };
}

/**
 * Creates a retry-enabled HTTP client for the Pricing API.
 * @param ecosystem The blockchain ecosystem identifier
 * @param apiKey The API key for authentication
 * @param retryConfig Optional retry configuration for enhanced resilience
 * @param fetchConfig Optional fetch configuration for timeouts, abort signals, and custom headers
 * @returns A request function with retry capabilities
 */
export function createPricingClient(
    ecosystem: string, 
    apiKey: string, 
    retryConfig?: Partial<RetryConfig>,
    fetchConfig?: FetchConfig
) {
  const config = mergeRetryConfig(retryConfig);
  
  return async function request(
    endpoint: string,
    method: string = 'GET',
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const operationId = `pricing-${ecosystem}-${endpoint}`;
    
    try {
      return await retryEngine.executeWithRetry(
        async () => {
          // Check if user signal is already aborted before attempting
          if (fetchConfig?.signal?.aborted) {
            throw new DOMException('The operation was aborted.', 'AbortError');
          }

          const { signal, cleanup } = buildRequestSignal(fetchConfig, options.signal as AbortSignal | undefined);

          try {
            const response = await fetch(`${PRICING_URL}/${ecosystem}/${endpoint}`, {
              ...options,
              method,
              signal,
              headers: {
                ...fetchConfig?.headers,
                ...options.headers,
                'apiKey': apiKey,
                'Content-Type': 'application/json',
              },
            });

            return processResponse(response);
          } catch (error: any) {
            if (error.name === 'AbortError') {
              if (fetchConfig?.signal?.aborted) {
                throw error;
              }
              if (fetchConfig?.timeout) {
                const timeoutError = new Error(`Request timed out after ${fetchConfig.timeout}ms`);
                (timeoutError as any).code = 'NETWORK_ERROR';
                throw timeoutError;
              }
              throw error;
            }
            throw error;
          } finally {
            cleanup();
          }
        },
        config,
        operationId
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      return {
        succeeded: false,
        response: { message: error.message || 'Request failed after retries' },
        httpStatusCode: error.response?.status || 500
      };
    }
  };
}