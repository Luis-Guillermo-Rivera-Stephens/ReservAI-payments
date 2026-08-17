jest.mock('../../data/connectDB');
jest.mock('../../utils/CustomersManager');
jest.mock('../../utils/SubscriptionManager');
jest.mock('../../utils/PaymentHistoryManager');
jest.mock('../../utils/EmailContentManager');
jest.mock('../../utils/EmailManager');

const { connectDB } = require('../../data/connectDB');
const CustomersManager = require('../../utils/CustomersManager');
const SubscriptionManager = require('../../utils/SubscriptionManager');
const PaymentHistoryManager = require('../../utils/PaymentHistoryManager');
const EmailContentManager = require('../../utils/EmailContentManager');
const EmailManager = require('../../utils/EmailManager');
const WebhooksRouter = require('../../handlers/WebhooksRouter');
const { loadStripeFixture } = require('../helpers/stripeFixtures');
const { createMockReq, createMockRes } = require('../helpers/mockReqRes');

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe('WebhooksRouter', () => {
  const db = {};

  beforeEach(() => {
    connectDB.mockResolvedValue(db);
    CustomersManager.createCustomerInDB.mockResolvedValue({ success: true });
    CustomersManager.getCustomersEmailAndName.mockResolvedValue({
      success: true,
      email: 'u@example.com',
      name: 'User',
    });
    SubscriptionManager.createSubscriptionInDB.mockResolvedValue({ success: true });
    SubscriptionManager.updateSubscriptionInDB.mockResolvedValue({ success: true });
    SubscriptionManager.updateSubscriptionOnCancellation.mockResolvedValue({ success: true });
    SubscriptionManager.updateSubscriptionOnPaymentSuccess.mockResolvedValue({ success: true });
    SubscriptionManager.updateSubscriptionOnPaymentFailed.mockResolvedValue({ success: true });
    PaymentHistoryManager.createPaymentHistoryInDB.mockResolvedValue({ success: true });
    EmailContentManager.getEmailContent.mockResolvedValue({
      subject: 'Subj',
      content: '<p>Hi</p>',
      text_content: 'Hi',
    });
    EmailManager.sendEmailToCustomer.mockResolvedValue({ success: true });
  });

  async function runWebhook(fixtureName) {
    const event = loadStripeFixture(fixtureName);
    const req = createMockReq({ event });
    const res = createMockRes();
    await WebhooksRouter(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json).toEqual({ received: true });
    await flushAsync();
    await flushAsync();
    return { req, res };
  }

  it('customer.created persists customer without email', async () => {
    await runWebhook('customer.created');
    expect(CustomersManager.createCustomerInDB).toHaveBeenCalled();
    expect(EmailManager.sendEmailToCustomer).not.toHaveBeenCalled();
  });

  it('customer.subscription.created creates subscription and sends email', async () => {
    await runWebhook('customer.subscription.created');
    expect(SubscriptionManager.createSubscriptionInDB).toHaveBeenCalled();
    expect(EmailManager.sendEmailToCustomer).toHaveBeenCalled();
  });

  it('customer.subscription.updated with cancellation updates DB', async () => {
    await runWebhook('customer.subscription.updated');
    expect(SubscriptionManager.updateSubscriptionInDB).toHaveBeenCalled();
  });

  it('customer.subscription.updated.reactivate updates DB', async () => {
    await runWebhook('customer.subscription.updated.reactivate');
    expect(SubscriptionManager.updateSubscriptionInDB).toHaveBeenCalled();
  });

  it('customer.subscription.updated.noop does not update DB', async () => {
    await runWebhook('customer.subscription.updated.noop');
    expect(SubscriptionManager.updateSubscriptionInDB).not.toHaveBeenCalled();
  });

  it('customer.subscription.deleted cancels subscription', async () => {
    await runWebhook('customer.subscription.deleted');
    expect(SubscriptionManager.updateSubscriptionOnCancellation).toHaveBeenCalled();
    expect(EmailManager.sendEmailToCustomer).toHaveBeenCalled();
  });

  it('invoice.payment_succeeded updates subscription and payment history', async () => {
    await runWebhook('invoice.payment_succeeded');
    expect(SubscriptionManager.updateSubscriptionOnPaymentSuccess).toHaveBeenCalled();
    expect(PaymentHistoryManager.createPaymentHistoryInDB).toHaveBeenCalled();
    expect(EmailManager.sendEmailToCustomer).toHaveBeenCalled();
  });

  it('invoice.payment_failed marks unpaid and records history', async () => {
    await runWebhook('invoice.payment_failed');
    expect(SubscriptionManager.updateSubscriptionOnPaymentFailed).toHaveBeenCalled();
    expect(PaymentHistoryManager.createPaymentHistoryInDB).toHaveBeenCalled();
  });

  it('unknown event still responds 200 immediately', async () => {
    await runWebhook('unknown.event');
    expect(SubscriptionManager.createSubscriptionInDB).not.toHaveBeenCalled();
  });

  it('DB connect failure still responds 200', async () => {
    connectDB.mockRejectedValueOnce(new Error('db down'));
    const event = loadStripeFixture('customer.created');
    const res = createMockRes();
    await WebhooksRouter(createMockReq({ event }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json.received).toBe(true);
    await flushAsync();
    expect(CustomersManager.createCustomerInDB).not.toHaveBeenCalled();
  });

  it('email failure still responded 200 first', async () => {
    EmailManager.sendEmailToCustomer.mockResolvedValue({ success: false, error: 'smtp' });
    const res = createMockRes();
    const event = loadStripeFixture('customer.subscription.created');
    await WebhooksRouter(createMockReq({ event }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json).toEqual({ received: true });
    await flushAsync();
    await flushAsync();
    expect(EmailManager.sendEmailToCustomer).toHaveBeenCalled();
  });
});
