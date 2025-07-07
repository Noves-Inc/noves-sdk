// For end users of the SDK, use this import:
// import { Translate, ErrorType, TransactionError } from '@noves/noves-sdk';

// For development/testing, use relative imports:
import { Translate, ErrorType, TransactionError } from '../../src';

class ExampleService {
  private translate = Translate.evm('your-api-key');

  // ❌ OLD WAY - String comparisons (fragile)
  private isJobNotFoundError_OLD(error: any): boolean {
    return (
      error instanceof TransactionError &&
      error.errors?.message?.some((msg: string) =>
        msg.includes('does not exist'),
      )
    );
  }

  private isJobPendingError_OLD(error: any): boolean {
    return (
      error instanceof TransactionError &&
      error.errors?.message?.some((msg: string) =>
        msg.includes('Job is still processing'),
      )
    );
  }

  // ✅ NEW WAY - Using error enums (reliable)
  private isJobNotFoundError(error: any): boolean {
    return error instanceof TransactionError && error.isJobNotFound();
  }

  private isJobPendingError(error: any): boolean {
    return error instanceof TransactionError && error.isJobProcessing();
  }

  // Alternative approach using error types directly
  private isJobNotFoundErrorDirect(error: any): boolean {
    return error instanceof TransactionError && error.errorType === ErrorType.JOB_NOT_FOUND;
  }

  private isJobPendingErrorDirect(error: any): boolean {
    return error instanceof TransactionError && 
           (error.errorType === ErrorType.JOB_PROCESSING || error.errorType === ErrorType.JOB_NOT_READY);
  }

  // Example usage in a service method
  async getTransactionsWithHandling(chain: string, address: string) {
    try {
      const result = await this.translate.getTransactions(chain, address);
      return result;
    } catch (error: any) {
      if (this.isJobNotFoundError(error)) {
        console.log('Job not found - may need to initiate new job');
        // Handle job not found case
        return null;
      }
      
      if (this.isJobPendingError(error)) {
        console.log('Job is still processing - retry later');
        // Handle job pending case
        throw new Error('Job pending, please retry');
      }
      
      // Handle other error types
      if (error instanceof TransactionError) {
        switch (error.errorType) {
          case ErrorType.RATE_LIMIT_EXCEEDED:
            console.log('Rate limited, HTTP Status:', error.httpStatusCode);
            break;
          case ErrorType.UNAUTHORIZED:
            console.log('Authentication failed, HTTP Status:', error.httpStatusCode);
            break;
          default:
            console.log('Unknown error:', error.message, 'HTTP Status:', error.httpStatusCode);
        }
      }
      
      throw error;
    }
  }

  // Example of comprehensive error handling
  async robustTransactionFetching(chain: string, address: string, maxRetries = 3) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.translate.getTransactions(chain, address);
      } catch (error: any) {
        if (error instanceof TransactionError) {
          // Use the new error type system
          if (error.isJobProcessing()) {
            console.log(`Attempt ${attempt + 1}: Job still processing, retrying...`);
            await this.delay(2000 * Math.pow(2, attempt)); // Exponential backoff
            attempt++;
            continue;
          }
          
          if (error.isJobNotFound()) {
            console.log('Job not found, cannot retry');
            throw new Error('Job not found');
          }
          
          if (error.isRateLimited()) {
            console.log('Rate limited, waiting longer...');
            await this.delay(60000); // Wait 1 minute
            attempt++;
            continue;
          }
          
          if (error.isUnauthorized()) {
            console.log('Authentication error, cannot retry');
            throw new Error('Invalid API key');
          }
          
          // Log additional details
          console.log('Error details:', {
            type: error.errorType,
            httpStatus: error.httpStatusCode,
            message: error.message,
            details: error.details
          });
        }
        
        throw error;
      }
    }
    
    throw new Error(`Max retries (${maxRetries}) exceeded`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example
async function main() {
  const service = new ExampleService();
  
  try {
    const transactions = await service.robustTransactionFetching(
      'ethereum', 
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    );
    
    console.log('Successfully retrieved transactions:', transactions);
  } catch (error) {
    console.error('Final error:', error);
  }
}

// Export for use in other files
export { ExampleService }; 