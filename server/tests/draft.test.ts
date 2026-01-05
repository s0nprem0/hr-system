import request from 'supertest'

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000'

describe('Employee Drafts', () => {
	let adminToken: string
	beforeAll(async () => {
		adminToken =
			process.env.ADMIN_TOKEN ||
			(await (async () => {
				const login = await request(BASE)
					.post('/api/auth/login')
					.set('x-skip-rate-limit', '1')
					.send({
						email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
						password: process.env.ADMIN_PASSWORD || 'admin123',
					})
				expect(login.status).toBe(200)
				return login.body?.data?.token
			})())
	})

	it('rejects invalid salary', async () => {
		const res = await request(BASE)
			.post('/api/employees/draft')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ salary: 'not-a-number' })
		expect(res.status).toBe(400)
	})

	it('rejects invalid department id', async () => {
		const res = await request(BASE)
			.post('/api/employees/draft')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ department: '123' })
		expect(res.status).toBe(400)
	})

	it('rejects invalid email', async () => {
		const res = await request(BASE)
			.post('/api/employees/draft')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ email: 'not-an-email' })
		expect(res.status).toBe(400)
	})

	it('accepts valid draft and returns sanitized data', async () => {
		const payload = {
			firstName: 'Test',
			lastName: 'User',
			email: 'test.user@example.com',
			salary: '55000',
			jobTitle: 'Engineer',
		}
		const res = await request(BASE)
			.post('/api/employees/draft')
			.set('Authorization', `Bearer ${adminToken}`)
			.send(payload)
		expect(res.status).toBe(200)
		// now retrieve
		const g = await request(BASE)
			.get('/api/employees/draft')
			.set('Authorization', `Bearer ${adminToken}`)
		expect(g.status).toBe(200)
		expect(g.body?.data?.salary).toBe(55000)
		expect(g.body?.data?.firstName).toBe('Test')
	})
})
