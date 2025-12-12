import type { Request, Response, NextFunction } from 'express';

// Centralized error handler middleware
import logger from '../logger';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the error using structured logger
  logger.error({ err, url: req.url, method: req.method }, 'Uncaught error');

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ success: false, error: message });
}
