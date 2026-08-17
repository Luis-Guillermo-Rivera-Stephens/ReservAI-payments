jest.mock('../../data/connectDB');
jest.mock('../../utils/AccountManager');

const { connectDB } = require('../../data/connectDB');
const AccountManager = require('../../utils/AccountManager');
const AccountExistByID = require('../../middlewares/AccountExistByID');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('AccountExistByID', () => {
  const db = { query: jest.fn() };

  beforeEach(() => {
    connectDB.mockResolvedValue(db);
  });

  it('loads account when exists', async () => {
    AccountManager.accountExistsByID.mockResolvedValue({
      success: true,
      exists: true,
      account: {
        id: 'acc-1',
        name: 'User',
        email: 'u@example.com',
        password: 'hash',
        createdAt: new Date(),
        started: true,
        verified: true,
        type: 'client',
        twofaenabled: false,
        salt: 'salt-fixed',
      },
    });
    const req = createMockReq();
    req.token_id = 'acc-1';
    const next = createMockNext();
    await AccountExistByID(req, createMockRes(), next);
    expect(req.account.id).toBe('acc-1');
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 when account missing', async () => {
    AccountManager.accountExistsByID.mockResolvedValue({ success: true, exists: false });
    const req = createMockReq();
    req.token_id = 'missing';
    const res = createMockRes();
    await AccountExistByID(req, res, createMockNext());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
