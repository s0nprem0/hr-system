import type { Request, Response, NextFunction } from 'express';
import { getPermissions } from '../utils/permissions';
import { sendError } from '../utils/apiResponse';

export default function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any | undefined;
    if (!user) return sendError(res, 'Not authenticated', 401);
    const role = (user.role as string) || null;
    const perms = getPermissions(role as any);
    if (!perms || !perms[permission]) return sendError(res, 'Insufficient permissions', 403);
    return next();
  };
}
