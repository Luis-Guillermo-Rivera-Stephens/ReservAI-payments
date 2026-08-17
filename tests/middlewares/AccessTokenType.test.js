const AccessTokenType = require('../../middlewares/AccessTokenType');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('AccessTokenType', () => {
  it('allows access token type', async () => {
    const req = createMockReq();
    req.token_type = 'access';
    const next = createMockNext();
    await AccessTokenType(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects non-access token type', async () => {
    const req = createMockReq();
    req.token_type = 'two_factor_authentication';
    const res = createMockRes();
    const next = createMockNext();
    await AccessTokenType(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
