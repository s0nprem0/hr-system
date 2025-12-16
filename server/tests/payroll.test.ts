import request from 'supertest';

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Payroll flows', () => {
  let adminToken: string;
  let hrCreds = { email: `hr-${Date.now()}@example.com`, password: 'hrpass123' };
  let hrToken: string;
  let employeeId: string;

  beforeAll(async () => {
    const login = await request(BASE).post('/api/auth/login').send({ email: process.env.ADMIN_EMAIL || 'admin@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(login.status).toBe(200);
    adminToken = login.body?.data?.token;

    // create an HR user
    const createHr = await request(BASE).post('/api/employees').set('Authorization', `Bearer ${adminToken}`).send({ name: 'HR User', email: hrCreds.email, password: hrCreds.password, role: 'hr' });
    expect(createHr.status).toBe(201);

    // create a normal employee to receive payroll
    const createEmp = await request(BASE).post('/api/employees').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Payroll Emp', email: `pay-${Date.now()}@example.com`, password: 'emppass', role: 'employee' });
    expect(createEmp.status).toBe(201);
    employeeId = createEmp.body?.data?._id;

    // login as HR
    const hrLogin = await request(BASE).post('/api/auth/login').send({ email: hrCreds.email, password: hrCreds.password });
    expect(hrLogin.status).toBe(200);
    hrToken = hrLogin.body?.data?.token;
  });

  it('allows HR to create payroll for an employee', async () => {
    const res = await request(BASE).post('/api/payroll').set('Authorization', `Bearer ${hrToken}`).send({ employeeId, amount: 1500 });
    expect(res.status).toBe(201);
    expect(res.body?.data?.amount).toBe(1500);
    expect(res.body?.data?.employee?._id).toBe(employeeId);
  });

  it('lists payroll entries and filters by employeeId', async () => {
    const res = await request(BASE).get(`/api/payroll`).set('Authorization', `Bearer ${hrToken}`).query({ employeeId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data?.items)).toBe(true);
    expect(res.body?.data?.items.length).toBeGreaterThanOrEqual(1);
  });
});
