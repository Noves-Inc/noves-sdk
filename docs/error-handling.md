# Error Handling Guide

The Noves SDK provides structured error handling with error enums and HTTP status codes to help you handle different error scenarios more effectively.

## Error Types

The SDK includes predefined error types in the `ErrorType` enum:

```typescript
import { ErrorType, TransactionError } from '@noves/noves-sdk';

// Available error types:
// - ErrorType.UNAUTHORIZED
// - ErrorType.INVALID_API_KEY
// - ErrorType.RATE_LIMIT_EXCEEDED
// - ErrorType.JOB_NOT_FOUND
// - ErrorType.JOB_PROCESSING
// - ErrorType.JOB_NOT_READY
// - ErrorType.INVALID_REQUEST
// - ErrorType.INVALID_RESPONSE_FORMAT
// - ErrorType.NETWORK_ERROR
// - ErrorType.UNKNOWN_ERROR
// - ErrorType.VALIDATION_ERROR
```

## Using Error Enums Instead of String Comparisons

### Before (String Comparisons)
```typescript
try {
  const result = await translate.getTransactions(chain, address);
  // Handle result
} catch (error: any) {
  // ❌ String comparison - fragile and error-prone
  if (error instanceof TransactionError &&
      error.errors?.message?.some((msg: string) => msg.includes('does not exist'))) {
    // Handle job not found
  }
  
  if (error instanceof TransactionError &&
      error.errors?.message?.some((msg: string) => msg.includes('Job is still processing'))) {
    // Handle job processing
  }
}
```

### After (Structured Error Handling)
```typescript
import { ErrorType, TransactionError } from '@noves/noves-sdk';

try {
  const result = await translate.getTransactions(chain, address);
  // Handle result
} catch (error: any) {
  if (error instanceof TransactionError) {
    // ✅ Type-safe error handling
    switch (error.errorType) {
      case ErrorType.JOB_NOT_FOUND:
        console.log('Job not found, may need to retry or check job ID');
        break;
      
      case ErrorType.JOB_PROCESSING:
      case ErrorType.JOB_NOT_READY:
        console.log('Job is still processing, retry after a delay');
        break;
      
      case ErrorType.RATE_LIMIT_EXCEEDED:
        console.log('Rate limit exceeded, implement backoff strategy');
        break;
      
      case ErrorType.UNAUTHORIZED:
      case ErrorType.INVALID_API_KEY:
        console.log('Authentication failed, check API key');
        break;
      
      default:
        console.log('Unknown error:', error.message);
    }
    
    // Access HTTP status code
    if (error.httpStatusCode) {
      console.log('HTTP Status:', error.httpStatusCode);
    }
  }
}
```

## Convenience Methods

The `TransactionError` class provides convenient methods for common error checking:

```typescript
try {
  const result = await translate.getTransactions(chain, address);
} catch (error: any) {
  if (error instanceof TransactionError) {
    // Check specific error types
    if (error.isJobNotFound()) {
      console.log('Job not found');
    }
    
    if (error.isJobProcessing()) {
      console.log('Job is still processing');
    }
    
    if (error.isRateLimited()) {
      console.log('Rate limited - implement backoff');
    }
    
    if (error.isUnauthorized()) {
      console.log('Authentication error');
    }
    
    // Check for specific error type
    if (error.isErrorType(ErrorType.NETWORK_ERROR)) {
      console.log('Network error occurred');
    }
  }
}
```

## Advanced Error Handling Example

Here's a comprehensive example that demonstrates robust error handling:

```typescript
import { Translate, ErrorType, TransactionError } from '@noves/noves-sdk';

class JobManager {
  private translate = Translate.evm('your-api-key');
  
  async getTransactionsWithRetry(chain: string, address: string, maxRetries = 3) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.translate.getTransactions(chain, address);
      } catch (error: any) {
        if (error instanceof TransactionError) {
          switch (error.errorType) {
            case ErrorType.JOB_PROCESSING:
            case ErrorType.JOB_NOT_READY:
              // Job is processing, wait and retry
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
              console.log(`Job processing, retrying in ${delay}ms...`);
              await this.delay(delay);
              attempt++;
              break;
              
            case ErrorType.RATE_LIMIT_EXCEEDED:
              // Rate limited, wait longer
              const rateLimitDelay = 60000; // 1 minute
              console.log(`Rate limited, waiting ${rateLimitDelay}ms...`);
              await this.delay(rateLimitDelay);
              attempt++;
              break;
              
            case ErrorType.JOB_NOT_FOUND:
              // Job doesn't exist, no point in retrying
              throw new Error(`Job not found for address ${address}`);
              
            case ErrorType.UNAUTHORIZED:
            case ErrorType.INVALID_API_KEY:
              // Authentication error, no point in retrying
              throw new Error('Authentication failed. Please check your API key.');
              
            default:
              // For other errors, throw immediately
              throw error;
          }
        } else {
          throw error;
        }
      }
    }
    
    throw new Error(`Max retries (${maxRetries}) exceeded`);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Helper method to check job status
  private isJobNotFoundError(error: any): boolean {
    return error instanceof TransactionError && error.isJobNotFound();
  }
  
  private isJobPendingError(error: any): boolean {
    return error instanceof TransactionError && error.isJobProcessing();
  }
}

// Usage
const jobManager = new JobManager();

try {
  const transactions = await jobManager.getTransactionsWithRetry('ethereum', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  console.log('Successfully retrieved transactions:', transactions);
} catch (error) {
  console.error('Failed to retrieve transactions:', error);
}
```

## Error Object Structure

The enhanced `TransactionError` object includes:

```typescript
interface TransactionError {
  name: string;              // 'TransactionError'
  message: string;           // Human-readable error message
  errors: Record<string, string[]>;  // Original error details
  errorType: ErrorType;      // Structured error type
  httpStatusCode?: number;   // HTTP status code from API
  details?: any;            // Additional error details
  
  // Convenience methods
  isErrorType(type: ErrorType): boolean;
  isJobNotFound(): boolean;
  isJobProcessing(): boolean;
  isRateLimited(): boolean;
  isUnauthorized(): boolean;
}
```

## Migration Guide

If you're currently using string comparisons for error handling, here's how to migrate:

1. **Import the new error types**:
   ```typescript
   import { ErrorType, TransactionError } from '@noves/noves-sdk';
   ```

2. **Replace string comparisons with error type checks**:
   ```typescript
   // Old way
   if (error.errors?.message?.some(msg => msg.includes('does not exist'))) {
     // handle job not found
   }
   
   // New way
   if (error.isJobNotFound() || error.errorType === ErrorType.JOB_NOT_FOUND) {
     // handle job not found
   }
   ```

3. **Use HTTP status codes for additional context**:
   ```typescript
   if (error.httpStatusCode === 425) {
     // Job not ready yet
   }
   ```

This structured approach provides better type safety, easier testing, and more maintainable error handling code. 