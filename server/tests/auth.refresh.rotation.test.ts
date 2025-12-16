import request from 'supertest';

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Refresh token rotation and logout', () => {
  it('rotates refresh token and invalidates old token', async () => {
    const loginRes = await request(BASE).post('/api/auth/login').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(loginRes.status).toBe(200);
    const oldRefresh = loginRes.body?.data?.refreshToken;
    expect(oldRefresh).toBeTruthy();

    // Use refresh to get new tokens
    const r1 = await request(BASE).post('/api/auth/refresh').send({ refreshToken: oldRefresh });
    expect(r1.status).toBe(200);
    const newRefresh = r1.body?.data?.refreshToken;
    expect(newRefresh).toBeTruthy();

    // Attempt to reuse old refresh token should fail
    const r2 = await request(BASE).post('/api/auth/refresh').send({ refreshToken: oldRefresh });
    expect(r2.status).toBeGreaterThanOrEqual(400);
    expect(r2.body?.success).toBe(false);
  });

  it('logout revokes the refresh token', async () => {
    const loginRes = await request(BASE).post('/api/auth/login').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(loginRes.status).toBe(200);
    const refreshToken = loginRes.body?.data?.refreshToken;
    expect(refreshToken).toBeTruthy();

    // Logout should revoke the token
    const logoutRes = await request(BASE).post('/api/auth/logout').send({ refreshToken });
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body?.success).toBe(true);

    // Using the revoked token should fail
    const r = await request(BASE).post('/api/auth/refresh').send({ refreshToken });
    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.body?.success).toBe(false);
  });
});
