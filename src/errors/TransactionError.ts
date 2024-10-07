// src/errors/TransactionError.ts

/**
 * Custom error class for handling transaction validation errors.
 */
export class TransactionError extends Error {
  errors: Record<string, string[]>;

  /**
   * Creates an instance of TransactionError.
   * @param {Record<string, string[]>} errors - The validation errors.
   */
  constructor(errors: Record<string, string[]>) {
    super('Transaction validation error');
    this.name = 'TransactionError';
    this.errors = errors;
  }
}