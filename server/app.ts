import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import employeesRouter from './routes/employees';
import departmentsRouter from './routes/departments';
import payrollRouter from './routes/payroll';
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

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // centralized error handler
  app.use(errorHandler);

  return app;
}
