import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export default function validationHandler(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }
  return next();
}
