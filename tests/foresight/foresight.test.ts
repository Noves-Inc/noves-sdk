jest.setTimeout(10000);

import { Foresight } from '../../src/foresight/foresight';
import { createForesightClient } from '../../src/utils/apiUtils';
import { TransactionError } from '../../src/errors/TransactionError';
import { Chain, UnsignedTransaction, UserOperation } from '../../src/types/types';

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
      const mockChains: Chain[] = [{ name: 'ethereum', evmChainId: 1, ecosystem: 'evm' }];
      mockRequest.mockResolvedValue({ response: mockChains });

      const result = await foresight.getChains();

      expect(result).toEqual(mockChains);
      expect(mockRequest).toHaveBeenCalledWith('chains');
    });
  });

  describe('preview', () => {
    const mockChain = 'ethereum';
    const mockUnsignedTx: UnsignedTransaction = {
        to: '0x123', value: '0x0',
        from: null,
        data: null,
        gas: null,
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        type: null
    };
    const mockResponse = { hash: '0xabc', description: 'Test transaction' };

    it('should preview a transaction', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.preview(mockChain, mockUnsignedTx);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/preview`, 'POST', { body: JSON.stringify(mockUnsignedTx) });
    });

    it('should handle state overrides', async () => {
      const stateOverridesWithStateDiff = {
        '0x123': { stateDiff: { balance: '0x1' } }
      };
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, stateOverridesWithStateDiff);

      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/preview`, 'POST', { body: JSON.stringify({ ...mockUnsignedTx, stateOverrides: stateOverridesWithStateDiff }) });
    });

    it('should handle viewAsAccountAddress parameter', async () => {
      const viewAsAccountAddress = '0x456';
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, undefined, viewAsAccountAddress);

      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/preview?viewAsAccountAddress=${viewAsAccountAddress}`, 'POST', { body: JSON.stringify(mockUnsignedTx) });
    });

    it('should handle block parameter', async () => {
      const block = 12345;
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview(mockChain, mockUnsignedTx, undefined, undefined, block);

      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/preview?block=${block}`, 'POST', { body: JSON.stringify(mockUnsignedTx) });
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid transaction'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.preview(mockChain, mockUnsignedTx)).rejects.toThrow(TransactionError);
    });
  });

  describe('preview4337', () => {
    const mockChain = 'ethereum';
    const mockUserOp: UserOperation = {
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
    const mockResponse = { hash: '0xabc', description: 'Test user operation' };

    it('should preview a user operation', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.preview4337(mockChain, mockUserOp);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/preview4337`, 'POST', { body: JSON.stringify(mockUserOp) });
    });

    it('should handle block parameter', async () => {
      const block = 12345;
      mockRequest.mockResolvedValue({ response: mockResponse });

      await foresight.preview4337(mockChain, mockUserOp, block);

      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/preview4337?block=${block}`, 'POST', { body: JSON.stringify(mockUserOp) });
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid user operation'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.preview4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });
  });

  describe('describe', () => {
    const mockChain = 'ethereum';
    const mockUnsignedTx: UnsignedTransaction = {
        to: '0x123', value: '0x0',
        from: null,
        data: null,
        gas: null,
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        type: null
    };
    const mockResponse = { description: 'Test transaction description' };

    it('should describe a transaction', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.describe(mockChain, mockUnsignedTx);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/describe`, 'POST', { body: JSON.stringify(mockUnsignedTx) });
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid transaction'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.describe(mockChain, mockUnsignedTx)).rejects.toThrow(TransactionError);
    });
  });

  describe('describe4337', () => {
    const mockChain = 'ethereum';
    const mockUserOp: UserOperation = {
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
    const mockResponse = { description: 'Test user operation description' };

    it('should describe a user operation', async () => {
      mockRequest.mockResolvedValue({ response: mockResponse });

      const result = await foresight.describe4337(mockChain, mockUserOp);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith(`${mockChain}/describe4337`, 'POST', { body: JSON.stringify(mockUserOp) });
    });

    it('should throw TransactionError on validation errors', async () => {
      const errorResponse = { status: 400, errors: ['Invalid user operation'] };
      mockRequest.mockRejectedValue(new Response(JSON.stringify(errorResponse)));

      await expect(foresight.describe4337(mockChain, mockUserOp)).rejects.toThrow(TransactionError);
    });
  });
});
