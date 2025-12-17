import request from 'supertest';

// These tests expect the server to be running (e.g., `npm run dev`)
const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Auth refresh flow (integration)', () => {
  it('returns a new access token when provided a valid refresh token', async () => {
    // Prefer a seeded refresh token set by test setup to avoid repeated login attempts
    const refreshToken = process.env.ADMIN_REFRESH || (await (async () => {
      const loginRes = await request(BASE).post('/api/auth/login').set('x-skip-rate-limit','1').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
      expect(loginRes.status).toBe(200);
      return loginRes.body?.data?.refreshToken;
    })());
    expect(refreshToken).toBeTruthy();

    const refreshRes = await request(BASE).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body?.success).toBe(true);
    expect(refreshRes.body?.data?.token).toBeTruthy();
  });
});
