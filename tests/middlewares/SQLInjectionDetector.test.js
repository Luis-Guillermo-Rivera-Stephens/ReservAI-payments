const SQLInjectionDetector = require('../../middlewares/SQLInjectionDetector');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');
const { SQLI_PAYLOADS, CLEAN_PAYLOADS } = require('../helpers/securityPayloads');

describe('SQLInjectionDetector', () => {
  it('analyzeInput flags union select', () => {
    const result = SQLInjectionDetector.analyzeInput(SQLI_PAYLOADS.unionSelect);
    expect(result.isSafe).toBe(false);
    expect(result.threats.length).toBeGreaterThan(0);
  });

  it('analyzeInput treats non-strings as safe', () => {
    expect(SQLInjectionDetector.analyzeInput(null).isSafe).toBe(true);
  });

  it('middleware rejects malicious body', () => {
    const mw = SQLInjectionDetector.middleware();
    const req = createMockReq({ body: { q: SQLI_PAYLOADS.dropTable } });
    const res = createMockRes();
    const next = createMockNext();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res._json.code).toBe('SECURITY_VIOLATION');
    expect(next).not.toHaveBeenCalled();
  });

  it('middleware rejects malicious query', () => {
    const mw = SQLInjectionDetector.middleware();
    const req = createMockReq({ query: { id: SQLI_PAYLOADS.alwaysTrue } });
    const res = createMockRes();
    const next = createMockNext();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('middleware allows clean body', () => {
    const mw = SQLInjectionDetector.middleware();
    const req = createMockReq({ body: CLEAN_PAYLOADS.body });
    const res = createMockRes();
    const next = createMockNext();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('middleware fail-open on internal error', () => {
    const mw = SQLInjectionDetector.middleware();
    const req = createMockReq();
    Object.defineProperty(req, 'body', {
      get() {
        throw new Error('boom');
      },
    });
    const next = createMockNext();
    mw(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
