const CustomersManager = require('../../utils/CustomersManager');

describe('CustomersManager', () => {
  const db = { query: jest.fn() };

  beforeEach(() => {
    db.query.mockReset();
  });

  it('customerExistByID returns exists flag', async () => {
    db.query.mockResolvedValue({ rows: [{ stripe_customer_id: 'cus_1' }] });
    const result = await CustomersManager.customerExistByID('acc-1', db);
    expect(result.exists).toBe(true);
    expect(result.customer.stripe_customer_id).toBe('cus_1');
  });

  it('createCustomerInStripe calls stripe API', async () => {
    const stripe = {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_new' }),
      },
    };
    const result = await CustomersManager.createCustomerInStripe('acc-1', 'u@example.com', 'User', stripe);
    expect(result.success).toBe(true);
    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ user_id: 'acc-1' }) })
    );
  });

  it('createPortalSession returns session', async () => {
    const stripe = {
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: 'https://portal' }),
        },
      },
    };
    const result = await CustomersManager.createPortalSession('cus_1', stripe);
    expect(result.success).toBe(true);
    expect(result.session.url).toBe('https://portal');
  });
});
