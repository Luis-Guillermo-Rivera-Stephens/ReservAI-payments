jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'msg-1' }),
  })),
}));

const nodemailer = require('nodemailer');
const EmailManager = require('../../utils/EmailManager');

describe('EmailManager', () => {
  it('sendEmailToCustomer succeeds with env configured', async () => {
    const result = await EmailManager.sendEmailToCustomer(
      'to@example.com',
      'Subject',
      '<p>Hi</p>',
      'Hi'
    );
    expect(result.success).toBe(true);
    expect(nodemailer.createTransport).toHaveBeenCalled();
  });
});
