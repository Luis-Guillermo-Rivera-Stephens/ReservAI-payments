const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../../views');
const viewFiles = fs.readdirSync(viewsDir).filter((f) => f.endsWith('.js'));

const minimalSubscriptionData = {
  plan_name: 'Plan Premium',
  amount: 99900,
  current_period_start: 1700000000,
  current_period_end: 1702678400,
  status: 'active',
};

const minimalInvoiceData = {
  amount_paid: 99900,
  amount_due: 99900,
  invoice_pdf: 'https://example.com/inv.pdf',
  hosted_invoice_url: 'https://example.com/inv',
  period_start: 1700000000,
  period_end: 1702678400,
  number: 'INV-1',
  currency: 'usd',
  next_payment_attempt: 1700100000,
};

describe('email views', () => {
  viewFiles.forEach((file) => {
    const View = require(path.join(viewsDir, file));
    const name = file.replace('.js', '');

    it(`${name}.getMessage does not throw with minimal data`, () => {
      const isInvoice = name.startsWith('Payment');
      const data = isInvoice ? minimalInvoiceData : minimalSubscriptionData;
      expect(() => View.getMessage('Usuario Test', data)).not.toThrow();
    });

    it(`${name}.getMessage returns non-empty content`, () => {
      const isInvoice = name.startsWith('Payment');
      const data = isInvoice ? minimalInvoiceData : minimalSubscriptionData;
      const msg = View.getMessage('Usuario Test', data);
      expect(msg).toBeDefined();
      expect(typeof msg.subject).toBe('string');
      expect(msg.subject.length).toBeGreaterThan(0);
      expect(typeof msg.content).toBe('string');
      expect(msg.content.trim().length).toBeGreaterThan(0);
      expect(typeof msg.text_content).toBe('string');
      expect(msg.text_content.trim().length).toBeGreaterThan(0);
    });
  });
});
