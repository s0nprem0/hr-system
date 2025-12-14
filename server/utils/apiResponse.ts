import type { Response } from 'express';

export interface ErrorPayload {
  message: string;
  details?: unknown;
}

export function sendSuccess(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, message: string, status = 500, details?: unknown) {
  const payload: ErrorPayload = { message };
  if (details !== undefined) payload.details = details;
  return res.status(status).json({ success: false, error: payload });
}

export default { sendSuccess, sendError };
