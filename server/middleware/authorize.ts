import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../models/User';

// Role-based authorization middleware factory
export default function authorize(allowedRoles: Array<IUser['role']>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser | undefined;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    return next();
  };
}
