import type { Request, Response } from 'express'
import EmployeeDraft from '../models/EmployeeDraft'
import mongoose from 'mongoose'
type AuthUser = { _id?: string }
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'
import safeAuditLog from '../utils/auditLogger'

const getDraft = async (req: Request, res: Response) => {
	try {
		const authUser = req.user as AuthUser | undefined
		const userId = authUser?._id
		if (!userId) return sendError(res, 'Unauthorized', 401)
		const draft = await EmployeeDraft.findOne({ user: userId }).lean()
		return sendSuccess(res, draft?.data || {})
	} catch (err: unknown) {
		logger.error({ err }, 'getDraft error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

const saveDraft = async (req: Request, res: Response) => {
	try {
		const authUser = req.user as AuthUser | undefined
		const userId = authUser?._id
		if (!userId) return sendError(res, 'Unauthorized', 401)
		const payload = req.body || {}

		// validate/sanitize payload: only allow specific fields and types
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
				// accept numeric strings or numbers
				if (v == null || String(v).trim() === '') continue
				const n = Number(v)
				if (Number.isNaN(n)) return sendError(res, 'Invalid salary value', 400)
				data[k] = n
				continue
			}
			if (typeof v === 'string') {
				if (v.length > 1000) continue
				data[k] = v.trim()
			}
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

export { getDraft, saveDraft }
