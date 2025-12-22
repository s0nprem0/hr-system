import type { Request, Response, NextFunction } from 'express'
import { getPermissions } from '../utils/permissions'
import { sendError } from '../utils/apiResponse'
import type { IUser } from '../models/User'
import type { Role } from '../utils/permissions'
export default function requirePermission(
	permission: string
): (req: Request, res: Response, next: NextFunction) => Response | void {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as Request & { user?: IUser }).user
		if (!user) return sendError(res, 'Not authenticated', 401)
		const role: Role | null = (user.role as Role) ?? null
		const perms = getPermissions(role)
		if (
			!perms ||
			!(permission in perms) ||
			!Boolean(perms[permission as keyof typeof perms])
		) {
			return sendError(res, 'Insufficient permissions', 403)
		}
		return next()
	}
}
