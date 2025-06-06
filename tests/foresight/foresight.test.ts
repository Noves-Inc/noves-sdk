jest.setTimeout(10000);

import { Foresight } from '../../src/foresight/foresight';
import { createForesightClient } from '../../src/utils/apiUtils';
import { TransactionError } from '../../src/errors/TransactionError';
import { 
  EVMTranslateUserOperation, 
  EVMForesightChain, 
  EVMForesightPreviewResponse, 
  EVMForesightPreview4337Response,
  EVMTranslateUnsignedTransaction,
  EVMForesightScreenResponse,
  EVMForesightScreen4337Response
} from '../../src/types/evm';
import { ForesightUrlScreenResponse } from '../../src/types/common';

jest.mock('../../src/utils/apiUtils', () => {
  const originalModule = jest.requireActual('../../src/utils/apiUtils');
  return {
    ...originalModule,
    createForesightClient: jest.fn(),
  };
});

describe('Foresight', () => {
  let foresight: Foresight;
  const mockApiKey = 'test-api-key';
  const mockRequest = jest.fn();

  beforeEach(() => {
    (createForesightClient as jest.Mock).mockReturnValue(mockRequest);
    foresight = new Foresight(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new Foresight('')).toThrow('API key is required');
    });

    it('should create a Foresight instance with a valid API key', () => {
      expect(foresight).toBeInstanceOf(Foresight);
      expect(createForesightClient).toHaveBeenCalledWith(mockApiKey);
    });
  });

  describe('getChains', () => {
    it('should return a list of chains', async () => {
      const mockChains: EVMForesightChain[] = [{
        name: 'ethereum',
        ecosystem: 'evm',
        nativeCoin: {
          name: 'ETH',
          symbol: 'ETH',
          address: 'ETH',
          decimals: 18
        }
      }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await foresight.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('evm/chains');
    });
  });

  describe('preview', () => {
    const mockChain = 'ethereum';
    const mockUnsignedTx: EVMTranslateUnsignedTransaction = {
        to: '0x123', value: '0x0',
        from: null,
        data: null,
        gas: null,
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        type: null
    };
    const mockResponse: EVMForesightPreviewResponse = {
      txTypeVersion: 2,
      chain: "eth",
      accountAddress: "0xabCDEF1234567890ABcDEF1234567890aBCDeF12",
      classificationData: {
        type: "sendToken",
        source: {
          type: "human"
        },
        description: "Will send 0 ETH.",
        protocol: {},
        sent: [
          {
            action: "sent",
            from: {
              name: "This wallet",
              address: "0xabCDEF1234567890ABcDEF1234567890aBCDeF12"
            },
            to: {
              name: "NULL: 0x123...890",
              address: "0x1234567890123456789012345678901234567890"
            },
            amount: "0",
            token: {
              symbol: "ETH",
              name: "ETH",
              decimals: 18,
              address: "ETH"
            }
          },
          {
            action: "paidGas",
            from: {
              name: "This wallet",
              address: "0xabCDEF1234567890ABcDEF1234567890aBCDeF12"
            },
            to: {
              name: null,
              address: null
            },
            amount: "0.00042",
            token: {
              symbol: "ETH",
              name: "ETH",
              decimals: 18,
              address: "ETH"
            }
          }
        ],
        received: []
      },
      rawTransactionData: {
        fromAddress: "0xabCDEF1234567890ABcDEF1234567890aBCDeF12",
        toAddress: "0x1234567890123456789012345678901234567890",
        gasUsed: 21000
      }
    };

    it('should preview a transaction', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.preview(mockChain, mockUnsignedTx);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/preview`, 
        'POST', 
        { body: JSON.stringify({ transaction: mockUnsignedTx, stateOverrides: {} }) }
      );
    });

    it('should handle state overrides', async () => {
      const stateOverridesWithStateDiff = {
        '0x123': { stateDiff: { balance: '0x1' } }
      };
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, stateOverridesWithStateDiff);

      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/preview`, 
        'POST', 
        { body: JSON.stringify({ transaction: mockUnsignedTx, stateOverrides: stateOverridesWithStateDiff }) }
      );
    });

    it('should handle viewAsAccountAddress parameter', async () => {
      const viewAsAccountAddress = '0x456';
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, undefined, viewAsAccountAddress);

      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/preview?viewAsAccountAddress=${viewAsAccountAddress}`, 
        'POST', 
        { body: JSON.stringify({ transaction: mockUnsignedTx, stateOverrides: {} }) }
      );
    });

    it('should handle block parameter', async () => {
      const block = 12345;
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, undefined, undefined, block);

      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/preview?block=${block}`, 
        'POST', 
        { body: JSON.stringify({ transaction: mockUnsignedTx, stateOverrides: {} }) }
      );
    });

    it('should handle multiple query parameters', async () => {
      const block = 12345;
      const viewAsAccountAddress = '0x456';
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, undefined, viewAsAccountAddress, block);

      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/preview?block=${block}&viewAsAccountAddress=${viewAsAccountAddress}`, 
        'POST', 
        { body: JSON.stringify({ transaction: mockUnsignedTx, stateOverrides: {} }) }
      );
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid transaction'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.preview(mockChain, mockUnsignedTx)).rejects.toThrow(TransactionError);
    });
  });

  describe('preview4337', () => {
    const mockChain = 'ethereum';
    const mockUserOp: EVMTranslateUserOperation = {
        sender: '0x123', nonce: 0,
        initCode: null,
        callData: null,
        callGasLimit: 0,
        verificationGasLimit: 0,
        preVerificationGas: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymasterAndData: null,
        signature: null
    };
    const mockResponse: EVMForesightPreview4337Response = {
      txTypeVersion: 2,
      chain: "eth",
      accountAddress: "0x0576A174D229e3cfa37253523E645a78a0C91b37",
      classificationData: {
        type: "unclassified",
        source: {
          type: null
        },
        description: "Account abstraction contract will call 'handleOps' on contract 0x5FF1.",
        protocol: {},
        sent: [],
        received: []
      },
      rawTransactionData: {
        fromAddress: "0x9B1054d24dC31a54739B6d8950af5a7dbAa56815",
        toAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        gasUsed: 41103
      }
    };

    it('should preview a user operation', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.preview4337(mockChain, mockUserOp);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/preview4337`, 
        'POST', 
        { body: JSON.stringify({ userOp: mockUserOp }) }
      );
    });

    it('should handle block parameter', async () => {
      const block = 12345;
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview4337(mockChain, mockUserOp, block);

      expect(mockRequest).toHaveBeenCalledWith(`evm/${mockChain}/preview4337?block=${block}`, 'POST', { body: JSON.stringify({ userOp: mockUserOp }) });
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid user operation'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.preview4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });
  });

  describe('describe', () => {
    const mockChain = 'ethereum';
    const mockUnsignedTx: EVMTranslateUnsignedTransaction = {
        to: '0x123', value: '0x0',
        from: '0x456',
        data: '0x',
        gas: '30000',
        gasPrice: '30000000000',
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        type: '0x0'
    };
    const mockResponse = { description: 'Transfer native coin.' };

    it('should describe a transaction', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.describe(mockChain, mockUnsignedTx);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/describe`, 
        'POST', 
        { body: JSON.stringify({ transaction: mockUnsignedTx }) }
      );
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid transaction'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.describe(mockChain, mockUnsignedTx)).rejects.toThrow(TransactionError);
    });
  });

  describe('describe4337', () => {
    const mockChain = 'ethereum';
    const mockUserOp: EVMTranslateUserOperation = {
        sender: '0x123', nonce: 0,
        initCode: null,
        callData: null,
        callGasLimit: 0,
        verificationGasLimit: 0,
        preVerificationGas: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymasterAndData: null,
        signature: null
    };
    const mockResponse = { description: 'Test user operation description', type: 'unclassified' };

    it('should describe a user operation', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.describe4337(mockChain, mockUserOp);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/describe4337`, 
        'POST', 
        { body: JSON.stringify({ userOp: mockUserOp }) }
      );
    });

    it('should throw TransactionError on invalid response format', async () => {
      mockRequest.mockResolvedValue({ response: { description: 'Test' } }); // Missing type field

      await expect(foresight.describe4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid user operation'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.describe4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });

    it('should throw TransactionError on network errors', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(foresight.describe4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });
  });

  describe('screen', () => {
    const mockChain = 'ethereum';
    const mockUnsignedTx: EVMTranslateUnsignedTransaction = {
      from: '0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65',
      to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      value: '0x16345785d8a0000',
      data: '0x',
      gas: '0x5208',
      gasPrice: null,
      maxFeePerGas: '0x4a817c800',
      maxPriorityFeePerGas: '0x3b9aca00',
      type: '0x2'
    };
    const mockResponse: EVMForesightScreenResponse = {
      simulation: {
        txTypeVersion: 2,
        chain: "eth",
        accountAddress: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
        classificationData: {
          type: "sendToken",
          source: {
            type: "human"
          },
          description: "Will send 0.10 ETH.",
          protocol: {},
          sent: [
            {
              action: "sent",
              from: {
                name: "@ChrisLally: chrislally.eth",
                address: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65"
              },
              to: {
                name: "Wrapped Ether (WETH)",
                address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
              },
              amount: "0.1",
              token: {
                symbol: "ETH",
                name: "ETH",
                decimals: 18,
                address: "ETH"
              }
            }
          ],
          received: []
        },
        rawTransactionData: {
          fromAddress: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
          toAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          gasUsed: 21000
        }
      },
      toAddress: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        isContract: false,
        isVerified: true,
        isToken: true,
        risksDetected: []
      },
      tokens: [
        {
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          symbol: "",
          name: "",
          isVerified: true,
          risksDetected: []
        }
      ]
    };

    it('should screen a transaction', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.screen(mockChain, mockUnsignedTx);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/screen`,
        'POST',
        { body: JSON.stringify({ transaction: mockUnsignedTx }) }
      );
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid transaction'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.screen(mockChain, mockUnsignedTx)).rejects.toThrow(TransactionError);
    });
  });

  describe('screen4337', () => {
    const mockChain = 'ethereum';
    const mockUserOp: EVMTranslateUserOperation = {
      sender: '0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65',
      nonce: 0,
      initCode: '0x',
      callData: '0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000de0b6b3a7640000',
      callGasLimit: 100000,
      verificationGasLimit: 100000,
      preVerificationGas: 21000,
      maxFeePerGas: 20000000000,
      maxPriorityFeePerGas: 1000000000,
      paymasterAndData: '0x',
      signature: '0x'
    };
    const mockResponse: EVMForesightScreen4337Response = {
      simulation: {
        txTypeVersion: 2,
        chain: "eth",
        accountAddress: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
        classificationData: {
          type: "unclassified",
          source: {
            type: null
          },
          description: "Account abstraction contract will call 'handleOps' on contract 0x5FF1.",
          protocol: {},
          sent: [],
          received: []
        },
        rawTransactionData: {
          fromAddress: "0x9B1054d24dC31a54739B6d8950af5a7dbAa56815",
          toAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
          gasUsed: 41115
        }
      },
      toAddress: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        isContract: true,
        isVerified: true,
        isToken: true,
        risksDetected: []
      },
      tokens: [
        {
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          symbol: "",
          name: "",
          isVerified: true,
          risksDetected: []
        }
      ]
    };

    it('should screen a user operation', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.screen4337(mockChain, mockUserOp);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `evm/${mockChain}/screen4337`,
        'POST',
        { body: JSON.stringify({ userOp: mockUserOp }) }
      );
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid user operation'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.screen4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });
  });

  describe('screenUrl', () => {
    const mockUrl = 'https://uniswap-v3.com';
    const mockResponse: ForesightUrlScreenResponse = {
      domain: 'uniswap-v3.com',
      risksDetected: [{ type: 'blacklisted' }]
    };

    it('should screen a URL', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.screenUrl(mockUrl);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(
        `url/screen?url=${encodeURIComponent(mockUrl)}`
      );
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid URL'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.screenUrl(mockUrl)).rejects.toThrow(TransactionError);
    });
  });
});
