import nock from 'nock';
import { TranslateEVM } from '../../src/translate/translateEVM';

describe('TranslateEVM', () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = TranslateEVM(apiKey);

  beforeEach(() => {
    nock.cleanAll();
  });

  it('should throw an error if API key is not provided', () => {
    expect(() => TranslateEVM('')).toThrow('API key is required');
  });

  it('should fetch chains successfully', async () => {
    const mockChains = [{"ecosystem": "evm", "evmChainId": 42161, "name": "arbitrum"}, {"ecosystem": "evm", "evmChainId": 42170, "name": "arbitrum-nova"}];

    nock('https://translate.noves.fi')
      .get('/evm/chains')
      .reply(200, mockChains);

    const response = await translate.getChains();
    expect(response[0]).toEqual(mockChains[0]);
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle invalid API key format', async () => {
    const invalidApiKey = 'invalid-key';
    const translateEVMWithInvalidKey = TranslateEVM(invalidApiKey);
  
    nock('https://translate.noves.fi')
      .get('/evm/chains')
      .reply(403, { error: 'Forbidden' });
  
    const response = await translateEVMWithInvalidKey.getChains();
    expect(response).toEqual({
      message: "Invalid API Key"
    });
  });
});