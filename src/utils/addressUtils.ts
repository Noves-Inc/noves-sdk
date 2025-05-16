/**
 * Shortens a blockchain address for display purposes by keeping the first and last few characters
 * @param address - The full blockchain address to shorten
 * @param startLength - Number of characters to keep at the start (default: 6)
 * @param endLength - Number of characters to keep at the end (default: 4)
 * @returns The shortened address string in the format "0x1234...5678"
 */
export const shortenAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}; 