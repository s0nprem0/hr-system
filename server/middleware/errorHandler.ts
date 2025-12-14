import type { Request, Response, NextFunction } from 'express';

// Centralized error handler middleware
import logger from '../logger';
import { sendError } from '../utils/apiResponse';

export default function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Log the error using structured logger
  logger.error({ err, url: req.url, method: req.method }, 'Uncaught error');

  // Safely derive status code if present on the error object
  let status = 500;
  if (typeof err === 'object' && err !== null) {
    const maybe = (err as { status?: unknown; statusCode?: unknown });
    const s = typeof maybe.status === 'number' ? maybe.status : typeof maybe.statusCode === 'number' ? maybe.statusCode : undefined;
    if (typeof s === 'number') status = s;
  }

  const message = err instanceof Error ? err.message : String(err ?? 'Internal Server Error');

  // Use sendError to ensure consistent error response shape across controllers
  return sendError(res, message, status);
}
