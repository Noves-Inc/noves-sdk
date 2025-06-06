/**
 * Validate a Cosmos address
 * @param address - The address to validate
 * @returns True if the address is valid, false otherwise
 */
export const validateCosmosAddress = (address: string): boolean => {
  // Basic Cosmos address validation
  return /^cosmos[a-zA-Z0-9]{39}$/.test(address);
}; 