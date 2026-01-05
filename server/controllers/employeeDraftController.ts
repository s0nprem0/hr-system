import type { Request, Response } from 'express'
import EmployeeDraft from '../models/EmployeeDraft'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'

const getDraft = async (req: Request, res: Response) => {
	try {
		const userId = req.user && (req.user as any)._id
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
		const userId = req.user && (req.user as any)._id
		if (!userId) return sendError(res, 'Unauthorized', 401)
		const payload = req.body || {}
		const updated = await EmployeeDraft.findOneAndUpdate(
			{ user: userId },
			{ data: payload },
			{ upsert: true, new: true }
		)
		return sendSuccess(res, updated.data)
	} catch (err: unknown) {
		logger.error({ err }, 'saveDraft error')
		return sendError(res, (err as Error).message || String(err), 500)
	}
}

export { getDraft, saveDraft }
