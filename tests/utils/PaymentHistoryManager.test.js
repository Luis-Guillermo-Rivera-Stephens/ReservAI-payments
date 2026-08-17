const PaymentHistory = require('../../models/paymentHistory');
const PaymentHistoryManager = require('../../utils/PaymentHistoryManager');

describe('PaymentHistoryManager', () => {
  it('createPaymentHistoryInDB succeeds', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 'ph-1' }] }),
    };
    const ph = new PaymentHistory('id', 'sub', 'in', 'paid', 9.99, null, new Date());
    const result = await PaymentHistoryManager.createPaymentHistoryInDB(ph, db);
    expect(result.success).toBe(true);
    expect(db.query).toHaveBeenCalled();
  });
});
