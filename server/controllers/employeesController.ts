import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import User, { IUser } from '../models/User'
import logger from '../logger'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'
import mongoose from 'mongoose'

const listEmployees = async (req: Request, res: Response) => {
	try {
		const page = Number(req.query.page || 1)
		const pageSize = Number(req.query.limit || 20)
		const search = String(req.query.search || '').trim()
		const role = req.query.role as string | undefined
		const department = req.query.department as string | undefined

		const filter: FilterQuery<IUser> = {}
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			]
		}
		if (role) filter.role = role
		if (department && mongoose.isValidObjectId(department))
			filter['profile.department'] = department

		const total = await User.countDocuments(filter)
		const items = await User.find(filter)
			.select('-password')
			.populate('profile.department', 'name')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.lean()

		return sendSuccess(res, { items, total, page, pageSize })
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'listEmployees error')
		return sendError(res, message, 500)
	}
}

const getEmployee = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const employee = await User.findById(id)
			.select('-password')
			.populate('profile.department', 'name')
		if (!employee) return sendError(res, 'Employee not found', 404)
		return sendSuccess(res, employee)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'getEmployee error')
		return sendError(res, message, 500)
	}
}

const createEmployee = async (req: Request, res: Response) => {
	try {
		const { name, email, password, role, profile } = req.body;
		const existing = await User.findOne({ email })
		if (existing) return sendError(res, 'Email already in use', 409)
		const hashed = await bcrypt.hash(password, 10)
		// coerce profile.salary to number when provided
		const safeProfile = profile && typeof profile === 'object' ? { ...profile } : undefined
		if (safeProfile && safeProfile.salary != null && String(safeProfile.salary).trim() !== '') {
			const n = Number(safeProfile.salary)
			if (!Number.isNaN(n)) safeProfile.salary = n
			else delete safeProfile.salary
		}
		const created = await User.create({ name, email, password: hashed, role: role || 'employee', profile: safeProfile });
			name,
			email,
			password: hashed,
			role: role || 'employee',
			profile,
		})
		const result = await User.findById(created._id).select('-password')
		// audit create
		safeAuditLog({
			collectionName: 'users',
			action: 'create',
			documentId: created._id,
			user: req.user && (req.user as any)._id,
			after: result,
			message: `User created by ${
				(req.user && (req.user as any).email) || 'system'
			}`,
		}).catch(() => undefined)

		return sendSuccess(res, result, 201)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'createEmployee error')
		return sendError(res, message, 500)
	}
}

const updateEmployee = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const updates = req.body as UpdateQuery<IUser>
		if ((updates as { password?: unknown }).password) {
			// ensure password is a string before hashing
			const p = String((updates as { password?: unknown }).password)
			const hashed = await bcrypt.hash(p, 10)
			;(updates as Partial<IUser>).password = hashed
		}
		// coerce profile.salary when present in updates
		if ((updates as any).profile && typeof (updates as any).profile === 'object') {
			const prof = (updates as any).profile
			if (prof.salary != null && String(prof.salary).trim() !== '') {
				const n = Number(prof.salary)
				if (!Number.isNaN(n)) prof.salary = n
				else delete prof.salary
			}
			(updates as any).profile = prof
		}

		const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
			new: true,
		}).select('-password')
		if (!updated) return sendError(res, 'Employee not found', 404)
		// audit update
		safeAuditLog({
			collectionName: 'users',
			action: 'update',
			documentId: updated._id,
			user: req.user && (req.user as any)._id,
			before: undefined,
			after: updated,
			message: `User updated by ${
				(req.user && (req.user as any).email) || 'system'
			}`,
		}).catch(() => undefined)

		return sendSuccess(res, updated)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'updateEmployee error')
		return sendError(res, message, 500)
	}
}

const deleteEmployee = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const removed = await User.findByIdAndDelete(id).select('-password')
		if (!removed) return sendError(res, 'Employee not found', 404)
		// audit delete
		safeAuditLog({
			collectionName: 'users',
			action: 'delete',
			documentId: removed._id,
			user: req.user && (req.user as any)._id,
			before: removed,
			after: undefined,
			message: `User deleted by ${
				(req.user && (req.user as any).email) || 'system'
			}`,
		}).catch(() => undefined)

		return sendSuccess(res, removed)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'deleteEmployee error')
		return sendError(res, message, 500)
	}
}

export {
	listEmployees,
	getEmployee,
	createEmployee,
	updateEmployee,
	deleteEmployee,
}
