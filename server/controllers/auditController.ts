import type { Request, Response } from 'express'
import mongoose from 'mongoose'
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
			const createdAtFilter: Record<string, unknown> = {}
			if (req.query.from)
				createdAtFilter.$gte = new Date(String(req.query.from))
			if (req.query.to) createdAtFilter.$lte = new Date(String(req.query.to))
			filter.createdAt = createdAtFilter as unknown as Record<string, unknown>
		}

		const itemsRaw = await AuditLog.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('user', 'name email')
			.lean()
			.exec()
		const total = await AuditLog.countDocuments(filter)

		const items = (itemsRaw as any[]).map((it) => {
			const userObj = (it.user as any) || undefined
			return {
				_id: String(it._id),
				collectionName: it.collectionName,
				documentId: it.documentId,
				action: it.action,
				message: it.message,
				user: userObj
					? { _id: userObj._id, name: userObj.name, email: userObj.email }
					: null,
				createdAt: it.createdAt
					? new Date(String(it.createdAt)).toISOString()
					: null,
				before: it.before,
				after: it.after,
			}
		})

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
				? (() => {
						const u = entry.user as any
						return { _id: u._id, name: u.name, email: u.email }
				  })()
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
		let auditDocumentId: string | mongoose.Types.ObjectId | undefined
		if (typeof documentId === 'string') {
			auditDocumentId = documentId
		} else if (documentId instanceof mongoose.Types.ObjectId) {
			auditDocumentId = documentId
		} else if (documentId && typeof documentId === 'object' && '_id' in (documentId as any)) {
			const maybeId = (documentId as any)._id
			if (typeof maybeId === 'string' || maybeId instanceof mongoose.Types.ObjectId)
				auditDocumentId = maybeId
		}
		if (!collectionName) return sendError(res, 'collectionName required', 400)

		const authUser = req.user as
			| { _id?: string | mongoose.Types.ObjectId }
			| undefined
		const auditUserId = authUser?._id
			? typeof authUser._id === 'string'
				? new mongoose.Types.ObjectId(String(authUser._id))
				: (authUser._id as mongoose.Types.ObjectId)
			: undefined

		await safeAuditLog({
			collectionName,
			documentId: auditDocumentId,
			action: 'access',
			user: auditUserId,
			message: message ?? undefined,
		})

		return sendSuccess(res, { ok: true }, 201)
	} catch (err: unknown) {
		return sendError(res, 'Failed to log audit event', 500, err)
	}
}
