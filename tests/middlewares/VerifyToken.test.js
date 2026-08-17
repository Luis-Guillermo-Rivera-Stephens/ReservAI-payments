const VerifyToken = require('../../middlewares/VerifyToken');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');
const { accessCookie, twoFaCookie, signToken } = require('../helpers/cookieAuth');

describe('VerifyToken', () => {
  it('accepts pm_access cookie', async () => {
    const req = createMockReq({ cookies: accessCookie('client-account-id') });
    const res = createMockRes();
    const next = createMockNext();
    await VerifyToken(req, res, next);
    expect(req.token_id).toBe('client-account-id');
    expect(req.token_type).toBe('access');
    expect(next).toHaveBeenCalled();
  });

  it('prioritizes access over two-fa cookie', async () => {
    const cookies = {
      ...twoFaCookie('two-fa-id'),
      ...accessCookie('access-id'),
    };
    const req = createMockReq({ cookies });
    const next = createMockNext();
    await VerifyToken(req, createMockRes(), next);
    expect(req.token_id).toBe('access-id');
    expect(req.token_type).toBe('access');
  });

  it('returns 418 when only Authorization JWT without cookie', async () => {
    const jwtOnly = signToken({ id: 'jwt-user', token_type: 'access' });
    const req = createMockReq({
      headers: { authorization: jwtOnly },
      cookies: {},
    });
    const res = createMockRes();
    const next = createMockNext();
    await VerifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows API key in non-production', async () => {
    const req = createMockReq({
      headers: { authorization: process.env.APIKEY_CLIENT },
      cookies: {},
    });
    const next = createMockNext();
    await VerifyToken(req, createMockRes(), next);
    expect(req.token_id).toBe(process.env.APIKEY_ID_CLIENT);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 API_KEY_DISABLED in production', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    global.IS_PRODUCTION = true;
    try {
      const req = createMockReq({
        headers: { authorization: process.env.APIKEY_CLIENT },
        cookies: {},
      });
      const res = createMockRes();
      const next = createMockNext();
      await VerifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res._json.code).toBe('API_KEY_DISABLED');
    } finally {
      process.env.NODE_ENV = prev;
      global.IS_PRODUCTION = false;
    }
  });
});
