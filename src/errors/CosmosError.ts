/**
 * Base error class for Cosmos-related errors
 */
export class CosmosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CosmosError';
  }
}

/**
 * Error thrown when a Cosmos address is invalid
 */
export class CosmosAddressError extends CosmosError {
  constructor(address: string) {
    super(`Invalid Cosmos address: ${address}`);
    this.name = 'CosmosAddressError';
  }
}

/**
 * Error thrown when a Cosmos transaction job fails
 */
export class CosmosTransactionJobError extends CosmosError {
  constructor(jobId: string, status: string) {
    super(`Transaction job ${jobId} failed with status: ${status}`);
    this.name = 'CosmosTransactionJobError';
  }
} 