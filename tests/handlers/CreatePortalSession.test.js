jest.mock('../../data/StripeInstanceGetter');
jest.mock('../../utils/CustomersManager');

const getStripeInstance = require('../../data/StripeInstanceGetter');
const CustomersManager = require('../../utils/CustomersManager');
const CreatePortalSession = require('../../handlers/CreatePortalSession');
const { createMockReq, createMockRes } = require('../helpers/mockReqRes');

describe('CreatePortalSession', () => {
  it('returns portal session url', async () => {
    getStripeInstance.mockResolvedValue({});
    CustomersManager.createPortalSession.mockResolvedValue({
      success: true,
      session: { url: 'https://billing.stripe.com/session' },
    });
    const req = createMockReq();
    req.customer = { stripe_customer_id: 'cus_1' };
    const res = createMockRes();
    await CreatePortalSession(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json.session.url).toContain('stripe.com');
  });
});
