import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
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
			const rawPassword =
				password ??
				process.env.DEFAULT_IMPORT_PASSWORD ??
				crypto.randomBytes(12).toString('hex')
			const hashed = await bcrypt.hash(rawPassword, 10)
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
			// attach generated temp password only when caller did not supply one
			var generatedPassword: string | undefined = password
				? undefined
				: rawPassword
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

		return { user, profile: empProfile, tempPassword: generatedPassword }
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
		password: draftData.password ?? undefined,
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

/**
 * Update an existing user and their profile by user id.
 * Applies allowed updates, hashes password when present, and upserts profile.
 */
export async function updateUserAndProfile(
	userId: string | mongoose.Types.ObjectId,
	updates: Record<string, any>,
	auditUserId?: mongoose.Types.ObjectId | string | undefined
) {
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const id =
			typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

		const user = (await User.findById(id).session(session)) as any | null
		if (!user) throw new Error('User not found')

		let changed = false
		if (updates.name && user.name !== updates.name) {
			user.name = updates.name
			changed = true
		}
		if (updates.email && user.email !== updates.email) {
			user.email = updates.email
			changed = true
		}
		if (updates.role && user.role !== updates.role) {
			user.role = updates.role as 'admin' | 'hr' | 'employee'
			changed = true
		}
		if (updates.password) {
			user.password = await bcrypt.hash(String(updates.password), 10)
			changed = true
		}
		if (changed) await user.save({ session })

		// Profile updates
		const p = updates.profile || {}
		const profileUpdates: Record<string, unknown> = {}
		if (p.department) profileUpdates.department = p.department
		if (p.designation) profileUpdates.jobTitle = p.designation
		if (p.jobTitle) profileUpdates.jobTitle = p.jobTitle
		if (p.status) profileUpdates.status = p.status
		if (p.salary != null && String(p.salary).trim() !== '') {
			const n = Number(p.salary)
			if (!Number.isNaN(n)) profileUpdates.salary = n
		}

		const updatedProfile = (await EmployeeProfile.findOneAndUpdate(
			{ user: id },
			profileUpdates,
			{ new: true, upsert: true, session }
		)) as any | null

		await session.commitTransaction()

		// Audit
		try {
			const auditUserObj = auditUserId
				? typeof auditUserId === 'string'
					? new mongoose.Types.ObjectId(String(auditUserId))
					: (auditUserId as mongoose.Types.ObjectId)
				: undefined
			await safeAuditLog({
				collectionName: 'users',
				documentId: user._id,
				action: 'update',
				user: auditUserObj,
				before: undefined,
				after: {
					user: user.toObject ? user.toObject() : user,
					profile: updatedProfile?.toObject
						? updatedProfile.toObject()
						: updatedProfile,
				},
			})
		} catch (e) {
			logger.warn(
				{ err: e },
				'employeeService.updateUserAndProfile: audit failed'
			)
		}

		return { user, profile: updatedProfile }
	} catch (err) {
		await session.abortTransaction()
		throw err
	} finally {
		session.endSession()
	}
}

export default {
	createUserAndProfile,
	publishDraft,
	updateUserAndProfile,
	deleteUserAndProfile,
}

/**
 * Delete a user and their profile within a transaction and emit an audit log.
 */
export async function deleteUserAndProfile(
	userId: string | mongoose.Types.ObjectId,
	auditUserId?: mongoose.Types.ObjectId | string | undefined
) {
	const session = await mongoose.startSession()
	session.startTransaction()
	try {
		const id =
			typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId

		const removedUser = await User.findByIdAndDelete(id, { session })
		if (!removedUser) {
			await session.abortTransaction()
			return null
		}

		await EmployeeProfile.findOneAndDelete({ user: id }, { session })

		await session.commitTransaction()

		try {
			const auditUserObj = auditUserId
				? typeof auditUserId === 'string'
					? new mongoose.Types.ObjectId(String(auditUserId))
					: (auditUserId as mongoose.Types.ObjectId)
				: undefined
			await safeAuditLog({
				collectionName: 'users',
				action: 'delete',
				documentId: removedUser._id,
				user: auditUserObj,
				message: `User deleted by ${auditUserObj ?? 'system'}`,
			})
		} catch (e) {
			logger.warn(
				{ err: e },
				'employeeService.deleteUserAndProfile: audit failed'
			)
		}

		return removedUser
	} catch (err) {
		await session.abortTransaction()
		throw err
	} finally {
		session.endSession()
	}
}
