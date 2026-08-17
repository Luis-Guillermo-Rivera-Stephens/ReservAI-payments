const TokenManager = require('../../utils/TokenManager');
const TokenClass = require('../../utils/TokenClass');

describe('TokenManager', () => {
  it('VerifyToken succeeds for valid token', () => {
    const token = TokenClass.AccessToken('account-99');
    const result = TokenManager.VerifyToken(token);
    expect(result.success).toBe(true);
    expect(result.decoded.id).toBe('account-99');
  });

  it('VerifyToken fails for invalid token', () => {
    const result = TokenManager.VerifyToken('not-a-jwt');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/invalid/i);
  });
});
