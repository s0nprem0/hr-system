import type { Request, Response, NextFunction } from 'express'
import type { IUser } from '../models/User'
import { sendError } from '../utils/apiResponse'

// Role-based authorization middleware factory
export default function authorize(allowedRoles: Array<IUser['role']>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user as IUser | undefined
		if (!user) {
			return sendError(res, 'Not authenticated', 401)
		}

		if (!allowedRoles.includes(user.role)) {
			return sendError(res, 'Insufficient permissions', 403)
		}

		return next()
	}
}
