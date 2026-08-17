const AccountManager = require('../../utils/AccountManager');

describe('AccountManager', () => {
  it('accountExistsByID returns account row', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 'acc-1', type: 'client' }] }),
    };
    const result = await AccountManager.accountExistsByID('acc-1', db);
    expect(result.exists).toBe(true);
    expect(result.account.id).toBe('acc-1');
  });
});
