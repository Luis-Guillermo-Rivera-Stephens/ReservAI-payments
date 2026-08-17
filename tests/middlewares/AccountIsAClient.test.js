const AccountIsAClient = require('../../middlewares/AccountIsAClient');
const Account = require('../../models/account');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('AccountIsAClient', () => {
  it('allows client accounts', async () => {
    const req = createMockReq();
    req.account = new Account('id', 'n', 'e', 'p', new Date(), true, true, 'client', false, 'salt');
    const next = createMockNext();
    await AccountIsAClient(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects admin accounts', async () => {
    const req = createMockReq();
    req.account = new Account('id', 'n', 'e', 'p', new Date(), true, true, 'admin', false, 'salt');
    const res = createMockRes();
    const next = createMockNext();
    await AccountIsAClient(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
