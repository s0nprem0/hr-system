import request from 'supertest'

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000'

// Helper: retry transient connection failures (ECONNREFUSED) a few times
async function sendWithRetry(fn: () => any, retries = 3) {
	const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000'

	// Helper: retry transient connection failures (ECONNREFUSED) a few times
	async function sendWithRetry(fn: () => any, retries = 3) {
		try {
			return await fn()
		} catch (err: any) {
			if (
				retries > 0 &&
				err &&
				(err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED'))
			) {
				await new Promise((r) => setTimeout(r, 200))
				return sendWithRetry(fn, retries - 1)
			}
			throw err
		}
	}

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

			// Use refresh to get new tokens (include CSRF token)
			// extract csrf token from Set-Cookie as well
			let csrfToken: string | undefined
			if (sc1 && Array.isArray(sc1)) {
				for (const c of sc1) {
					const m = c.match(/csrfToken=([^;]+);/)
					if (m) csrfToken = m[1]
				}
			}
			let req = request(BASE)
				.post('/api/auth/refresh')
				.set('Cookie', `refreshToken=${oldRefresh}; csrfToken=${csrfToken}`)
			if (csrfToken) req = req.set('x-csrf-token', csrfToken)
			const r1 = await req
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

			// Attempt to reuse old refresh token should fail (include rotated csrf)
			let rotatedCsrf: string | undefined
			if (sc2 && Array.isArray(sc2)) {
				for (const c of sc2) {
					const m = c.match(/csrfToken=([^;]+);/)
					if (m) rotatedCsrf = m[1]
				}
			}
			let r2req = request(BASE)
				.post('/api/auth/refresh')
				.set('Cookie', `refreshToken=${oldRefresh}; csrfToken=${rotatedCsrf}`)
			if (rotatedCsrf) r2req = r2req.set('x-csrf-token', rotatedCsrf)
			const r2 = await r2req
			expect(r2.status).toBeGreaterThanOrEqual(400)
			expect(r2.body?.success).toBe(false)
		})

		it('logout revokes the refresh token', async () => {
			// Prefer seeded refresh token to avoid repeated login requests
			let csrfToken2: string | undefined
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
							if (m) {
								const m2 = sc.find((s: string) => /csrfToken=([^;]+);/.test(s))
								if (m2) {
									const mm = m2.match(/csrfToken=([^;]+);/)
									if (mm) csrfToken2 = mm[1]
								}
								return m[1]
							}
						}
					}
					return undefined
				})())
			expect(refreshToken).toBeTruthy()

			// Logout should revoke the token
			const doLogout = () => {
				let r = request(BASE)
					.post('/api/auth/logout')
					.set(
						'Cookie',
						`refreshToken=${refreshToken}; csrfToken=${csrfToken2}`
					)
				if (csrfToken2) r = r.set('x-csrf-token', csrfToken2)
				return r
			}
			const logoutRes = await sendWithRetry(doLogout)
			expect(logoutRes.status).toBe(200)
			expect(logoutRes.body?.success).toBe(true)

			// Using the revoked token should fail
			const doCheck = () => {
				let r = request(BASE)
					.post('/api/auth/refresh')
					.set(
						'Cookie',
						`refreshToken=${refreshToken}; csrfToken=${csrfToken2}`
					)
				if (csrfToken2) r = r.set('x-csrf-token', csrfToken2)
				return r
			}
			const r = await sendWithRetry(doCheck)
			expect(r.status).toBeGreaterThanOrEqual(400)
			expect(r.body?.success).toBe(false)
		})
	})
}
