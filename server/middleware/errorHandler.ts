import type { Request, Response, NextFunction } from 'express';

// Centralized error handler middleware
export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the error (stdout/stderr). For production consider using a structured logger.
  console.error('Uncaught error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ success: false, error: message });
}
