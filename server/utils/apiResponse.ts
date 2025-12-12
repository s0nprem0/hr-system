import type { Response } from 'express';

export function sendSuccess(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, message: string, status = 500, details?: unknown) {
  const payload: any = { message };
  if (details !== undefined) payload.details = details;
  return res.status(status).json({ success: false, error: payload });
}

export default { sendSuccess, sendError };
