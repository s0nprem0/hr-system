import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import EmployeeProfile from '../models/EmployeeProfile'
import logger from '../logger'
import safeAuditLog from '../utils/auditLogger'

type CreateEmployeeDTO = {
	name: string
	email: string
	password?: string | null
	role?: string
	profile?: {
		designation?: string
		department?: string
		salary?: number
	}
}

/**
 * Create or update a user and their profile within a transaction.
 * - If a user with the email exists, update their name and profile.
 * - If not, create both user and profile.
 * Returns the created/updated user and profile documents.
 */
export async function createUserAndProfile(
	dto: CreateEmployeeDTO,
	auditUserId?: mongoose.Types.ObjectId | string | undefined
) {
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const { name, email, password, role, profile } = dto

		// Find existing user by email
		let user = (await User.findOne({ email }).session(session)) as any | null
		let createdNew = false

		if (!user) {
			const hashed = await bcrypt.hash(
				password ?? process.env.DEFAULT_IMPORT_PASSWORD ?? 'ChangeMe@123',
				10
			)
			const created = (await User.create(
				[
					{
						name,
						email,
						password: hashed,
						role: (role as 'admin' | 'hr' | 'employee') || 'employee',
					},
				],
				{ session }
			)) as any[]
			user = created && created[0]
			if (!user) throw new Error('Failed to create user')
			createdNew = true
		} else {
			// Update name and role if provided
			let changed = false
			if (name && user.name !== name) {
				user.name = name
				changed = true
			}
			if (role && user.role !== role) {
				user.role = role
				changed = true
			}
			if (password) {
				user.password = await bcrypt.hash(password, 10)
				changed = true
			}
			if (changed) await user.save({ session })
		}

		// Build profile data
		const profileData: Record<string, unknown> = {}
		if (profile) {
			if (profile.department) profileData.department = profile.department
			if (profile.designation) profileData.jobTitle = profile.designation
			if (profile.salary != null) profileData.salary = profile.salary
		}

		let empProfile = (await EmployeeProfile.findOne({ user: user._id }).session(
			session
		)) as any | null
		if (empProfile) {
			Object.assign(empProfile, profileData)
			await empProfile.save({ session })
		} else {
			const createdProfiles = (await EmployeeProfile.create(
				[Object.assign({ user: user._id }, profileData)],
				{ session }
			)) as any[]
			empProfile = createdProfiles && createdProfiles[0]
		}

		await session.commitTransaction()

		// Audit (non-blocking)
		try {
			const action = createdNew ? 'create' : 'update'
			const auditUserObj = auditUserId
				? typeof auditUserId === 'string'
					? new mongoose.Types.ObjectId(String(auditUserId))
					: (auditUserId as mongoose.Types.ObjectId)
				: undefined
			await safeAuditLog({
				collectionName: 'users',
				documentId: user._id,
				action: action as 'create' | 'update' | 'delete' | 'access',
				user: auditUserObj,
				after: {
					user: user.toObject ? user.toObject() : user,
					profile: empProfile?.toObject ? empProfile.toObject() : empProfile,
				},
			})
		} catch (e) {
			logger.warn(
				{ err: e },
				'employeeService.createUserAndProfile: audit failed'
			)
		}

		return { user, profile: empProfile }
	} catch (err) {
		await session.abortTransaction()
		throw err
	} finally {
		session.endSession()
	}
}

/**
 * Publish a draft-like payload by delegating to createUserAndProfile.
 * draftData is expected to contain firstName, lastName, email and optional jobTitle/department/salary
 */
export async function publishDraft(
	draftData: Record<string, any>,
	auditUserId?: mongoose.Types.ObjectId | string | undefined
) {
	const name = `${String(draftData.firstName || '').trim()} ${String(
		draftData.lastName || ''
	).trim()}`.trim()
	const dto: CreateEmployeeDTO = {
		name,
		email: String(draftData.email),
		password:
			draftData.password ??
			process.env.DEFAULT_IMPORT_PASSWORD ??
			'ChangeMe@123',
		role: draftData.role ?? 'employee',
		profile: {
			designation: draftData.jobTitle || draftData.designation,
			department: draftData.department,
			salary:
				typeof draftData.salary === 'number'
					? draftData.salary
					: draftData.salary
					? Number(draftData.salary)
					: undefined,
		},
	}
	return createUserAndProfile(dto, auditUserId)
}

export default { createUserAndProfile, publishDraft }
