import { TranslateCOSMOS } from '../../src/translate/translateCOSMOS';
import { TransactionError } from '../../src/errors/TransactionError';
import { CosmosAddressError } from '../../src/errors/CosmosError';
import { TransactionsPage } from '../../src/translate/transactionsPage';
import { Transaction, CosmosTokenBalance, PageOptions, CosmosBalancesResponse } from '../../src/types/types';

jest.setTimeout(30000);

describe('TranslateCOSMOS', () => {
  const apiKey = process.env.API_KEY;
  const validCosmosAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
  const validChain = 'celestia';
  const validTxHash = '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF';

  let translateCOSMOS: TranslateCOSMOS;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }
    translateCOSMOS = new TranslateCOSMOS(apiKey);
  });

  it('should create an instance with a valid API key', () => {
    expect(translateCOSMOS).toBeInstanceOf(TranslateCOSMOS);
  });

  it('should throw an error if API key is not provided', () => {
    expect(() => new TranslateCOSMOS('')).toThrow('API key is required');
  });

  describe('getChains', () => {
    it('should get list of supported chains', async () => {
      const chains = await translateCOSMOS.getChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
      chains.forEach(chain => {
        expect(chain).toHaveProperty('name');
        expect(chain).toHaveProperty('ecosystem');
        expect(chain).toHaveProperty('nativeCoin');
      });
    });

    it('should handle API errors gracefully', async () => {
      const invalidTranslate = new TranslateCOSMOS('invalid-key');
      await expect(invalidTranslate.getChains()).rejects.toThrow(TransactionError);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details', async () => {
      try {
        const tx = await translateCOSMOS.getTransaction(validChain, validTxHash);
        expect(tx).toBeDefined();
        // For empty responses, we expect an empty object
        if (Object.keys(tx).length === 0) {
          expect(tx).toEqual({});
        } else {
          expect(tx).toHaveProperty('txTypeVersion');
          expect(tx).toHaveProperty('chain');
          expect(tx).toHaveProperty('accountAddress');
          expect(tx).toHaveProperty('classificationData');
          expect(tx).toHaveProperty('rawTransactionData');
        }
      } catch (error) {
        // If the transaction is not found, we expect a TransactionError
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });

    it('should handle rate limiting errors', async () => {
      const promises = Array(10).fill(null).map(() => 
        translateCOSMOS.getTransaction(validChain, validTxHash)
      );
      await expect(Promise.all(promises)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid hash', async () => {
      await expect(translateCOSMOS.getTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    const pageOptions: PageOptions = { pageSize: 10 };

    it('should return a valid TransactionsPage instance', async () => {
      const result = await translateCOSMOS.Transactions(validChain, validCosmosAddress, pageOptions);
      expect(result).toBeInstanceOf(TransactionsPage);
      
      const transactions = result.getTransactions();
      expect(Array.isArray(transactions)).toBe(true);
      if (transactions.length > 0) {
        transactions.forEach((tx: Transaction) => {
          expect(tx).toMatchObject({
            rawTransactionData: expect.objectContaining({
              transactionHash: expect.any(String)
            })
          });
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const result = await translateCOSMOS.Transactions(validChain, validCosmosAddress, { pageSize: 5 });
      const firstPage = result.getTransactions();
      expect(Array.isArray(firstPage)).toBe(true);
      expect(firstPage.length).toBeLessThanOrEqual(5);

      if (await result.next()) {
        const secondPage = result.getTransactions();
        expect(Array.isArray(secondPage)).toBe(true);
        expect(secondPage.length).toBeLessThanOrEqual(5);
        expect(JSON.stringify(firstPage)).not.toBe(JSON.stringify(secondPage));
      }
    });

    it('should handle invalid address gracefully', async () => {
      try {
        await translateCOSMOS.Transactions(validChain, 'invalid-address', pageOptions);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });
  });

  describe('getTokenBalances', () => {
    it('should get token balances', async () => {
      try {
        const balances = await translateCOSMOS.getTokenBalances(validChain, validCosmosAddress);
        expect(balances).toBeDefined();
        // For empty responses, we expect an empty array
        if (Array.isArray(balances) && balances.length === 0) {
          expect(balances).toEqual([]);
        } else {
          const response = balances as CosmosBalancesResponse;
          if (response.balances) {
            response.balances.forEach((balance: CosmosTokenBalance) => {
              expect(balance).toHaveProperty('token');
              expect(balance).toHaveProperty('balance');
            });
          }
        }
      } catch (error) {
        // If the API returns an empty response, we expect a TransactionError
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });

    it('should handle invalid address', async () => {
      await expect(translateCOSMOS.getTokenBalances(validChain, 'invalid-address')).rejects.toThrow(CosmosAddressError);
    });
  });

  describe('startTransactionJob', () => {
    it('should start a transaction job', async () => {
      try {
        const job = await translateCOSMOS.startTransactionJob(validChain, validCosmosAddress, 1, 100);
        expect(job).toBeDefined();
        expect(job).toHaveProperty('jobId');
        expect(job).toHaveProperty('status');
      } catch (error) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });

    it('should handle invalid address', async () => {
      await expect(translateCOSMOS.startTransactionJob(validChain, 'invalid-address')).rejects.toThrow(CosmosAddressError);
    });
  });

  describe('getTransactionJobResults', () => {
    it('should get transaction job results', async () => {
      try {
        const job = await translateCOSMOS.startTransactionJob(validChain, validCosmosAddress, 1, 100);
        const results = await translateCOSMOS.getTransactionJobResults(validChain, job.jobId);
        expect(results).toBeDefined();
        expect(results).toHaveProperty('items');
        expect(results).toHaveProperty('hasNextPage');
      } catch (error) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });

    it('should handle non-existent job ID', async () => {
      await expect(translateCOSMOS.getTransactionJobResults(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });
  });
});