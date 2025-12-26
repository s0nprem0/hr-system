import request from 'supertest'

// These tests expect the server to be running (e.g., `npm run dev`)
const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000'

describe('Auth refresh flow (integration)', () => {
	it('returns a new access token when provided a valid refresh token', async () => {
		// Prefer a seeded refresh token set by test setup to avoid repeated login attempts
		let csrfToken: string | undefined
		let refreshTokenCandidate: string | undefined
		const refreshToken =
			process.env.ADMIN_REFRESH ||
			(await (async () => {
				const loginRes = await request(BASE)
					.post('/api/auth/login')
					.set('x-skip-rate-limit', '1')
					.send({
						email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
						password: process.env.ADMIN_PASSWORD || 'admin123',
					})
				expect(loginRes.status).toBe(200)
				// Extract refresh token and csrf token from Set-Cookie header (cookie-based flow)
				const sc: string[] = Array.isArray(loginRes.headers['set-cookie'])
					? loginRes.headers['set-cookie']
					: []
				if (sc && Array.isArray(sc)) {
					const map: Record<string, string> = {}
					for (const c of sc) {
						if (!c) continue
						const kv = c.split(';')[0]
						if (!kv) continue
						const parts = kv.split('=')
						const rawName = parts[0] ?? ''
						const rest = parts.slice(1)
						const name = rawName.trim()
						if (!name || rest.length === 0) continue
						const val = rest.join('=').trim()
						map[name] = val
					}
					if (map.refreshToken) refreshTokenCandidate = map.refreshToken
					if (map.csrfToken) csrfToken = map.csrfToken
					if (refreshTokenCandidate) return refreshTokenCandidate
				}
				return undefined
			})())
		expect(refreshToken).toBeTruthy()

		let req = request(BASE)
			.post('/api/auth/refresh')
			.set('Cookie', `refreshToken=${refreshToken}; csrfToken=${csrfToken}`)
		if (csrfToken) req = req.set('x-csrf-token', csrfToken)
		const refreshRes = await req
		expect(refreshRes.status).toBe(200)
		expect(refreshRes.body?.success).toBe(true)
		expect(refreshRes.body?.data?.token).toBeTruthy()
	})
})
