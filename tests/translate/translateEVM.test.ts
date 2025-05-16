import { TranslateEVM } from "../../src/translate/translateEVM";
import { ChainNotFoundError } from "../../src/errors/ChainNotFoundError";
import { TransactionError } from "../../src/errors/TransactionError";
import { PageOptions } from "../../src/types/types";
import { TransactionsPage } from "../../src/translate/transactionsPage";
import { HistoryPage } from "../../src/translate/historyPage";

jest.setTimeout(30000);

describe('TranslateEVM', () => {
  let translateEVM: TranslateEVM;
  let mockRequest: jest.Mock;
  const apiKey = process.env.API_KEY;
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const validTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const validChain = 'ethereum';

  beforeEach(() => {
    mockRequest = jest.fn();
    translateEVM = new TranslateEVM('test-api-key');
    (translateEVM as any).makeRequest = mockRequest;
  });

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }
    translateEVM = new TranslateEVM(apiKey);
  });

  describe('getChains', () => {
    it('should get list of supported chains', async () => {
      mockRequest.mockResolvedValue([
        {
          name: 'ethereum',
          ecosystem: 'evm',
          nativeCoin: {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18
          }
        }
      ]);
      const chains = await translateEVM.getChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
      chains.forEach(chain => {
        expect(chain).toHaveProperty('name');
        expect(chain).toHaveProperty('ecosystem');
        expect(chain).toHaveProperty('nativeCoin');
      });
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid API Key'] }));
      await expect(translateEVM.getChains()).rejects.toThrow(TransactionError);
    });
  });

  describe('getChain', () => {
    it('should get chain details', async () => {
      mockRequest.mockResolvedValue([
        {
          name: 'eth',
          ecosystem: 'evm',
          nativeCoin: {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18
          }
        }
      ]);
      const chain = await translateEVM.getChain(validChain);
      expect(chain).toBeDefined();
      expect(chain).toHaveProperty('name');
      expect(chain).toHaveProperty('ecosystem');
      expect(chain).toHaveProperty('nativeCoin');
    });

    it('should handle non-existent chain', async () => {
      mockRequest.mockResolvedValue([]);
      await expect(translateEVM.getChain('nonexistent-chain')).rejects.toThrow(ChainNotFoundError);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details', async () => {
      mockRequest.mockResolvedValue({
        txTypeVersion: 2,
        chain: validChain,
        accountAddress: validAddress,
        classificationData: {
          type: 'placeOrder',
          source: { type: 'human' },
          description: 'Placed a new order in a decentralized exchange.',
          protocol: { name: null },
          sent: [],
          received: []
        },
        rawTransactionData: {
          transactionHash: validTxHash,
          fromAddress: validAddress,
          toAddress: validAddress,
          blockNumber: 12345678,
          gas: 21000,
          gasUsed: 21000,
          gasPrice: 20000000000,
          transactionFee: {
            amount: '0.00042',
            token: {
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              address: 'ETH'
            }
          },
          timestamp: 1234567890
        }
      });
      const tx = await translateEVM.getTransaction(validChain, validTxHash);
      expect(tx).toBeDefined();
      expect(tx).toHaveProperty('txTypeVersion');
      expect(tx).toHaveProperty('chain');
      expect(tx).toHaveProperty('accountAddress');
      expect(tx).toHaveProperty('classificationData');
      expect(tx).toHaveProperty('rawTransactionData');
      expect(tx.classificationData).toHaveProperty('type');
      expect(tx.classificationData).toHaveProperty('source');
      expect(tx.classificationData).toHaveProperty('description');
      expect(tx.classificationData).toHaveProperty('protocol');
      expect(tx.classificationData).toHaveProperty('sent');
      expect(tx.classificationData).toHaveProperty('received');
      expect(tx.rawTransactionData).toHaveProperty('transactionHash');
      expect(tx.rawTransactionData).toHaveProperty('fromAddress');
      expect(tx.rawTransactionData).toHaveProperty('toAddress');
      expect(tx.rawTransactionData).toHaveProperty('blockNumber');
      expect(tx.rawTransactionData).toHaveProperty('gas');
      expect(tx.rawTransactionData).toHaveProperty('gasUsed');
      expect(tx.rawTransactionData).toHaveProperty('gasPrice');
      expect(tx.rawTransactionData).toHaveProperty('transactionFee');
      expect(tx.rawTransactionData).toHaveProperty('timestamp');
    });

    it('should get transaction details in v5 format', async () => {
      mockRequest.mockResolvedValue({
        txTypeVersion: 5,
        chain: validChain,
        accountAddress: validAddress,
        classificationData: {
          type: 'placeOrder',
          source: { type: 'human' },
          description: 'Placed a new order in a decentralized exchange.',
          protocol: { name: null },
          sent: [],
          received: []
        },
        rawTransactionData: {
          transactionHash: validTxHash,
          fromAddress: validAddress,
          toAddress: validAddress,
          blockNumber: 12345678,
          gas: 21000,
          gasUsed: 21000,
          gasPrice: 20000000000,
          transactionFee: {
            amount: '0.00042',
            token: {
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              address: 'ETH'
            }
          },
          timestamp: 1234567890
        }
      });
      const tx = await translateEVM.getTransaction(validChain, validTxHash, true);
      expect(tx).toBeDefined();
      expect(tx).toHaveProperty('txTypeVersion');
      expect(tx).toHaveProperty('chain');
      expect(tx).toHaveProperty('accountAddress');
      expect(tx).toHaveProperty('classificationData');
      expect(tx).toHaveProperty('rawTransactionData');
      expect(tx.classificationData).toHaveProperty('type');
      expect(tx.classificationData).toHaveProperty('source');
      expect(tx.classificationData).toHaveProperty('description');
      expect(tx.classificationData).toHaveProperty('protocol');
      expect(tx.classificationData).toHaveProperty('sent');
      expect(tx.classificationData).toHaveProperty('received');
      expect(tx.rawTransactionData).toHaveProperty('transactionHash');
      expect(tx.rawTransactionData).toHaveProperty('fromAddress');
      expect(tx.rawTransactionData).toHaveProperty('toAddress');
      expect(tx.rawTransactionData).toHaveProperty('blockNumber');
      expect(tx.rawTransactionData).toHaveProperty('gas');
      expect(tx.rawTransactionData).toHaveProperty('gasUsed');
      expect(tx.rawTransactionData).toHaveProperty('gasPrice');
      expect(tx.rawTransactionData).toHaveProperty('transactionFee');
      expect(tx.rawTransactionData).toHaveProperty('timestamp');
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateEVM.getTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenBalances', () => {
    it('should get all token balances', async () => {
      mockRequest.mockResolvedValue([
        {
          token: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            price: '1.0'
          },
          balance: '1000000'
        }
      ]);
      const balances = await translateEVM.getTokenBalances(validChain, validAddress);
      expect(Array.isArray(balances)).toBe(true);
      balances.forEach(balance => {
        expect(balance).toHaveProperty('token');
        expect(balance).toHaveProperty('balance');
        expect(balance.token).toHaveProperty('symbol');
        expect(balance.token).toHaveProperty('name');
        expect(balance.token).toHaveProperty('decimals');
        expect(balance.token).toHaveProperty('address');
        expect(balance.token).toHaveProperty('price');
      });
    });

    it('should get balances for specific tokens', async () => {
      const specificTokens = [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        '0xdac17f958d2ee523a2206206994597c13d831ec7'  // USDT
      ];
      mockRequest.mockResolvedValue([
        {
          token: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            price: '1.0'
          },
          balance: '1000000'
        }
      ]);
      const balances = await translateEVM.getTokenBalances(validChain, validAddress, specificTokens);
      expect(Array.isArray(balances)).toBe(true);
      balances.forEach(balance => {
        expect(specificTokens).toContain(balance.token.address);
      });
    });

    it('should get historical balances at specific block', async () => {
      const blockNumber = 12345678;
      mockRequest.mockResolvedValue([
        {
          token: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            price: '1.0'
          },
          balance: '1000000'
        }
      ]);
      const balances = await translateEVM.getTokenBalances(validChain, validAddress, undefined, blockNumber);
      expect(Array.isArray(balances)).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining(`block=${blockNumber}`));
    });

    it('should get balances with custom parameters', async () => {
      mockRequest.mockResolvedValue([
        {
          token: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            price: '1.0'
          },
          balance: '1000000'
        }
      ]);
      const balances = await translateEVM.getTokenBalances(
        validChain,
        validAddress,
        undefined,
        undefined,
        false, // includePrices
        true,  // excludeZeroPrices
        false  // excludeSpam
      );
      expect(Array.isArray(balances)).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining('includePrices=false'));
      expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining('excludeZeroPrices=true'));
      expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining('excludeSpam=false'));
    });

    it('should handle invalid address', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translateEVM.getTokenBalances(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid chain', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid chain'] }));
      await expect(translateEVM.getTokenBalances('invalid-chain', validAddress)).rejects.toThrow(TransactionError);
    });
  });

  describe('getNativeBalance', () => {
    it('should get native balance', async () => {
      mockRequest.mockResolvedValue({
        address: validAddress,
        balance: '1000000000000000000',
        symbol: 'ETH',
        decimals: 18
      });
      const balance = await translateEVM.getNativeBalance(validChain, validAddress);
      expect(balance).toBeDefined();
      expect(balance).toHaveProperty('address');
      expect(balance).toHaveProperty('balance');
      expect(balance).toHaveProperty('symbol');
      expect(balance).toHaveProperty('decimals');
    });

    it('should handle invalid address', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translateEVM.getNativeBalance(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });
  });

  describe('getBlock', () => {
    it('should get block details', async () => {
      mockRequest.mockResolvedValue({
        number: 12345678,
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        transactions: []
      });
      const block = await translateEVM.getBlock(validChain, 12345678);
      expect(block).toBeDefined();
      expect(block).toHaveProperty('number');
      expect(block).toHaveProperty('hash');
      expect(block).toHaveProperty('transactions');
    });

    it('should handle invalid block number', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid block number'] }));
      await expect(translateEVM.getBlock(validChain, -1)).rejects.toThrow(TransactionError);
    });
  });

  describe('getBlockTransactions', () => {
    it('should get block transactions', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const pageOptions: PageOptions = { pageSize: 5 };
      const transactions = await translateEVM.getBlockTransactions(validChain, 1, pageOptions);
      expect(transactions).toBeInstanceOf(TransactionsPage);
    });

    it('should handle invalid block number', async () => {
      await expect(translateEVM.getBlockTransactions(validChain, -1)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenInfo', () => {
    it('should get token info', async () => {
      mockRequest.mockResolvedValue({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        totalSupply: '1000000000',
        type: 'ERC20'
      });
      const tokenInfo = await translateEVM.getTokenInfo(validChain, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
      expect(tokenInfo).toBeDefined();
      expect(tokenInfo).toHaveProperty('address');
      expect(tokenInfo).toHaveProperty('name');
      expect(tokenInfo).toHaveProperty('symbol');
      expect(tokenInfo).toHaveProperty('decimals');
      expect(tokenInfo).toHaveProperty('totalSupply');
      expect(tokenInfo).toHaveProperty('type');
    });

    it('should handle invalid token address', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid token address'] }));
      await expect(translateEVM.getTokenInfo(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });
  });

  describe('getTokenHolders', () => {
    it('should get token holders', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const pageOptions: PageOptions = { pageSize: 5 };
      const holders = await translateEVM.getTokenHolders(validChain, validAddress, pageOptions);
      expect(holders).toBeInstanceOf(TransactionsPage);
    });

    it('should handle invalid token address', async () => {
      await expect(translateEVM.getTokenHolders(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });
  });

  describe('History', () => {
    it('should get history with default options', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const history = await translateEVM.History(validChain, validAddress);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should get history with all query parameters', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const pageOptions: PageOptions = {
        pageSize: 100,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false
      };
      const history = await translateEVM.History(validChain, validAddress, pageOptions);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should handle pagination correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      });
      const pageOptions: PageOptions = { pageSize: 5 };
      const history = await translateEVM.History(validChain, validAddress, pageOptions);
      expect(history).toBeInstanceOf(HistoryPage);
    });

    it('should handle invalid address', async () => {
      await expect(translateEVM.History(validChain, 'invalid-address')).rejects.toThrow(TransactionError);
    });

    it('should handle invalid chain', async () => {
      await expect(translateEVM.History('invalid-chain', validAddress)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid page size', async () => {
      const pageOptions: PageOptions = { pageSize: 101 }; // Max is 100
      await expect(translateEVM.History(validChain, validAddress, pageOptions)).rejects.toThrow(TransactionError);
    });

    it('should handle invalid sort order', async () => {
      const pageOptions: PageOptions = { sort: 'invalid' as any };
      await expect(translateEVM.History(validChain, validAddress, pageOptions)).rejects.toThrow(TransactionError);
    });
  });

  describe('getTxTypes', () => {
    it('should get transaction types', async () => {
      mockRequest.mockResolvedValue({
        transactionTypes: [
          {
            id: 1,
            name: 'Transfer',
            description: 'Transfer of tokens'
          }
        ],
        version: 1
      });
      const result = await translateEVM.getTxTypes();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('transactionTypes');
      expect(result).toHaveProperty('version');
      expect(Array.isArray(result.transactionTypes)).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['API error'] }));
      await expect(translateEVM.getTxTypes()).rejects.toThrow(TransactionError);
    });

    it('should validate response structure', async () => {
      mockRequest.mockResolvedValue({ invalid: 'structure' });
      await expect(translateEVM.getTxTypes()).rejects.toThrow(TransactionError);
    });
  });

  describe('Transaction Job', () => {
    it('should start and get transaction job results', async () => {
      const mockJobResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'pending',
          nextPageUrl: 'https://api.example.com/next-page'
        }
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488,
        false,
        true
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');
      expect(job).toHaveProperty('nextPageUrl');

      const mockResultsResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'completed',
          results: {
            transactions: [],
            totalCount: 0
          }
        }
      };
      mockRequest.mockResolvedValue(mockResultsResponse);
      const results = await translateEVM.getTransactionJobResults(validChain, job.jobId, { pageSize: 100 });
      expect(results).toBeDefined();
      expect(results).toHaveProperty('jobId');
      expect(results).toHaveProperty('status');
    });

    it('should handle invalid address in startTransactionJob', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid address'] }));
      await expect(translateEVM.startTransactionJob(
        validChain,
        'invalid-address',
        14637919,
        15289488
      )).rejects.toThrow(TransactionError);
    });

    it('should handle non-existent job ID', async () => {
      await expect(translateEVM.getTransactionJobResults(validChain, 'nonexistent-id')).rejects.toThrow();
    });

    it('should handle pagination in getTransactionJobResults', async () => {
      const mockJobResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'pending',
          nextPageUrl: 'https://api.example.com/next-page'
        }
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488
      );

      const mockResultsResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'completed',
          results: {
            transactions: [],
            totalCount: 0
          }
        }
      };
      mockRequest.mockResolvedValue(mockResultsResponse);
      const pageOptions = { pageSize: 50, pageNumber: 1, ascending: false };
      const results = await translateEVM.getTransactionJobResults(validChain, job.jobId, pageOptions);
      expect(results).toBeDefined();
      expect(results).toHaveProperty('jobId');
      expect(results).toHaveProperty('status');
    });

    it('should delete a transaction job', async () => {
      const mockJobResponse = {
        response: {
          jobId: 'test-job-id',
          status: 'pending',
          nextPageUrl: 'https://api.example.com/next-page'
        }
      };
      mockRequest.mockResolvedValue(mockJobResponse);
      const job = await translateEVM.startTransactionJob(
        validChain,
        validAddress,
        14637919,
        15289488,
        false,
        true
      );
      expect(job).toBeDefined();
      expect(job).toHaveProperty('jobId');

      mockRequest.mockResolvedValue({ response: undefined });
      await expect(translateEVM.deleteTransactionJob(validChain, job.jobId)).resolves.not.toThrow();
    });

    it('should handle non-existent job ID when deleting', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Job not found'] }));
      await expect(translateEVM.deleteTransactionJob(validChain, 'nonexistent-id')).rejects.toThrow(TransactionError);
    });
  });

  describe('Transactions', () => {
    const pageOptions: PageOptions = { pageSize: 10 };

    it('should return a valid TransactionsPage instance', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const result = await translateEVM.Transactions(validChain, validAddress, pageOptions);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle pagination correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: true,
        nextPageUrl: 'https://api.example.com/next-page'
      });
      const result = await translateEVM.Transactions(validChain, validAddress, { pageSize: 5 });
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle query parameters correctly', async () => {
      mockRequest.mockResolvedValue({
        items: [],
        hasNextPage: false,
        nextPageUrl: null
      });
      const options: PageOptions = {
        pageSize: 10,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false
      };
      const result = await translateEVM.Transactions(validChain, validAddress, options);
      expect(result).toBeInstanceOf(TransactionsPage);
    });

    it('should handle invalid address gracefully', async () => {
      try {
        await translateEVM.Transactions(validChain, 'invalid-address', pageOptions);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });

    it('should handle invalid chain gracefully', async () => {
      try {
        await translateEVM.Transactions('invalid-chain', validAddress, pageOptions);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TransactionError);
        if (error instanceof TransactionError) {
          expect(error.message).toContain('Transaction validation error');
        }
      }
    });
  });

  describe('getRawTransaction', () => {
    it('should get raw transaction details', async () => {
      const mockResponse = {
        network: 'ethereum',
        rawTx: {
          transactionHash: validTxHash,
          hash: validTxHash,
          transactionIndex: 0,
          type: 0,
          blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          blockNumber: 12345678,
          from: validAddress,
          to: validAddress,
          gas: 21000,
          gasPrice: 20000000000,
          value: 1000000000000000000,
          input: '0x',
          nonce: 0,
          r: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          s: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          v: '0x1b',
          networkEnum: 1,
          timestamp: 1234567890,
          gasUsed: 21000,
          transactionFee: 420000000000000
        },
        rawTraces: [],
        eventLogs: [],
        internalTxs: [],
        txReceipt: {
          blockNumber: 12345678,
          blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          status: 1,
          gasUsed: 21000,
          cumulativeGasUsed: 21000
        },
        decodedInput: {}
      };
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.getRawTransaction(validChain, validTxHash);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`eth/raw/tx/${validTxHash}`);
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateEVM.getRawTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });
  });

  describe('describeTransaction', () => {
    it('should describe a transaction', async () => {
      const mockResponse = {
        description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
        type: 'addLiquidity'
      };
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransaction(validChain, validTxHash);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`eth/describeTx/${validTxHash}`);
    });

    it('should describe a transaction with viewAsAccountAddress', async () => {
      const mockResponse = {
        description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
        type: 'addLiquidity'
      };
      const viewAsAddress = '0x1234567890123456789012345678901234567890';
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransaction(validChain, validTxHash, viewAsAddress);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `eth/describeTx/${validTxHash}?viewAsAccountAddress=${encodeURIComponent(viewAsAddress)}`
      );
    });

    it('should handle invalid hash', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hash'] }));
      await expect(translateEVM.describeTransaction(validChain, 'invalid-hash')).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['API error'] }));
      await expect(translateEVM.describeTransaction(validChain, validTxHash)).rejects.toThrow(TransactionError);
    });
  });

  describe('describeTransactions', () => {
    it('should describe multiple transactions', async () => {
      const mockResponse = [
        {
          description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
          type: 'addLiquidity'
        },
        {
          description: 'Swapped 1.5 ETH for 2,500 USDC.',
          type: 'swap'
        }
      ];
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransactions(validChain, [validTxHash, validTxHash]);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        'eth/describeTxs',
        'POST',
        expect.objectContaining({
          body: JSON.stringify({ txHashes: [validTxHash, validTxHash] })
        })
      );
    });

    it('should describe multiple transactions with viewAsAccountAddress', async () => {
      const mockResponse = [
        {
          description: 'Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.',
          type: 'addLiquidity'
        },
        {
          description: 'Swapped 1.5 ETH for 2,500 USDC.',
          type: 'swap'
        }
      ];
      const viewAsAddress = '0x1234567890123456789012345678901234567890';
      mockRequest.mockResolvedValue(mockResponse);
      const result = await translateEVM.describeTransactions(validChain, [validTxHash, validTxHash], viewAsAddress);
      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `eth/describeTxs?viewAsAccountAddress=${encodeURIComponent(viewAsAddress)}`,
        'POST',
        expect.objectContaining({
          body: JSON.stringify({ txHashes: [validTxHash, validTxHash] })
        })
      );
    });

    it('should handle invalid hashes', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['Invalid transaction hashes'] }));
      await expect(translateEVM.describeTransactions(validChain, ['invalid-hash'])).rejects.toThrow(TransactionError);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValue(new TransactionError({ message: ['API error'] }));
      await expect(translateEVM.describeTransactions(validChain, [validTxHash])).rejects.toThrow(TransactionError);
    });
  });
});