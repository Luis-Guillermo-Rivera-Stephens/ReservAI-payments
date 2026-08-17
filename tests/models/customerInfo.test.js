const CustomerInfo = require('../../models/customerInfo');
const { loadStripeFixture } = require('../helpers/stripeFixtures');

describe('CustomerInfo model', () => {
  it('fromStripeObject maps customer fixture', () => {
    const event = loadStripeFixture('customer.created');
    const info = CustomerInfo.fromStripeObject(event.data.object);
    expect(info.stripe_customer_id).toBe('cus_test123');
    expect(info.account_id).toBe('account-1');
    expect(info.created_at).toBeInstanceOf(Date);
  });

  it('toJSON returns expected shape', () => {
    const info = new CustomerInfo('cus_x', 'acc_x', new Date());
    expect(info.toJSON()).toEqual({
      stripe_customer_id: 'cus_x',
      account_id: 'acc_x',
      created_at: info.created_at,
    });
  });
});
