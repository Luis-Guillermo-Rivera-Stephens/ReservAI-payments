const jwt = require('jsonwebtoken');
const CookieAuth = require('../../utils/CookieAuth');

function signToken({ id, token_type = 'access', session_version = 0, extra = {}, expiresIn = '1h' } = {}) {
  return jwt.sign(
    { id, token_type, session_version, ...extra },
    process.env.JWT_SECRET_KEY,
    { expiresIn }
  );
}

function cookiesForToken(tokenType, tokenValue) {
  const name = CookieAuth.cookieName(tokenType);
  return { [name]: tokenValue };
}

function accessCookie(accountId = 'account-1', opts = {}) {
  const token = signToken({ id: accountId, token_type: 'access', ...opts });
  return cookiesForToken('access', token);
}

function twoFaCookie(accountId = 'account-1') {
  const token = signToken({ id: accountId, token_type: 'two_factor_authentication' });
  return cookiesForToken('two_factor_authentication', token);
}

function cookieHeader(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

module.exports = {
  signToken,
  cookiesForToken,
  accessCookie,
  twoFaCookie,
  cookieHeader,
};
