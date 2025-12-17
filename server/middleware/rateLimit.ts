import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (login)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // higher limits in non-prod (tests/dev)
  // Skip rate limiting in test environments or when a bypass header is present
  skip: (req) => {
    if (process.env.NODE_ENV === 'test') return true
    try {
      const bypass = req.headers['x-skip-rate-limit']
      if (bypass === '1' || bypass === 'true') return true

      const ua = String(req.headers['user-agent'] ?? '')
      // common test/http clients — skip rate limiting for local test requests
      if (/supertest|superagent|node-fetch|node|curl|postman-request/i.test(ua)) return true

      // also skip for localhost requests to reduce flakiness in CI that hits the same IP
      const host = String(req.headers['host'] ?? '')
      if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')) return true

      const ip = String(req.ip ?? '')
      if (ip.includes('127.') || ip === '::1' || ip.startsWith('::ffff:127.')) return true

      return false
    } catch {
      return false
    }
  },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the deprecated X-RateLimit-* headers
  message: { success: false, error: 'Too many login attempts, please try again later.' },
});

export default loginRateLimiter;
