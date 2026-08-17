const PathSecurityValidator = require('../../middlewares/PathSecurityValidator');
const { createMockReq, createMockRes, createMockNext } = require('../helpers/mockReqRes');
const { PATH_PAYLOADS, CLEAN_PAYLOADS } = require('../helpers/securityPayloads');

describe('PathSecurityValidator', () => {
  it('hasPathTraversal detects ../', () => {
    expect(PathSecurityValidator.hasPathTraversal(PATH_PAYLOADS.traversal)).toBe(true);
  });

  it('hasSensitiveExtension detects .env', () => {
    expect(PathSecurityValidator.hasSensitiveExtension(PATH_PAYLOADS.envFile)).toBe(true);
  });

  it('isPathSafe allows clean API path', () => {
    expect(PathSecurityValidator.isPathSafe(CLEAN_PAYLOADS.path)).toBe(true);
  });

  it('middleware returns 403 FORBIDDEN_RESOURCE for traversal URL', () => {
    const mw = PathSecurityValidator.middleware();
    const req = createMockReq({
      originalUrl: PATH_PAYLOADS.traversal,
      path: PATH_PAYLOADS.traversal,
    });
    const res = createMockRes();
    const next = createMockNext();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res._json.code).toBe('FORBIDDEN_RESOURCE');
    expect(next).not.toHaveBeenCalled();
  });

  it('middleware allows safe request', () => {
    const mw = PathSecurityValidator.middleware();
    const req = createMockReq({ originalUrl: '/api/portal', path: '/portal' });
    const next = createMockNext();
    mw(req, createMockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
