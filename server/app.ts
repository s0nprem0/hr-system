import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import employeesRouter from './routes/employees';
import departmentsRouter from './routes/departments';
import payrollRouter from './routes/payroll';
import auditsRouter from './routes/audits';
import errorHandler from './middleware/errorHandler';


export default function createApp() {
  const app = express();

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(
    cors({
      origin: clientUrl,
    }),
  );

  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/employees', employeesRouter);
  app.use('/api/departments', departmentsRouter);
  app.use('/api/payroll', payrollRouter);
  app.use('/api/audits', auditsRouter);

  app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const mem = process.memoryUsage();
    const mongoState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatus = mongoState === 1 ? 'connected' : mongoState === 2 ? 'connecting' : mongoState === 3 ? 'disconnecting' : 'disconnected';

    const ok = mongoState === 1;
    const statusCode = ok ? 200 : 503;

    return res.status(statusCode).json({
      status: ok ? 'ok' : 'degraded',
      uptime,
      memory: { rss: mem.rss, heapTotal: mem.heapTotal, heapUsed: mem.heapUsed },
      db: { state: mongoState, status: dbStatus },
    });
  });

  // centralized error handler
  app.use(errorHandler);

  return app;
}
