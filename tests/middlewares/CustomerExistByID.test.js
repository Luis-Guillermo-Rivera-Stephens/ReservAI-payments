jest.mock('../../data/connectDB');
jest.mock('../../utils/CustomersManager');

const { connectDB } = require('../../data/connectDB');
const CustomersManager = require('../../utils/CustomersManager');
const CustomerExistByID = require('../../middlewares/CustomerExistByID');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('CustomerExistByID', () => {
  beforeEach(() => {
    connectDB.mockResolvedValue({});
  });

  it('sets req.customer when exists', async () => {
    CustomersManager.customerExistByID.mockResolvedValue({
      success: true,
      exists: true,
      customer: { stripe_customer_id: 'cus_1' },
    });
    const req = createMockReq();
    req.account = { id: 'acc-1' };
    const next = createMockNext();
    await CustomerExistByID(req, createMockRes(), next);
    expect(req.customer.stripe_customer_id).toBe('cus_1');
    expect(next).toHaveBeenCalled();
  });

  it('returns 404 when missing', async () => {
    CustomersManager.customerExistByID.mockResolvedValue({ success: true, exists: false });
    const req = createMockReq();
    req.account = { id: 'acc-1' };
    const res = createMockRes();
    await CustomerExistByID(req, res, createMockNext());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
