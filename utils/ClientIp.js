/**
 * Resolución de IP de cliente detrás de nginx de confianza.
 * Solo usa X-Real-IP / X-Forwarded-For si VerifyProxySecret marcó la request.
 */

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
const IPV6_RE = /^[0-9a-fA-F:]+$/;

function stripIpv6Mapped(ip) {
  if (typeof ip !== 'string') return '';
  const trimmed = ip.trim();
  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice(7);
  }
  return trimmed;
}

function isValidIp(ip) {
  const value = stripIpv6Mapped(ip);
  if (!value || value.includes('/')) return false;
  if (IPV4_RE.test(value)) return true;
  if (value.includes(':') && IPV6_RE.test(value) && value.length <= 45) return true;
  return false;
}

function getClientIp(req) {
  if (req.proxyVerified) {
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      const candidate = stripIpv6Mapped(realIp.split(',')[0]);
      if (isValidIp(candidate)) {
        return candidate;
      }
    }

    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      const parts = xff
        .split(',')
        .map((p) => stripIpv6Mapped(p))
        .filter(isValidIp);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
  }

  const socketIp = stripIpv6Mapped(req.socket?.remoteAddress || '');
  if (isValidIp(socketIp)) {
    return socketIp;
  }

  const fallback = stripIpv6Mapped(typeof req.ip === 'string' ? req.ip : '');
  if (isValidIp(fallback)) {
    return fallback;
  }

  return 'unknown';
}

module.exports = { getClientIp, isValidIp, stripIpv6Mapped };
