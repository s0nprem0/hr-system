import type { Request, Response, NextFunction } from 'express';

// Centralized error handler middleware
import logger from '../logger';
import { sendError } from '../utils/apiResponse';

export default function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Log the error using structured logger
  logger.error({ err, url: req.url, method: req.method }, 'Uncaught error');

  const status = (err as any)?.status || (err as any)?.statusCode || 500;
  const message = err instanceof Error ? err.message : String(err ?? 'Internal Server Error');

  // Use sendError to ensure consistent error response shape across controllers
  return sendError(res, message, status);
}
