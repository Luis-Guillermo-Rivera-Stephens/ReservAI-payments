jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({ mocked: true }));
});

const Stripe = require('stripe');
const getStripeInstance = require('../../data/StripeInstanceGetter');

describe('StripeInstanceGetter', () => {
  it('returns Stripe instance with secret key', async () => {
    const instance = await getStripeInstance();
    expect(Stripe).toHaveBeenCalledWith(process.env.STRIPE_SECRET_KEY);
    expect(instance).toEqual({ mocked: true });
  });
});
