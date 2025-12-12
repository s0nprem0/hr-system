import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (login)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the deprecated X-RateLimit-* headers
  message: { success: false, error: 'Too many login attempts, please try again later.' },
});

export default loginRateLimiter;
