import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import createApp from '../app';
import http from 'http';
import User from '../models/User';
import bcrypt from 'bcryptjs';

let mongo: MongoMemoryServer | null = null;
let server: http.Server | null = null;

export default async function () {
  // Start in-memory mongo
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  // Seed an admin user for tests
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
  }

  // Start the app on an ephemeral port
  const app = createApp();
  server = http.createServer(app);
  await new Promise<void>((resolve) => { server!.listen(0, resolve); });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 5000;
  process.env.TEST_SERVER_URL = `http://127.0.0.1:${port}`;

  // teardown after all tests
  // @ts-ignore - Jest provides global afterAll
  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = null;
    }
    await mongoose.disconnect();
    if (mongo) {
      await mongo.stop();
      mongo = null;
    }
  });
}
