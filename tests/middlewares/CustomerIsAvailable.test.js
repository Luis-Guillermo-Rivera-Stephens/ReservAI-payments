jest.mock('../../data/connectDB');
jest.mock('../../utils/CustomersManager');

const { connectDB } = require('../../data/connectDB');
const CustomersManager = require('../../utils/CustomersManager');
const CustomerIsAvailable = require('../../middlewares/CustomerIsAvailable');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('CustomerIsAvailable', () => {
  beforeEach(() => {
    connectDB.mockResolvedValue({});
  });

  it('allows when customer does not exist', async () => {
    CustomersManager.customerExistByID.mockResolvedValue({ success: true, exists: false });
    const req = createMockReq();
    req.account = { id: 'acc-1' };
    const next = createMockNext();
    await CustomerIsAvailable(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 when customer already exists', async () => {
    CustomersManager.customerExistByID.mockResolvedValue({ success: true, exists: true });
    const req = createMockReq();
    req.account = { id: 'acc-1' };
    const res = createMockRes();
    await CustomerIsAvailable(req, res, createMockNext());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
