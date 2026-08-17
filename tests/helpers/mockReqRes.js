function createMockRes() {
  const res = {
    statusCode: 200,
    headersSent: false,
    _json: null,
    _body: null,
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    setHeader: jest.fn(),
    getHeader: jest.fn(),
  };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload) => {
    res._json = payload;
    res.headersSent = true;
    return res;
  });
  res.send = jest.fn((body) => {
    res._body = body;
    res.headersSent = true;
    return res;
  });
  return res;
}

function createMockReq(overrides = {}) {
  const headers = { ...(overrides.headers || {}) };
  const req = {
    headers,
    cookies: { ...(overrides.cookies || {}) },
    body: overrides.body !== undefined ? overrides.body : {},
    query: { ...(overrides.query || {}) },
    params: { ...(overrides.params || {}) },
    path: overrides.path || '/',
    url: overrides.url || '/',
    originalUrl: overrides.originalUrl || overrides.url || '/',
    method: overrides.method || 'GET',
    socket: { remoteAddress: overrides.remoteAddress || '127.0.0.1', ...(overrides.socket || {}) },
    ip: overrides.ip || '127.0.0.1',
    get: jest.fn((name) => {
      const key = String(name).toLowerCase();
      return headers[key] ?? headers[name];
    }),
    ...overrides,
    headers,
  };
  return req;
}

function createMockNext() {
  return jest.fn();
}

module.exports = { createMockReq, createMockRes, createMockNext };
