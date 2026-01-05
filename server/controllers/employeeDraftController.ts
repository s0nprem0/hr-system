import type { Request, Response } from 'express'
import EmployeeDraft from '../models/EmployeeDraft'
import mongoose from 'mongoose'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'
import safeAuditLog from '../utils/auditLogger'
import validation from '../utils/validation'

const getDraft = async (req: Request, res: Response) => {
	try {
		const authResult = validation.requireAuthUser(req.user)
		if (authResult.err) return sendError(res, authResult.err.message, 401)
		const userId = authResult.id!
		const draft = await EmployeeDraft.findOne({ user: userId }).lean()
		return sendSuccess(res, draft?.data || {})
	} catch (err: unknown) {
		logger.error({ err }, 'getDraft error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

const saveDraft = async (req: Request, res: Response) => {
	try {
		const authResult = validation.requireAuthUser(req.user)
		if (authResult.err) return sendError(res, authResult.err.message, 401)
		const userId = authResult.id!

		const payload = req.body || {}
		const allowedKeys = [
			'firstName',
			'lastName',
			'email',
			'jobTitle',
			'department',
			'salary',
		]
		const data: Record<string, unknown> = {}
		for (const k of Object.keys(payload)) {
			if (!allowedKeys.includes(k)) continue
			const v = (payload as Record<string, unknown>)[k]
			if (k === 'salary') {
				const n = validation.toNumber(v)
				if (n === undefined) continue
				data[k] = n
				continue
			}
			const s = validation.sanitizeString(v)
			if (s !== undefined) data[k] = s
		}

		const updated = await EmployeeDraft.findOneAndUpdate(
			{ user: userId },
			{ data },
			{ upsert: true, new: true }
		)

		// audit the draft save (non-blocking)
		const auditUserId = userId
			? new mongoose.Types.ObjectId(String(userId))
			: undefined
		safeAuditLog({
			collectionName: 'employeeDrafts',
			action: 'update',
			user: auditUserId,
			before: undefined,
			after: data,
			message: 'User saved an employee draft',
		}).catch(() => undefined)

		return sendSuccess(res, updated.data)
	} catch (err: unknown) {
		logger.error({ err }, 'saveDraft error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

import User from '../models/User'
import EmployeeProfile from '../models/EmployeeProfile'

const publishDraft = async (req: Request, res: Response) => {
	try {
		const authResult = validation.requireAuthUser(req.user)
		if (authResult.err) return sendError(res, authResult.err.message, 401)
		const userId = authResult.id!

		const draft = await EmployeeDraft.findOne({ user: userId }).lean()
		if (!draft || !draft.data) return sendError(res, 'No draft found', 400)

		const data = draft.data as Record<string, any>
		if (!data.firstName || !data.lastName || !data.email) {
			return sendError(
				res,
				'Draft missing required fields (firstName, lastName, email)',
				400
			)
		}

		if (!validation.isEmail(data.email))
			return sendError(res, 'Invalid email', 400)

		// find or create user
		let user = await User.findOne({ email: data.email })
		if (!user) {
			user = await User.create({
				name: `${data.firstName} ${data.lastName}`.trim(),
				email: data.email,
				password: 'ChangeMe@123',
				role: 'employee',
			})
		} else {
			user.name = `${data.firstName} ${data.lastName}`.trim()
			await user.save()
		}

		// create or update EmployeeProfile
		const profileData: any = {}
		if (data.department && validation.isObjectId(data.department))
			profileData.department = data.department
		if (data.jobTitle) profileData.jobTitle = data.jobTitle
		if (data.salary != null) profileData.salary = data.salary

		const existingProfile = await EmployeeProfile.findOne({ user: user._id })
		if (existingProfile) {
			Object.assign(existingProfile, profileData)
			await existingProfile.save()
		} else {
			await EmployeeProfile.create(
				Object.assign({ user: user._id }, profileData)
			)
		}

		// clear draft
		await EmployeeDraft.deleteOne({ user: userId })

		// audit
		safeAuditLog({
			collectionName: 'employeeDrafts',
			documentId: user._id,
			action: 'publish',
			user: new mongoose.Types.ObjectId(String(userId)),
			before: draft.data,
			after: { user: user._id, profile: profileData },
			message: 'Published employee draft',
		}).catch(() => undefined)

		return sendSuccess(res, { userId: user._id })
	} catch (err: unknown) {
		logger.error({ err }, 'publishDraft error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

const discardDraft = async (req: Request, res: Response) => {
	try {
		const authResult = validation.requireAuthUser(req.user)
		if (authResult.err) return sendError(res, authResult.err.message, 401)
		const userId = authResult.id!
		const draft = await EmployeeDraft.findOneAndDelete({ user: userId }).lean()
		if (!draft) return sendError(res, 'No draft to discard', 400)

		safeAuditLog({
			collectionName: 'employeeDrafts',
			documentId: userId,
			action: 'delete',
			user: new mongoose.Types.ObjectId(String(userId)),
			before: draft.data,
			after: null,
			message: 'User discarded draft',
		}).catch(() => undefined)

		return sendSuccess(res, {})
	} catch (err: unknown) {
		logger.error({ err }, 'discardDraft error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

export { getDraft, saveDraft, publishDraft, discardDraft }
