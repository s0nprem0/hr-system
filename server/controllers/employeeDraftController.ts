import type { Request, Response } from 'express'
import EmployeeDraft from '../models/EmployeeDraft'
import mongoose from 'mongoose'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'
import safeAuditLog from '../utils/auditLogger'
import validation from '../utils/validation'
import validators from '../validators/zodValidators'

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

import employeeService from '../services/employeeService'

const publishDraft = async (req: Request, res: Response) => {
	try {
		const authResult = validation.requireAuthUser(req.user)
		if (authResult.err) return sendError(res, authResult.err.message, 401)
		const userId = authResult.id!

		const draft = await EmployeeDraft.findOne({ user: userId }).lean()
		if (!draft || !draft.data) return sendError(res, 'No draft found', 400)

		const data = draft.data as Record<string, any>

		// Validate draft payload with zod
		const parsed = validators.PublishDraftSchema.safeParse(data)
		if (!parsed.success) {
			const errors = validators.formatZodErrors(parsed.error)
			return sendError(res, 'Validation failed', 400, { errors })
		}

		const auditUserId = new mongoose.Types.ObjectId(String(userId))
		const result = await employeeService.publishDraft(parsed.data, auditUserId)

		// clear draft after successful publish
		await EmployeeDraft.deleteOne({ user: userId })

		// audit the draft publish (non-blocking)
		safeAuditLog({
			collectionName: 'employeeDrafts',
			documentId: result.user._id,
			action: 'create',
			user: auditUserId,
			before: draft.data,
			after: { user: result.user._id, profile: result.profile },
			message: 'Published employee draft',
		}).catch(() => undefined)

		return sendSuccess(res, { userId: result.user._id })
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
