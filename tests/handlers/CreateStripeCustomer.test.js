jest.mock('../../data/StripeInstanceGetter');
jest.mock('../../utils/CustomersManager');

const getStripeInstance = require('../../data/StripeInstanceGetter');
const CustomersManager = require('../../utils/CustomersManager');
const CreateStripeCustomer = require('../../handlers/CreateStripeCustomer');
const { createMockReq, createMockRes } = require('../helpers/mockReqRes');

describe('CreateStripeCustomer', () => {
  it('returns customer on success', async () => {
    getStripeInstance.mockResolvedValue({});
    CustomersManager.createCustomerInStripe.mockResolvedValue({
      success: true,
      message: 'ok',
      customer: { id: 'cus_1' },
    });
    const req = createMockReq();
    req.account = { id: 'acc-1', email: 'u@example.com', name: 'User' };
    const res = createMockRes();
    await CreateStripeCustomer(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json.customer.id).toBe('cus_1');
  });

  it('returns 500 when stripe fails', async () => {
    getStripeInstance.mockRejectedValue(new Error('stripe down'));
    const req = createMockReq();
    req.account = { id: 'acc-1', email: 'u@example.com', name: 'User' };
    const res = createMockRes();
    await CreateStripeCustomer(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
