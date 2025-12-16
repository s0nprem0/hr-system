import request from 'supertest';

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Departments CRUD', () => {
  let adminToken: string;
  let deptId: string;

  beforeAll(async () => {
    const login = await request(BASE).post('/api/auth/login').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(login.status).toBe(200);
    adminToken = login.body?.data?.token;
  });

  it('creates a department', async () => {
    const res = await request(BASE).post('/api/departments').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Engineering', description: 'Eng team' });
    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    deptId = res.body?.data?._id;
    expect(deptId).toBeTruthy();
  });

  it('lists departments', async () => {
    const res = await request(BASE).get('/api/departments').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const items = res.body?.data?.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items.find((d: any) => d._id === deptId)).toBeTruthy();
  });

  it('gets department by id', async () => {
    const res = await request(BASE).get(`/api/departments/${deptId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body?.data?._id).toBe(deptId);
  });

  it('updates department', async () => {
    const res = await request(BASE).put(`/api/departments/${deptId}`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'Engineering Updated' });
    expect(res.status).toBe(200);
    expect(res.body?.data?.name).toBe('Engineering Updated');
  });

  it('deletes department', async () => {
    const res = await request(BASE).delete(`/api/departments/${deptId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // subsequent get should 404
    const r2 = await request(BASE).get(`/api/departments/${deptId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(r2.status).toBe(404);
  });
});
