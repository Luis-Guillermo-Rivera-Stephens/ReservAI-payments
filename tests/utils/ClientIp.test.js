const { getClientIp, isValidIp, stripIpv6Mapped } = require('../../utils/ClientIp');
const { createMockReq } = require('../helpers/mockReqRes');

describe('ClientIp', () => {
  it('stripIpv6Mapped handles ::ffff:', () => {
    expect(stripIpv6Mapped('::ffff:192.168.1.1')).toBe('192.168.1.1');
  });

  it('isValidIp accepts IPv4', () => {
    expect(isValidIp('10.0.0.5')).toBe(true);
  });

  it('without proxyVerified ignores X-Forwarded-For', () => {
    const req = createMockReq({
      headers: { 'x-forwarded-for': '203.0.113.50' },
      remoteAddress: '127.0.0.1',
      ip: '127.0.0.1',
    });
    expect(getClientIp(req)).toBe('127.0.0.1');
  });

  it('with proxyVerified uses X-Forwarded-For', () => {
    const req = createMockReq({
      proxyVerified: true,
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
      remoteAddress: '127.0.0.1',
    });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('with proxyVerified prefers valid x-real-ip', () => {
    const req = createMockReq({
      proxyVerified: true,
      headers: { 'x-real-ip': '198.51.100.2' },
      remoteAddress: '127.0.0.1',
    });
    expect(getClientIp(req)).toBe('198.51.100.2');
  });
});
