const Subscription = require('../../models/subscription');
const { loadStripeFixture } = require('../helpers/stripeFixtures');

describe('Subscription model', () => {
  it('constructor and toJSON preserve fields', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-02-01');
    const sub = new Subscription(
      'cus_1',
      'sub_1',
      'prod_1',
      'active',
      start,
      end,
      true,
      'Plan Premium',
      999,
      start
    );
    const json = sub.toJSON();
    expect(json.stripe_customer_id).toBe('cus_1');
    expect(json.stripe_subscription_id).toBe('sub_1');
    expect(json.plan_name).toBe('Plan Premium');
    expect(json.amount).toBe(999);
    expect(json.cancel_at_period_end).toBe(true);
  });

  it('fromStripeObject maps fixture subscription', () => {
    const event = loadStripeFixture('customer.subscription.created');
    const sub = Subscription.fromStripeObject(event.data.object);
    expect(sub.stripe_subscription_id).toBe('sub_test123');
    expect(sub.stripe_customer_id).toBe('cus_test123');
    expect(sub.status).toBe('active');
    expect(sub.plan_name).toBe('Plan Premium');
    expect(sub.amount).toBe(999);
    expect(sub.current_period_start).toBeInstanceOf(Date);
    expect(sub.current_period_end).toBeInstanceOf(Date);
  });
});
