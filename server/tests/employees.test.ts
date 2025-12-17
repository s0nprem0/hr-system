import request from 'supertest';

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Employees CRUD', () => {
  let adminToken: string;
  let empId: string;

  beforeAll(async () => {
    adminToken = process.env.ADMIN_TOKEN || (await (async () => {
      const login = await request(BASE).post('/api/auth/login').set('x-skip-rate-limit','1').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
      expect(login.status).toBe(200);
      return login.body?.data?.token;
    })());
  });

  it('creates an employee (admin)', async () => {
    const payload = { name: 'Test Employee', email: `emp-${Date.now()}@example.com`, password: 'password123', role: 'employee' };
    const res = await request(BASE).post('/api/employees').set('Authorization', `Bearer ${adminToken}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    empId = res.body?.data?._id;
    expect(empId).toBeTruthy();
  });

  it('gets employee by id', async () => {
    const res = await request(BASE).get(`/api/employees/${empId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body?.data?._id).toBe(empId);
  });

  it('updates employee', async () => {
    const res = await request(BASE).put(`/api/employees/${empId}`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body?.data?.name).toBe('Updated Name');
  });

  it('deletes employee', async () => {
    const res = await request(BASE).delete(`/api/employees/${empId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const r2 = await request(BASE).get(`/api/employees/${empId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(r2.status).toBe(404);
  });
});
