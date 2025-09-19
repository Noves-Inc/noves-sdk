# Noves SDK Retry Mechanism Guide

## Quick Start

### Basic Usage (Backward Compatible)
```typescript
// Existing code continues to work unchanged
import { Translate } from '@noves/noves-sdk';
const translate = Translate.evm('your-api-key');
```

### Enable Retries with Defaults
```typescript
import { Translate, RetryHelpers } from '@noves/noves-sdk';

// Using preset configuration
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'PRODUCTION' // Use built-in preset
});

// Using helper function
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: RetryHelpers.forProduction()
});
```

### Custom Configuration
```typescript
import { Translate, RetryConfigBuilder } from '@noves/noves-sdk';

const customRetryConfig = RetryConfigBuilder.create()
  .enable()
  .maxAttempts(5)
  .delays(1000, 30000)
  .exponentialBackoff(2)
  .withJitter()
  .retryOn(ErrorType.RATE_LIMIT_EXCEEDED, ErrorType.NETWORK_ERROR)
  .circuitBreaker(3, 60000)
  .onRetry((attempt, error, delay) => {
    console.log(`Retry ${attempt} after ${delay}ms`);
  })
  .build();

const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: customRetryConfig
});
```

## Configuration Presets

### Production Ready
```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'PRODUCTION'
});
```
- Conservative retry counts (2 attempts)
- Longer delays (2-30 seconds)
- Strict circuit breaker
- Respects API rate limits

### Development
```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'DEVELOPMENT'
});
```
- More aggressive retries (5 attempts)
- Faster feedback (0.5-15 seconds)
- More lenient error handling

### Real-Time Applications
```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'REAL_TIME'
});
```
- Quick retries for good UX
- Low retry counts to prevent delays
- Fast circuit breaking

### Batch Processing
```typescript
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'BATCH_PROCESSING'
});
```
- Higher retry limits (8 attempts)
- Optimized for job processing
- Longer timeouts

## Monitoring and Observability

The SDK provides built-in retry capabilities with comprehensive error handling and circuit breaker functionality. While advanced monitoring features have been simplified, you can still track retry behavior through the configuration callbacks.

## Error-Specific Behavior

### Rate Limiting
- Automatically respects `Retry-After` headers
- Uses exponential backoff with higher base delays
- Quick circuit breaking to prevent API pressure

### Job Processing
- Linear backoff for predictable processing times
- Longer retry windows (up to 7 minutes)
- Uses historical recovery time data

### Network Errors
- Fast exponential backoff for quick recovery
- Limited retry attempts (4 max)
- Quick failure detection

### Non-Retryable Errors
- Authentication errors: Never retry
- Validation errors: Never retry
- Job not found: Never retry

## Advanced Usage

### Strategy Recommendations
```typescript
import { RetryRecommendations } from '@noves/noves-sdk';

const recommended = RetryRecommendations.recommendStrategy({
  environment: 'production',
  usage: 'real-time',
  errorTolerance: 'low',
  performanceRequirement: 'fast'
});
```

### Configuration Analysis
```typescript
const analysis = RetryRecommendations.analyzeConfiguration(myConfig);
console.log('Score:', analysis.score);
console.log('Suggestions:', analysis.suggestions);
console.log('Warnings:', analysis.warnings);
```

### Debug Mode

You can enable debug logging through the retry configuration callbacks:

```typescript
const debugConfig = {
  enabled: true,
  maxAttempts: 3,
  baseDelay: 1000,
  onRetry: (attempt, error, delay) => {
    console.log(`🔄 Retry attempt ${attempt}, waiting ${delay}ms`, { error });
  },
  onSuccess: (attempt) => {
    console.log(`✅ Success after ${attempt} attempts`);
  },
  onFailure: (attempts, error) => {
    console.log(`❌ Failed after ${attempts} attempts`, { error });
  }
};
```

## Migration from v1.x

### No Changes Required
Existing code will continue to work exactly as before:
```typescript
// This still works unchanged
const translate = Translate.evm('your-api-key');
```

### Gradual Enhancement
Add retry capabilities gradually:
```typescript
// Step 1: Add basic retry
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: RetryHelpers.forProduction()
});

// Step 2: Add custom handling
const customConfig = RetryConfigBuilder
  .fromPreset(RetryPresets.PRODUCTION)
  .onRetry((attempt, error) => {
    // Custom retry logging
  })
  .build();
```

## Best Practices

### Production Deployment
1. Start with conservative settings
2. Use callback functions to track retry behavior
3. Set up logging for performance monitoring
4. Monitor success rates through your application logs
5. Adjust configuration based on real-world data

### Error Handling
```typescript
try {
  const result = await translate.getTransactions(chain, address);
} catch (error) {
  if (error instanceof TransactionError) {
    // Check retry metadata
    if (error.retryMetadata) {
      console.log('Retries attempted:', error.retryMetadata.attempts);
      console.log('Total duration:', error.retryMetadata.totalDuration);
    }
    
    // Handle specific error types
    if (error.isRateLimited()) {
      // Rate limit handling
    } else if (error.isJobProcessing()) {
      // Job processing handling
    }
  }
}
```

### Performance Optimization
1. Use appropriate presets for your use case
2. Monitor retry rates through callback logging
3. Rely on built-in circuit breakers for failing operations
4. Use callback data to tune configurations
5. Adjust retry settings based on application performance

## Troubleshooting

### High Retry Rates
```typescript
// Monitor through callbacks
let retryCount = 0;
let totalRequests = 0;

const config = {
  enabled: true,
  maxAttempts: 3,
  onRetry: (attempt, error, delay) => {
    retryCount++;
    console.log(`Retry ${attempt}: ${error.message}`);
  },
  onSuccess: (attempt) => {
    totalRequests++;
    if (retryCount > totalRequests * 2) {
      console.warn('High retry rate detected');
    }
  },
  onFailure: (attempts, error) => {
    totalRequests++;
    console.error(`Failed after ${attempts} attempts:`, error);
  }
};
```

### Circuit Breaker Issues
The built-in circuit breaker will automatically prevent requests when failure thresholds are exceeded. Monitor through failure callbacks:

```typescript
const config = {
  enabled: true,
  circuitBreakerThreshold: 3,
  circuitBreakerResetTime: 60000,
  onFailure: (attempts, error) => {
    if (error.message.includes('Circuit breaker')) {
      console.error('Circuit breaker activated - check API stability');
    }
  }
};
```

## API Reference

### RetryPresets
Pre-configured strategies for common scenarios:
- `PRODUCTION`: Conservative, production-ready settings
- `DEVELOPMENT`: Aggressive settings for development
- `REAL_TIME`: Fast retries for user-facing apps
- `BATCH_PROCESSING`: Optimized for bulk operations
- `CRITICAL`: Minimal retries for critical operations
- `DISABLED`: No retries

### RetryConfigBuilder
Fluent builder for custom configurations:
```typescript
RetryConfigBuilder.create()
  .enable()
  .maxAttempts(5)
  .delays(1000, 30000)
  .exponentialBackoff(2)
  .withJitter()
  .retryOn(...errorTypes)
  .circuitBreaker(3, 60000)
  .build()
```

### Monitoring through Callbacks
Use the built-in callback system for monitoring:
- `onRetry`: Called before each retry attempt
- `onSuccess`: Called when request succeeds
- `onFailure`: Called when all retries are exhausted

## Examples

### Basic Usage Examples
```typescript
// Simple API key usage (backward compatible)
const translate = Translate.evm('your-api-key');

// With environment-based auto-configuration
const translate = Translate.evm({
  apiKey: 'your-api-key',
  environment: 'production'
});

// With preset
const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: 'DEVELOPMENT'
});
```

### Advanced Configuration Examples
```typescript
// Custom retry strategy
const config = RetryConfigBuilder.create()
  .enable()
  .maxAttempts(5)
  .delays(2000, 30000)
  .exponentialBackoff(1.8)
  .withJitter(true, 0.2)
  .retryOn(
    ErrorType.RATE_LIMIT_EXCEEDED,
    ErrorType.NETWORK_ERROR,
    ErrorType.JOB_NOT_READY
  )
  .circuitBreaker(4, 90000)
  .onRetry((attempt, error, delay) => {
    logger.info(`Retry attempt ${attempt}, delay: ${delay}ms`, { error });
  })
  .onFailure((attempts, error) => {
    logger.error(`Failed after ${attempts} attempts`, { error });
    // Send alert to monitoring system
  })
  .build();

const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: config
});
```

### Monitoring Examples
```typescript
// Set up comprehensive monitoring through callbacks
const monitoringConfig = {
  enabled: true,
  maxAttempts: 3,
  baseDelay: 1000,
  circuitBreakerThreshold: 3,
  onRetry: (attempt, error, delay) => {
    // Log retry attempts
    logger.info('Retry attempt', {
      attempt,
      error: error.message,
      delay,
      timestamp: Date.now()
    });
    
    // Send to monitoring system
    sendMetric('retry_attempt', {
      operation: 'translate_request',
      attempt,
      error_type: error.name
    });
  },
  onSuccess: (attempt) => {
    logger.info('Request succeeded', { attempt });
    sendMetric('request_success', { attempts_needed: attempt });
  },
  onFailure: (attempts, error) => {
    logger.error('Request failed completely', { attempts, error: error.message });
    
    // Check if circuit breaker related
    if (error.message.includes('Circuit breaker')) {
      sendAlert({
        type: 'circuit_breaker_open',
        message: 'Circuit breaker activated',
        timestamp: Date.now()
      });
    }
    
    sendMetric('request_failure', {
      total_attempts: attempts,
      final_error: error.name
    });
  }
};

const translate = Translate.evm({
  apiKey: 'your-api-key',
  retryConfig: monitoringConfig
});
```

## TypeScript Support

The SDK is fully typed and provides excellent TypeScript support:

```typescript
import { 
  Translate, 
  RetryConfig, 
  RetryConfigBuilder,
  RetryPresets,
  SDKOptions,
  TransactionError,
  ErrorType 
} from '@noves/noves-sdk';

// All types are properly exported and documented
const config: RetryConfig = RetryPresets.PRODUCTION;
const options: SDKOptions = {
  apiKey: 'your-key',
  retryConfig: config,
  environment: 'production'
};

// Full IntelliSense support
const translate = Translate.evm(options);
```

## Performance Considerations

### Memory Usage
- Retry configurations are lightweight
- Circuit breaker state is minimal per operation
- No persistent event storage

### CPU Impact
- Retry logic has minimal overhead
- Circuit breaker checks are fast
- Callback execution depends on your implementation

### Network Impact
- Retry delays are designed to reduce API pressure
- Circuit breakers prevent cascade failures
- Jitter prevents thundering herd effects

## Support and Troubleshooting

### Common Issues

1. **High retry rates**: Check API stability, adjust retry strategies
2. **Circuit breaker trips**: Review error patterns, adjust thresholds
3. **Performance degradation**: Use callback logging to analyze bottlenecks
4. **Timeout issues**: Adjust circuit breaker thresholds and retry delays

### Debug Steps

1. Enable verbose logging through callbacks
2. Use retry callbacks to track behavior
3. Analyze configuration with `RetryRecommendations.analyzeConfiguration(config)`
4. Review performance through application logs

### Getting Help

For additional support:
- Check the examples in `docs/examples/`
- Review test files for usage patterns
- Enable debug logging for detailed insights
- Contact support with retry metrics if issues persist
