import type { Request, Response, NextFunction } from 'express'
import { getPermissions } from '../utils/permissions'
import { sendError } from '../utils/apiResponse'
import type { IUser } from '../models/User'
import mongoose from 'mongoose'

export default function ownershipOrPermission(
	permission: string
): (req: Request, res: Response, next: NextFunction) => Response | void {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as Request & { user?: IUser }).user
		if (!user) return sendError(res, 'Not authenticated', 401)

		// If user owns the resource (id matches param), allow
		const { id } = req.params as { id?: string }
		if (id) {
			try {
				const userIdStr = user._id ? String(user._id) : ''
				const paramIdStr = String(id)
				if (userIdStr && paramIdStr && userIdStr === paramIdStr) {
					return next()
				}
				// also allow ObjectId equality
				if (
					mongoose.isValidObjectId(userIdStr) &&
					mongoose.isValidObjectId(paramIdStr)
				) {
					if (
						String(new mongoose.Types.ObjectId(userIdStr)) ===
						String(new mongoose.Types.ObjectId(paramIdStr))
					) {
						return next()
					}
				}
			} catch {
				// fall through to permission check
			}
		}

		// Otherwise require the specified permission
		const role = (user.role as unknown as string) ?? null
		const perms = getPermissions(role as any)
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
