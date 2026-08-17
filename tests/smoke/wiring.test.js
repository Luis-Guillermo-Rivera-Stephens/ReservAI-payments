jest.mock('../../data/connectDB', () => ({
  connectDB: jest.fn(async () => ({ query: jest.fn(), close: jest.fn() })),
  getDB: jest.fn(),
  getDBInstance: jest.fn(),
}));

const { getClientIp } = require('../../utils/ClientIp');
const {
  helmetOptions,
  corsOptions,
  limiterOptions,
  rateLimitKey,
} = require('../../server');

describe('wiring: server security config', () => {
  test('helmetOptions incluye CSP, HSTS, noSniff y referrerPolicy', () => {
    expect(helmetOptions.contentSecurityPolicy).toBeDefined();
    expect(helmetOptions.hsts).toMatchObject({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    });
    expect(helmetOptions.noSniff).toBe(true);
    expect(helmetOptions.referrerPolicy).toEqual({ policy: 'same-origin' });
  });

  test('corsOptions credentials y Authorization', () => {
    expect(corsOptions.credentials).toBeTruthy();
    expect(corsOptions.allowedHeaders).toContain('Authorization');
    expect(corsOptions.origin).toBeDefined();
  });

  test('limiterOptions lee env y desactiva validación x-forwarded-for', () => {
    expect(limiterOptions.max).toBe(Number(process.env.RATE_LIMIT_MAX_REQUESTS));
    expect(limiterOptions.windowMs).toBe(Number(process.env.RATE_LIMIT_WINDOW_MS));
    expect(limiterOptions.validate.xForwardedForHeader).toBe(false);
    expect(limiterOptions.keyGenerator).toBe(rateLimitKey);
  });

  test('rateLimitKey usa ClientIp (anti-spoof sin proxyVerified)', () => {
    const spoofed = {
      headers: { 'x-forwarded-for': '1.2.3.4' },
      socket: { remoteAddress: '10.0.0.9' },
      proxyVerified: false,
    };
    expect(rateLimitKey(spoofed)).toBe(getClientIp(spoofed));
    expect(rateLimitKey(spoofed)).toBe('10.0.0.9');
  });

  test('createApp fija trust proxy = 1', () => {
    const { createApp } = require('../../server');
    const app = createApp({ applyLimiter: false });
    expect(app.get('trust proxy')).toBe(1);
  });
});
