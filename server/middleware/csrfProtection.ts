import type { Request, Response, NextFunction } from 'express'

export default function csrfProtection() {
	const originsEnv = process.env.CLIENT_URLS || process.env.CLIENT_URL || ''
	const allowedOrigins = originsEnv
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)

	// If no client origins configured, include a safe default used by the
	// local development client. This prevents accidental rejection of same-origin
	// requests during local runs where env vars may be absent.
	if (allowedOrigins.length === 0) {
		const fallback = process.env.CLIENT_URL || 'http://localhost:5173'
		allowedOrigins.push(fallback)
	}

	return function (req: Request, res: Response, next: NextFunction) {
		// Safe methods don't require CSRF checks
		if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()

		// Double-submit: prefer explicit header+cookie match
		const csrfHeader = (req.headers['x-csrf-token'] || '') as string
		const cookies = req.cookies as Record<string, unknown> | undefined
		const csrfCookie = (cookies?.csrfToken as string | undefined) || undefined
		if (csrfHeader && csrfCookie && csrfHeader === csrfCookie) return next()

		// Fallback: verify Origin or Referer matches configured client origins
		const origin = (req.headers.origin || '') as string
		if (origin && allowedOrigins.includes(origin)) return next()

		const referer = (req.headers.referer || '') as string
		if (referer) {
			try {
				const url = new URL(referer)
				if (allowedOrigins.includes(url.origin)) return next()
			} catch {
				// ignore parse errors
			}
		}

		return res
			.status(403)
			.json({ success: false, error: 'CSRF token missing or invalid' })
	}
}
