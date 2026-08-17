const VerifyCsrfOrigin = require('../../middlewares/VerifyCsrfOrigin');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');

describe('VerifyCsrfOrigin', () => {
  const prevOrigin = process.env.CORS_ORIGIN;

  beforeEach(() => {
    process.env.CORS_ORIGIN = 'http://localhost:3000';
  });

  afterEach(() => {
    if (prevOrigin === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prevOrigin;
  });

  test('POST JSON + Origin bueno llama next', () => {
    const req = createMockReq({
      method: 'POST',
      originalUrl: '/api/customer',
      path: '/customer',
      headers: {
        origin: 'http://localhost:3000',
        'content-type': 'application/json',
      },
    });
    const next = createMockNext();
    VerifyCsrfOrigin(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('POST + Origin evil → 403 CSRF', () => {
    const req = createMockReq({
      method: 'POST',
      originalUrl: '/api/customer',
      headers: {
        origin: 'https://evil.reservai.com.mx',
        'content-type': 'application/json',
      },
    });
    const res = createMockRes();
    const next = createMockNext();
    VerifyCsrfOrigin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'CSRF validation failed' });
    expect(next).not.toHaveBeenCalled();
  });

  test('POST urlencoded → 415', () => {
    const req = createMockReq({
      method: 'POST',
      originalUrl: '/api/customer',
      headers: {
        origin: 'http://localhost:3000',
        'content-type': 'application/x-www-form-urlencoded',
      },
    });
    const res = createMockRes();
    const next = createMockNext();
    VerifyCsrfOrigin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(415);
    expect(next).not.toHaveBeenCalled();
  });

  test('GET /api/billing/portal sin header → 403', () => {
    const req = createMockReq({
      method: 'GET',
      originalUrl: '/api/billing/portal',
      path: '/portal',
    });
    const res = createMockRes();
    const next = createMockNext();
    VerifyCsrfOrigin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('GET /api/billing/portal con Content-Type json llama next', () => {
    const req = createMockReq({
      method: 'GET',
      originalUrl: '/api/billing/portal',
      headers: { 'content-type': 'application/json' },
    });
    const next = createMockNext();
    VerifyCsrfOrigin(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('GET /api/status sin header llama next', () => {
    const req = createMockReq({
      method: 'GET',
      originalUrl: '/api/status',
      path: '/status',
    });
    const next = createMockNext();
    VerifyCsrfOrigin(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('POST /webhooks/stripe sin Origin llama next', () => {
    const req = createMockReq({
      method: 'POST',
      originalUrl: '/webhooks/stripe',
      path: '/stripe',
      headers: { 'content-type': 'application/json' },
    });
    const next = createMockNext();
    VerifyCsrfOrigin(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test('OPTIONS no exige Origin', () => {
    const req = createMockReq({
      method: 'OPTIONS',
      originalUrl: '/api/customer',
    });
    const next = createMockNext();
    VerifyCsrfOrigin(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
