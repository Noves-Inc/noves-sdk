import nock from 'nock';
import { Translate } from '../../src/index';

jest.setTimeout(10000);

const BASE_URL = 'https://translate.noves.fi';

describe('Translate', () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = Translate.evm(apiKey);

  beforeEach(() => {
    nock.cleanAll();
  });

  it('should throw an error if API key for EVM is not provided', () => {
    expect(() => Translate.evm('')).toThrow('API key is required');
  });

  it('should throw an error if API key for SVM is not provided', () => {
    expect(() => Translate.svm('')).toThrow('API key is required');
  });

  it('should throw an error if API key for UTXO is not provided', () => {
    expect(() => Translate.utxo('')).toThrow('API key is required');
  });

  it('should handle invalid API key format', async () => {
    const invalidApiKey = 'invalid-key';
    const translateEVMWithInvalidKey = Translate.evm(invalidApiKey);

    nock(BASE_URL)
      .get('/evm/chains')
      .reply(403, { error: 'Forbidden' });

    const response = await translateEVMWithInvalidKey.getChains();
    expect(response).toEqual({
      message: "Invalid API Key"
    });
  });
});