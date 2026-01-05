import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import mongoose, { PipelineStage, Types } from 'mongoose'
import User from '../models/User'
import EmployeeProfile from '../models/EmployeeProfile'
import logger from '../logger'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'
import employeeService from '../services/employeeService'
import validators from '../validators/zodValidators'

// Define types locally or import them if available in your project types
type AuthUser = {
	_id?: Types.ObjectId | string
	email?: string
	name?: string
}

// Helper to safely convert Mongoose documents or POJOs to plain objects
type WithToObject = { toObject?: () => unknown }
const toPlainObject = (obj: unknown): Record<string, unknown> => {
	if (!obj) return {}
	const maybe = obj as WithToObject
	if (maybe && typeof maybe.toObject === 'function') {
		const res = maybe.toObject()
		if (res && typeof res === 'object') return res as Record<string, unknown>
		return {}
	}
	if (typeof obj === 'object' && obj !== null)
		return obj as Record<string, unknown>
	return {}
}

// Helper to merge User + Profile for API responses
const mergeUserProfile = (user: unknown, profile: unknown) => {
	if (!user) return null

	const u = toPlainObject(user)
	const p = toPlainObject(profile)

	// Flatten structure: User fields + Profile fields under 'profile' key
	return {
		...u,
		profile: {
			...p,
			// Ensure specific fields map correctly for frontend compatibility
			department: p.department,
			designation: p.jobTitle,
			salary: p.salary,
		},
	}
}

const listEmployees = async (req: Request, res: Response) => {
	try {
		const page = Number(req.query.page || 1)
		const pageSize = Number(req.query.limit || 20)
		const search = String(req.query.search || '').trim()
		const role = req.query.role as string | undefined
		const department = req.query.department as string | undefined

		// Pipeline stages
		const pipeline: PipelineStage[] = []

		// 1. Join with EmployeeProfiles
		pipeline.push({
			$lookup: {
				from: 'employeeprofiles',
				localField: '_id',
				foreignField: 'user',
				as: 'profileData',
			},
		})

		// 2. Unwind profile (preserve users without profiles just in case)
		pipeline.push({
			$unwind: { path: '$profileData', preserveNullAndEmptyArrays: true },
		})

		// 3. Join Department for name filtering/display
		pipeline.push({
			$lookup: {
				from: 'departments',
				localField: 'profileData.department',
				foreignField: '_id',
				as: 'deptData',
			},
		})
		pipeline.push({
			$unwind: { path: '$deptData', preserveNullAndEmptyArrays: true },
		})

		// 4. Build Match filters
		const match: Record<string, unknown> = {}

		if (search) {
			match.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			]
		}

		if (role) match.role = role

		if (department && mongoose.isValidObjectId(department)) {
			match['profileData.department'] = new mongoose.Types.ObjectId(department)
		}

		pipeline.push({ $match: match })

		// 5. Facet for pagination
		pipeline.push({
			$facet: {
				metadata: [{ $count: 'total' }],
				data: [
					{ $skip: (page - 1) * pageSize },
					{ $limit: pageSize },
					// Project final shape
					{
						$project: {
							_id: 1,
							name: 1,
							email: 1,
							role: 1,
							createdAt: 1,
							'profile.department': '$deptData', // Populate-like shape
							'profile.designation': '$profileData.jobTitle',
							'profile.salary': '$profileData.salary',
							'profile.status': '$profileData.status',
						},
					},
				],
			},
		})

		const result = await User.aggregate(pipeline)

		const metadata = result[0].metadata[0] || { total: 0 }
		const items = result[0].data

		return sendSuccess(res, {
			items,
			total: metadata.total,
			page,
			pageSize,
		})
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'listEmployees error')
		return sendError(res, message, 500)
	}
}

const getEmployee = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const user = await User.findById(id).select('-password').lean()
		if (!user) return sendError(res, 'Employee not found', 404)

		const profile = await EmployeeProfile.findOne({ user: id })
			.populate('department', 'name')
			.lean()

		return sendSuccess(res, mergeUserProfile(user, profile))
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'getEmployee error')
		return sendError(res, message, 500)
	}
}

const createEmployee = async (req: Request, res: Response) => {
	try {
		const parsed = validators.CreateEmployeeSchema.safeParse(req.body)
		if (!parsed.success) {
			const errors = validators.formatZodErrors(parsed.error)
			return sendError(res, 'Validation failed', 400, { errors })
		}

		const { name, email, password, role, profile } = parsed.data

		// Preserve existing behavior: if an account exists with the email, return 409
		const existing = await User.findOne({ email })
		if (existing) return sendError(res, 'Email already in use', 409)

		const dto = {
			name,
			email,
			password,
			role,
			profile: {
				designation: profile?.designation || profile?.jobTitle,
				department: profile?.department,
				salary: profile?.salary,
			},
		}

		const authUser = req.user as AuthUser | undefined
		const auditUserId = authUser?._id
			? typeof authUser._id === 'string'
				? new mongoose.Types.ObjectId(String(authUser._id))
				: (authUser._id as mongoose.Types.ObjectId)
			: undefined

		const result = await employeeService.createUserAndProfile(
			dto as any,
			auditUserId
		)

		return sendSuccess(res, mergeUserProfile(result.user, result.profile), 201)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'createEmployee error')
		return sendError(res, message, 500)
	}
}

const updateEmployee = async (req: Request, res: Response) => {
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const { id } = req.params
		const updates = req.body

		// 1. Update User fields
		const userUpdates: Record<string, unknown> = {}
		if (updates.name) userUpdates.name = updates.name
		if (updates.email) userUpdates.email = updates.email
		if (updates.role) userUpdates.role = updates.role
		if (updates.password) {
			userUpdates.password = await bcrypt.hash(String(updates.password), 10)
		}

		const updatedUser = await User.findByIdAndUpdate(id, userUpdates, {
			new: true,
			session,
		}).select('-password')

		if (!updatedUser) {
			await session.abortTransaction()
			return sendError(res, 'Employee not found', 404)
		}

		// 2. Update Profile fields
		// Flatten incoming profile updates
		const profileUpdates: Record<string, unknown> = {}
		const p = updates.profile || {}

		if (p.department) profileUpdates.department = p.department
		if (p.designation) profileUpdates.jobTitle = p.designation // Map legacy
		if (p.jobTitle) profileUpdates.jobTitle = p.jobTitle
		if (p.status) profileUpdates.status = p.status
		if (p.salary != null && String(p.salary).trim() !== '') {
			const n = Number(p.salary)
			if (!Number.isNaN(n)) profileUpdates.salary = n
		}

		const updatedProfile = await EmployeeProfile.findOneAndUpdate(
			{ user: id },
			profileUpdates,
			{ new: true, upsert: true, session } // upsert creates profile if missing
		)

		await session.commitTransaction()

		const authUser = req.user as AuthUser | undefined
		const auditUserId = authUser?._id
			? typeof authUser._id === 'string'
				? new mongoose.Types.ObjectId(String(authUser._id))
				: (authUser._id as mongoose.Types.ObjectId)
			: undefined

		safeAuditLog({
			collectionName: 'users',
			action: 'update',
			documentId: updatedUser._id,
			user: auditUserId,
			after: mergeUserProfile(updatedUser, updatedProfile),
			message: `User updated by ${authUser?.email || 'system'}`,
		}).catch(() => undefined)

		return sendSuccess(res, mergeUserProfile(updatedUser, updatedProfile))
	} catch (err: unknown) {
		await session.abortTransaction()
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'updateEmployee error')
		return sendError(res, message, 500)
	} finally {
		session.endSession()
	}
}

const deleteEmployee = async (req: Request, res: Response) => {
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const { id } = req.params

		const removedUser = await User.findByIdAndDelete(id, { session })
		if (!removedUser) {
			await session.abortTransaction()
			return sendError(res, 'Employee not found', 404)
		}

		await EmployeeProfile.findOneAndDelete({ user: id }, { session })

		await session.commitTransaction()

		const authUser = req.user as AuthUser | undefined
		const auditUserId = authUser?._id
			? typeof authUser._id === 'string'
				? new mongoose.Types.ObjectId(String(authUser._id))
				: (authUser._id as mongoose.Types.ObjectId)
			: undefined

		safeAuditLog({
			collectionName: 'users',
			action: 'delete',
			documentId: removedUser._id,
			user: auditUserId,
			message: `User deleted by ${authUser?.email || 'system'}`,
		}).catch(() => undefined)

		return sendSuccess(res, { success: true })
	} catch (err: unknown) {
		await session.abortTransaction()
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'deleteEmployee error')
		return sendError(res, message, 500)
	} finally {
		session.endSession()
	}
}

export {
	listEmployees,
	getEmployee,
	createEmployee,
	updateEmployee,
	deleteEmployee,
}
