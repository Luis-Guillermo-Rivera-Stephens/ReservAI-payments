const PaymentHistory = require('../../models/paymentHistory');
const { loadStripeFixture } = require('../helpers/stripeFixtures');

describe('PaymentHistory model', () => {
  it('constructor and toJSON', () => {
    const ph = new PaymentHistory('id-1', 'sub_1', 'in_1', 'paid', 99.9, 'https://pdf', new Date());
    const json = ph.toJSON();
    expect(json.stripe_subscription_id).toBe('sub_1');
    expect(json.stripe_invoice_id).toBe('in_1');
    expect(json.amount).toBe(99.9);
  });

  it('fromStripeInvoice uses amount_paid and subscription', () => {
    const event = loadStripeFixture('invoice.payment_succeeded');
    const ph = PaymentHistory.fromStripeInvoice(event.data.object);
    expect(ph.stripe_invoice_id).toBe('in_test123');
    expect(ph.stripe_subscription_id).toBe('sub_test123');
    expect(ph.amount).toBe(999);
    expect(ph.status).toBe('paid');
  });

  it('fromStripeInvoice uses amount_due when unpaid', () => {
    const event = loadStripeFixture('invoice.payment_failed');
    const ph = PaymentHistory.fromStripeInvoice(event.data.object);
    expect(ph.amount).toBe(999);
    expect(ph.status).toBe('open');
  });
});
