import request from 'supertest'

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000'

describe('Refresh token rotation and logout', () => {
	it('rotates refresh token and invalidates old token', async () => {
		const loginRes = await request(BASE)
			.post('/api/auth/login')
			.set('x-skip-rate-limit', '1')
			.send({
				email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
				password: process.env.ADMIN_PASSWORD || 'admin123',
			})
		expect(loginRes.status).toBe(200)
		// extract refresh token from Set-Cookie
		const sc1 = loginRes.headers['set-cookie']
		let oldRefresh: string | undefined
		if (sc1 && Array.isArray(sc1)) {
			for (const c of sc1) {
				const m = c.match(/refreshToken=([^;]+);/)
				if (m) oldRefresh = m[1]
			}
		}
		expect(oldRefresh).toBeTruthy()

		// Use refresh to get new tokens
		const r1 = await request(BASE)
			.post('/api/auth/refresh')
			.set('Cookie', `refreshToken=${oldRefresh}`)
		expect(r1.status).toBe(200)
		// new refresh token is set in Set-Cookie on rotation
		const sc2 = r1.headers['set-cookie']
		let newRefresh: string | undefined
		if (sc2 && Array.isArray(sc2)) {
			for (const c of sc2) {
				const m = c.match(/refreshToken=([^;]+);/)
				if (m) newRefresh = m[1]
			}
		}
		expect(newRefresh).toBeTruthy()

		// Attempt to reuse old refresh token should fail
		const r2 = await request(BASE)
			.post('/api/auth/refresh')
			.set('Cookie', `refreshToken=${oldRefresh}`)
		expect(r2.status).toBeGreaterThanOrEqual(400)
		expect(r2.body?.success).toBe(false)
	})

	it('logout revokes the refresh token', async () => {
		// Prefer seeded refresh token to avoid repeated login requests
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

		// Logout should revoke the token
		const logoutRes = await request(BASE)
			.post('/api/auth/logout')
			.set('Cookie', `refreshToken=${refreshToken}`)
		expect(logoutRes.status).toBe(200)
		expect(logoutRes.body?.success).toBe(true)

		// Using the revoked token should fail
		const r = await request(BASE)
			.post('/api/auth/refresh')
			.set('Cookie', `refreshToken=${refreshToken}`)
		expect(r.status).toBeGreaterThanOrEqual(400)
		expect(r.body?.success).toBe(false)
	})
})
