// src/errors/ChainNotFoundError.ts

/**
 * Custom error class for handling cases where a chain is not found.
 */
export class ChainNotFoundError extends Error {
    /**
     * Creates an instance of ChainNotFoundError.
     * @param {string} chainName - The name of the chain that was not found.
     */
    constructor(chainName: string) {
      super(`Chain with name "${chainName}" not found.`);
      this.name = "ChainNotFoundError";
    }
}