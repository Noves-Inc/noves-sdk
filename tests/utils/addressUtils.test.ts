import { shortenAddress } from '../../src/utils/addressUtils';

describe('addressUtils', () => {
  describe('shortenAddress', () => {
    it('should shorten a valid address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(shortenAddress(address)).toBe('0x1234...5678');
    });

    it('should handle empty address', () => {
      expect(shortenAddress('')).toBe('');
    });

    it('should handle null/undefined address', () => {
      expect(shortenAddress(null as any)).toBe('');
      expect(shortenAddress(undefined as any)).toBe('');
    });

    it('should return full address if shorter than total length', () => {
      const shortAddress = '0x1234';
      expect(shortenAddress(shortAddress)).toBe(shortAddress);
    });

    it('should allow custom start and end lengths', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(shortenAddress(address, 4, 4)).toBe('0x12...5678');
      expect(shortenAddress(address, 8, 8)).toBe('0x123456...12345678');
    });
  });
}); 