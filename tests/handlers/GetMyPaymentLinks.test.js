jest.mock('../../data/StripeInstanceGetter');
jest.mock('../../utils/CustomersManager');
jest.mock('../../utils/SubscriptionManager');

const getStripeInstance = require('../../data/StripeInstanceGetter');
const CustomersManager = require('../../utils/CustomersManager');
const SubscriptionManager = require('../../utils/SubscriptionManager');
const GetMyPaymentLinks = require('../../handlers/GetMyPaymentLinks');
const { createMockReq, createMockRes } = require('../helpers/mockReqRes');

describe('GetMyPaymentLinks', () => {
  it('continues when portal fails and still returns payment links', async () => {
    getStripeInstance.mockResolvedValue({});
    CustomersManager.createPortalSession.mockResolvedValue({
      success: false,
      error: 'portal error',
    });
    SubscriptionManager.createSubscriptionPaymentLinks.mockResolvedValue({
      success: true,
      message: 'ok',
      paymentLinks: { basico: { url: 'https://b' }, premium: { url: 'https://p' } },
    });
    const req = createMockReq();
    req.customer = { stripe_customer_id: 'cus_1' };
    req.account = { id: 'acc-1', email: 'u@example.com' };
    const res = createMockRes();
    await GetMyPaymentLinks(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json.paymentLinks.basico.url).toBe('https://b');
    expect(SubscriptionManager.createSubscriptionPaymentLinks).toHaveBeenCalledWith(
      'cus_1',
      'acc-1',
      'u@example.com',
      null,
      null,
      expect.anything()
    );
  });
});
