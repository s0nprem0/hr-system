import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import LeaveRequest from '../models/LeaveRequest'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'

const createLeave = async (req: Request, res: Response) => {
	try {
		const userId = req.user?._id
		if (!userId) return sendError(res, 'Not authenticated', 401)

		const { startDate, endDate, type, reason } = req.body
		if (!startDate || !endDate)
			return sendError(res, 'startDate and endDate are required', 400)

		const created = await LeaveRequest.create({
			user: userId,
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			type: (type as any) || 'vacation',
			reason,
		})

		safeAuditLog({
			collectionName: 'leaveRequests',
			documentId: created._id,
			action: 'create',
			user: userId as any,
			after: created.toObject ? created.toObject() : created,
		}).catch(() => undefined)

		return sendSuccess(res, created, 201)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const listLeaves = async (req: Request, res: Response) => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1)
		const limit = Math.min(Number(req.query.limit) || 50, 200)
		const user = req.query.user as string | undefined
		const status = req.query.status as string | undefined

		const filter: Record<string, any> = {}
		if (user && mongoose.isValidObjectId(user))
			filter.user = new mongoose.Types.ObjectId(user)
		if (status) filter.status = status

		const total = await LeaveRequest.countDocuments(filter)
		const items = await LeaveRequest.find(filter)
			.populate('user', 'name email')
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({ createdAt: -1 })
			.lean()

		return sendSuccess(res, { items, total, page, limit })
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const getLeave = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		if (!id) return sendError(res, 'Leave id required', 400)
		const rec = await LeaveRequest.findById(id)
			.populate('user', 'name email')
			.lean()
		if (!rec) return sendError(res, 'Leave request not found', 404)
		return sendSuccess(res, rec)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const approveLeave = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const approver = req.user?._id
		if (!id) return sendError(res, 'Leave id required', 400)
		if (!approver) return sendError(res, 'Not authenticated', 401)

		const updated = await LeaveRequest.findByIdAndUpdate(
			id,
			{ status: 'approved', approver: approver as any },
			{ new: true }
		)
		if (!updated) return sendError(res, 'Leave request not found', 404)

		safeAuditLog({
			collectionName: 'leaveRequests',
			documentId: updated._id,
			action: 'update',
			user: approver as any,
			after: updated.toObject ? updated.toObject() : updated,
		}).catch(() => undefined)

		return sendSuccess(res, updated)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const rejectLeave = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const approver = req.user?._id
		if (!id) return sendError(res, 'Leave id required', 400)
		if (!approver) return sendError(res, 'Not authenticated', 401)

		const updated = await LeaveRequest.findByIdAndUpdate(
			id,
			{ status: 'rejected', approver: approver as any },
			{ new: true }
		)
		if (!updated) return sendError(res, 'Leave request not found', 404)

		safeAuditLog({
			collectionName: 'leaveRequests',
			documentId: updated._id,
			action: 'update',
			user: approver as any,
			after: updated.toObject ? updated.toObject() : updated,
		}).catch(() => undefined)

		return sendSuccess(res, updated)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

export { createLeave, listLeaves, getLeave, approveLeave, rejectLeave }
