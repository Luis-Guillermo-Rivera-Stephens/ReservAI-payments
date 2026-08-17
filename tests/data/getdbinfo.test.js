const getdbinfo = require('../../data/getdbinfo');

describe('getdbinfo', () => {
  it('builds connection URL from env vars', async () => {
    const url = await getdbinfo();
    expect(url).toContain('postgresql://');
    expect(url).toContain(process.env.DB_HOST);
    expect(url).toContain(process.env.DB_NAME);
  });

  it('uses DATABASE_URL when set', async () => {
    const prev = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://u:p@host/db';
    try {
      const url = await getdbinfo();
      expect(url).toBe('postgresql://u:p@host/db');
    } finally {
      if (prev === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = prev;
    }
  });
});
