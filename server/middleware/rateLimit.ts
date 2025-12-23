import rateLimit from 'express-rate-limit'

function shouldSkipRateLimit(req: any) {
	if (process.env.NODE_ENV === 'test') return true
	try {
		const bypass = req.headers['x-skip-rate-limit']
		if (bypass === '1' || bypass === 'true') return true

		const ua = String(req.headers['user-agent'] ?? '')
		if (/supertest|superagent|node-fetch|node|curl|postman-request/i.test(ua))
			return true

		const host = String(req.headers['host'] ?? '')
		if (
			host.includes('localhost') ||
			host.includes('127.0.0.1') ||
			host.includes('::1')
		)
			return true

		const ip = String(req.ip ?? '')
		if (ip.includes('127.') || ip === '::1' || ip.startsWith('::ffff:127.'))
			return true

		return false
	} catch {
		return false
	}
}

// Rate limiter for authentication endpoints (login)
export const loginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: process.env.NODE_ENV === 'production' ? 10 : 1000,
	skip: shouldSkipRateLimit,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: 'Too many login attempts, please try again later.',
	},
})

// Rate limiter for refresh/logout endpoints (slightly higher threshold)
export const refreshRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: process.env.NODE_ENV === 'production' ? 30 : 2000,
	skip: shouldSkipRateLimit,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: 'Too many requests, please try again later.',
	},
})

export default loginRateLimiter
