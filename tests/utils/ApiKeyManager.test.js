const ApiKeyManager = require('../../utils/ApiKeyManager');

describe('ApiKeyManager', () => {
  it('VerifyApiKey returns admin id', () => {
    expect(ApiKeyManager.VerifyApiKey(process.env.APIKEY_ADMIN)).toBe(process.env.APIKEY_ID_ADMIN);
  });

  it('VerifyApiKey returns client id', () => {
    expect(ApiKeyManager.VerifyApiKey(process.env.APIKEY_CLIENT)).toBe(process.env.APIKEY_ID_CLIENT);
  });

  it('VerifyApiKey returns null for unknown key', () => {
    expect(ApiKeyManager.VerifyApiKey('wrong-key')).toBeNull();
  });
});
