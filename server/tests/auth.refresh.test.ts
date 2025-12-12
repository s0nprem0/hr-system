import request from 'supertest';

// These tests expect the server to be running (e.g., `npm run dev`)
const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Auth refresh flow (integration)', () => {
  it('returns a new access token when provided a valid refresh token', async () => {
    // Use seeded admin credentials (userSeed creates admin@gmail.com by default)
    const loginRes = await request(BASE).post('/api/auth/login').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body?.success).toBe(true);
    const refreshToken = loginRes.body?.data?.refreshToken;
    expect(refreshToken).toBeTruthy();

    const refreshRes = await request(BASE).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body?.success).toBe(true);
    expect(refreshRes.body?.data?.token).toBeTruthy();
  });
});
