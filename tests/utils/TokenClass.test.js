const jwt = require('jsonwebtoken');
const TokenClass = require('../../utils/TokenClass');
const TokenManager = require('../../utils/TokenManager');

describe('TokenClass', () => {
  it('FromDecodedInfo returns null for invalid payload', () => {
    expect(TokenClass.FromDecodedInfo(null)).toBeNull();
    expect(TokenClass.FromDecodedInfo({ id: 'x' })).toBeNull();
  });

  it('FromDecodedInfo maps session_version and extra', () => {
    const token = TokenClass.FromDecodedInfo({
      id: 'acc-1',
      token_type: 'access',
      session_version: 2,
      role: 'client',
    });
    expect(token.id).toBe('acc-1');
    expect(token.token_type).toBe('access');
    expect(token.session_version).toBe(2);
    expect(token.extra.role).toBe('client');
  });

  it('AccessToken produces verifiable JWT', () => {
    const raw = TokenClass.AccessToken('user-1', 1);
    const result = TokenManager.VerifyToken(raw);
    expect(result.success).toBe(true);
    expect(result.decoded.id).toBe('user-1');
    expect(result.decoded.token_type).toBe('access');
  });

  it('static helpers set token_type', () => {
    const verify = TokenClass.VerificationToken('u1');
    const decoded = jwt.decode(verify);
    expect(decoded.token_type).toBe('verification');
  });
});
