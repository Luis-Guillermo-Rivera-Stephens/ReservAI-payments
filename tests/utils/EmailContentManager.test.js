const EmailContentManager = require('../../utils/EmailContentManager');

describe('EmailContentManager', () => {
  const subscriptionData = {
    plan_name: 'Plan Premium',
    amount: 99900,
    current_period_start: 1700000000,
    current_period_end: 1702678400,
    status: 'active',
  };

  it('returns content for subscription.created', async () => {
    const content = await EmailContentManager.getEmailContent(
      'User',
      'customer.subscription.created',
      subscriptionData
    );
    expect(content.subject).toBeTruthy();
  });

  it('returns null for unknown event', async () => {
    const content = await EmailContentManager.getEmailContent('User', 'unknown.event', {});
    expect(content).toBeNull();
  });
});
