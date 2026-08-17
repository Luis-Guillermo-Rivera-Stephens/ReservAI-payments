jest.mock('../../instrument-sentry', () => ({
  withScope: (fn) => fn({ setTag: jest.fn(), setContext: jest.fn(), setUser: jest.fn() }),
  captureMessage: jest.fn(),
}));

const Sentry = require('../../instrument-sentry');
const { sentryHttp5xxCapture } = require('../../middlewares/SentryHttp5xxCapture');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('SentryHttp5xxCapture', () => {
  const prevDsn = process.env.SENTRY_DSN;

  afterEach(() => {
    process.env.SENTRY_DSN = prevDsn;
  });

  it('skips hook when SENTRY_DSN empty', () => {
    process.env.SENTRY_DSN = '';
    const req = createMockReq();
    const res = createMockRes();
    const sendBefore = res.send;
    const next = createMockNext();
    sentryHttp5xxCapture(req, res, next);
    expect(res.send).toBe(sendBefore);
    expect(next).toHaveBeenCalled();
  });

  it('captures message on 500 response', () => {
    process.env.SENTRY_DSN = 'https://example@sentry.io/1';
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();
    sentryHttp5xxCapture(req, res, next);
    res.statusCode = 500;
    res.send(JSON.stringify({ error: 'fail' }));
    expect(Sentry.captureMessage).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
