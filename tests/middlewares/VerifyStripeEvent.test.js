jest.mock('../../data/StripeInstanceGetter', () => jest.fn());
jest.mock('../../utils/WebhooksManager');

const getStripeInstance = require('../../data/StripeInstanceGetter');
const WebhooksManager = require('../../utils/WebhooksManager');
const VerifyStripeEvent = require('../../middlewares/VerifyStripeEvent');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('VerifyStripeEvent', () => {
  beforeEach(() => {
    getStripeInstance.mockResolvedValue({ webhooks: {} });
  });

  it('rejects missing stripe-signature', async () => {
    const req = createMockReq({ body: Buffer.from('{}') });
    const res = createMockRes();
    const next = createMockNext();
    await VerifyStripeEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects empty payload', async () => {
    const req = createMockReq({
      headers: { 'stripe-signature': 'sig' },
      body: Buffer.alloc(0),
    });
    const res = createMockRes();
    await VerifyStripeEvent(req, res, createMockNext());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('sets req.event on success', async () => {
    const event = { id: 'evt_1', type: 'customer.created' };
    WebhooksManager.createEvent.mockResolvedValue({ success: true, event });
    const req = createMockReq({
      headers: { 'stripe-signature': 'sig' },
      body: Buffer.from('payload'),
    });
    const next = createMockNext();
    await VerifyStripeEvent(req, createMockRes(), next);
    expect(req.event).toEqual(event);
    expect(next).toHaveBeenCalled();
  });
});
