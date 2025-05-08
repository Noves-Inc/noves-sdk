/**
 * Format a Cosmos amount with the correct number of decimals
 * @param amount - The amount as a string
 * @param decimals - The number of decimals
 * @returns The formatted amount as a string
 */
export const formatCosmosAmount = (amount: string, decimals: number): string => {
  const bigAmount = BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = bigAmount / divisor;
  const fraction = bigAmount % divisor;
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`;
};

/**
 * Validate a Cosmos address
 * @param address - The address to validate
 * @returns True if the address is valid, false otherwise
 */
export const validateCosmosAddress = (address: string): boolean => {
  // Basic Cosmos address validation
  return /^cosmos[a-zA-Z0-9]{39}$/.test(address);
};

/**
 * Format a Cosmos token balance for display
 * @param balance - The token balance
 * @returns The formatted balance as a string
 */
export const formatCosmosTokenBalance = (balance: { balance: string; token: { decimals: number; symbol: string } }): string => {
  const formattedAmount = formatCosmosAmount(balance.balance, balance.token.decimals);
  return `${formattedAmount} ${balance.token.symbol}`;
}; 