import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import mongoose, { FilterQuery } from 'mongoose'
import User from '../models/User'
import EmployeeProfile from '../models/EmployeeProfile'
import logger from '../logger'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'

// Helper to merge User + Profile for API responses
const mergeUserProfile = (user: any, profile: any) => {
	if (!user) return null
	const u = user.toObject ? user.toObject() : user
	const p = profile ? (profile.toObject ? profile.toObject() : profile) : {}
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
		const pipeline: any[] = []

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
		const match: FilterQuery<any> = {}

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
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const { name, email, password, role, profile } = req.body

		const existing = await User.findOne({ email }).session(session)
		if (existing) {
			await session.abortTransaction()
			return sendError(res, 'Email already in use', 409)
		}

		const hashed = await bcrypt.hash(password, 10)

		// 1. Create User
		const [createdUser] = await User.create(
			[
				{
					name,
					email,
					password: hashed,
					role: role || 'employee',
				},
			],
			{ session }
		)

		// 2. Create Profile
		// Map legacy 'profile' body structure to new EmployeeProfile fields
		const salary = Number(profile?.salary)
		const profileData = {
			user: createdUser._id,
			department: profile?.department,
			jobTitle: profile?.designation || profile?.jobTitle, // Handle legacy key
			salary: !Number.isNaN(salary) ? salary : 0,
			status: 'active',
		}

		const [createdProfile] = await EmployeeProfile.create([profileData], {
			session,
		})

		await session.commitTransaction()

		// Audit
		safeAuditLog({
			collectionName: 'users',
			action: 'create',
			documentId: createdUser._id,
			user: req.user && (req.user as any)._id,
			after: mergeUserProfile(createdUser, createdProfile),
			message: `User created by ${
				(req.user && (req.user as any).email) || 'system'
			}`,
		}).catch(() => undefined)

		return sendSuccess(res, mergeUserProfile(createdUser, createdProfile), 201)
	} catch (err: unknown) {
		await session.abortTransaction()
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'createEmployee error')
		return sendError(res, message, 500)
	} finally {
		session.endSession()
	}
}

const updateEmployee = async (req: Request, res: Response) => {
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const { id } = req.params
		const updates = req.body

		// 1. Update User fields
		const userUpdates: any = {}
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
		const profileUpdates: any = {}
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

		safeAuditLog({
			collectionName: 'users',
			action: 'update',
			documentId: updatedUser._id,
			user: req.user && (req.user as any)._id,
			after: mergeUserProfile(updatedUser, updatedProfile),
			message: `User updated by ${
				(req.user && (req.user as any).email) || 'system'
			}`,
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

		safeAuditLog({
			collectionName: 'users',
			action: 'delete',
			documentId: removedUser._id,
			user: req.user && (req.user as any)._id,
			message: `User deleted by ${
				(req.user && (req.user as any).email) || 'system'
			}`,
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
