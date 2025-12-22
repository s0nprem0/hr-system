import request from 'supertest'

// These tests expect the server to be running (e.g., `npm run dev`)
const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000'

describe('Auth refresh flow (integration)', () => {
	it('returns a new access token when provided a valid refresh token', async () => {
		// Prefer a seeded refresh token set by test setup to avoid repeated login attempts
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
				// Extract refresh token from Set-Cookie header (cookie-based flow)
				const sc = loginRes.headers['set-cookie']
				if (sc && Array.isArray(sc)) {
					for (const c of sc) {
						const m = c.match(/refreshToken=([^;]+);/)
						if (m) return m[1]
					}
				}
				return undefined
			})())
		expect(refreshToken).toBeTruthy()

		const refreshRes = await request(BASE)
			.post('/api/auth/refresh')
			.set('Cookie', `refreshToken=${refreshToken}`)
		expect(refreshRes.status).toBe(200)
		expect(refreshRes.body?.success).toBe(true)
		expect(refreshRes.body?.data?.token).toBeTruthy()
	})
})
