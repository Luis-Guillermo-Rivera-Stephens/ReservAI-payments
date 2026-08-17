describe('WebhooksManager', () => {
  it('createEvent delegates to stripe.webhooks.constructEvent', async () => {
    jest.resetModules();
    jest.doMock('../../data/StripeInstanceGetter', () => jest.fn());
    const event = { id: 'evt', type: 'test' };
    const stripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue(event),
      },
    };
    const WebhooksManager = require('../../utils/WebhooksManager');
    const result = await WebhooksManager.createEvent('sig', Buffer.from('body'), stripe);
    expect(result.success).toBe(true);
    expect(result.event).toEqual(event);
  });
});
