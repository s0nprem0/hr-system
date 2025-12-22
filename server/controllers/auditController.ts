import type { Request, Response } from 'express'
import AuditLog from '../models/AuditLog'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'

export async function listAuditLogs(req: Request, res: Response) {
	try {
		const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
		const limit = Math.max(1, parseInt((req.query.limit as string) || '20', 10))
		const skip = (page - 1) * limit

		const filter: Record<string, unknown> = {}
		if (req.query.collectionName)
			filter.collectionName = String(req.query.collectionName)
		if (req.query.action) filter.action = String(req.query.action)
		if (req.query.documentId) filter.documentId = req.query.documentId
		if (req.query.user) filter.user = req.query.user

		if (req.query.from || req.query.to) {
			filter.createdAt = {} as Record<string, unknown>
			if (req.query.from)
				(filter.createdAt as any).$gte = new Date(String(req.query.from))
			if (req.query.to)
				(filter.createdAt as any).$lte = new Date(String(req.query.to))
		}

		const [itemsRaw, total] = await Promise.all([
			AuditLog.find(filter as any)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('user', 'name email')
				.lean()
				.exec(),
			AuditLog.countDocuments(filter as any),
		])

		const items = (itemsRaw as any[]).map((it) => ({
			_id: String(it._id),
			collectionName: it.collectionName,
			documentId: it.documentId,
			action: it.action,
			message: it.message,
			user: it.user
				? { _id: it.user._id, name: it.user.name, email: it.user.email }
				: null,
			createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : null,
			before: it.before,
			after: it.after,
		}))

		return sendSuccess(res, { items, total, page, limit })
	} catch (err: unknown) {
		return sendError(res, 'Failed to list audit logs', 500, err)
	}
}

export async function getAuditLog(req: Request, res: Response) {
	try {
		const { id } = req.params
		const entry = await AuditLog.findById(id)
			.populate('user', 'name email')
			.lean()
		if (!entry) return sendError(res, 'Audit entry not found', 404)
		const formatted = {
			_id: String(entry._id),
			collectionName: entry.collectionName,
			documentId: entry.documentId,
			action: entry.action,
			message: entry.message,
			user: entry.user
				? {
						_id: (entry.user as any)._id,
						name: (entry.user as any).name,
						email: (entry.user as any).email,
				  }
				: null,
			createdAt: entry.createdAt
				? new Date(entry.createdAt).toISOString()
				: null,
			before: entry.before,
			after: entry.after,
		}
		return sendSuccess(res, formatted)
	} catch (err: unknown) {
		return sendError(res, 'Failed to fetch audit log', 500, err)
	}
}

export async function logAuditEvent(req: Request, res: Response) {
	try {
		const { collectionName, documentId, message } = req.body as {
			collectionName?: string
			documentId?: unknown
			message?: string
		}
		if (!collectionName) return sendError(res, 'collectionName required', 400)

		await safeAuditLog({
			collectionName,
			documentId: (documentId as any) ?? undefined,
			action: 'access' as any,
			user: (req.user as any)?._id,
			message: message ?? undefined,
		})

		return sendSuccess(res, { ok: true }, 201)
	} catch (err: unknown) {
		return sendError(res, 'Failed to log audit event', 500, err)
	}
}
