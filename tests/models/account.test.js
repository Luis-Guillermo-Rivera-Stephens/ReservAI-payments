const Account = require('../../models/account');

describe('Account model', () => {
  it('uses explicit salt when provided', () => {
    const account = new Account(
      'id-1',
      'Test User',
      'test@example.com',
      'hash',
      new Date(),
      true,
      true,
      'client',
      false,
      'fixed-salt-hex'
    );
    expect(account.salt).toBe('fixed-salt-hex');
    const json = account.toJSON();
    expect(json.id).toBe('id-1');
    expect(json.type).toBe('client');
    expect(json.salt).toBe('fixed-salt-hex');
  });
});
