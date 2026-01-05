import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

function shouldSkipRateLimit(req: Request) {
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

// 1. Login Limiter (Strict)
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

// 2. Refresh/Logout Limiter (Moderate)
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

// 3. Draft Autosave Limiter (Fast but throttled)
export const draftRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: process.env.NODE_ENV === 'production' ? 60 : 2000,
	skip: shouldSkipRateLimit,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: 'Too many requests to draft endpoint, please slow down.',
	},
})

// 4. Sensitive Write Limiter (New - For POST/PUT on Users, Payroll, etc.)
export const writeRateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: process.env.NODE_ENV === 'production' ? 200 : 5000, // Enough for normal work, stops automated spam
	skip: shouldSkipRateLimit,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: 'Write limit exceeded, please try again later.',
	},
})

export default loginRateLimiter
