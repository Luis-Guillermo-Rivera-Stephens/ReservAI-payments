const CookieAuth = require('../../utils/CookieAuth');
const { createMockReq, createMockRes } = require('../helpers/mockReqRes');
const { accessCookie, twoFaCookie } = require('../helpers/cookieAuth');

describe('CookieAuth', () => {
  it('uses pm_ prefix in test NODE_ENV', () => {
    expect(CookieAuth.prefix()).toBe('pm_');
    expect(CookieAuth.cookieName('access')).toBe('pm_access');
  });

  it('uses __Host-pm_ prefix in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      expect(CookieAuth.prefix()).toBe('__Host-pm_');
      expect(CookieAuth.cookieName('access')).toBe('__Host-pm_access');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('setTokenCookie applies httpOnly, sameSite, path', () => {
    const res = createMockRes();
    CookieAuth.setTokenCookie(res, 'access', 'tok', 3600000);
    expect(res.cookie).toHaveBeenCalledWith(
      'pm_access',
      'tok',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600000,
      })
    );
  });

  it('clearSessionCookies clears all auth cookie types', () => {
    const res = createMockRes();
    CookieAuth.clearSessionCookies(res);
    const types = Object.keys(CookieAuth.TOKEN_TYPE_TO_SUFFIX);
    expect(res.clearCookie).toHaveBeenCalledTimes(types.length);
  });

  it('listAuthCookies finds access cookie', () => {
    const req = createMockReq({ cookies: accessCookie('acc-1') });
    const list = CookieAuth.listAuthCookies(req);
    expect(list.some((c) => c.suffix === 'access')).toBe(true);
  });

  it('listAuthCookies prefers multiple cookies', () => {
    const cookies = { ...accessCookie('acc-1'), ...twoFaCookie('acc-1') };
    const req = createMockReq({ cookies });
    expect(CookieAuth.listAuthCookies(req).length).toBeGreaterThanOrEqual(2);
  });
});
