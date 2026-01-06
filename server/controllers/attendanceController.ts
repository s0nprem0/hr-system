import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import Attendance from '../models/Attendance'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'

const checkIn = async (req: Request, res: Response) => {
	try {
		const userId = req.user?._id
		if (!userId) return sendError(res, 'Not authenticated', 401)

		const today = new Date()
		const dateOnly = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		)

		let record = await Attendance.findOne({ user: userId, date: dateOnly })
		const now = new Date()
		let action: 'create' | 'update' = 'create'
		if (!record) {
			record = await Attendance.create({
				user: userId,
				date: dateOnly,
				checkIn: now,
			})
			action = 'create'
		} else {
			// Prevent accidental rapid duplicate check-ins (5 minute window)
			if (record.checkIn && !record.checkOut) {
				const prev = new Date(record.checkIn)
				if (now.getTime() - prev.getTime() < 5 * 60 * 1000) {
					return sendError(res, 'Already checked in recently', 409)
				}
			}

			record.checkIn = now
			record.checkOut = undefined
			action = 'update'
			await record.save()
		}

		safeAuditLog({
			collectionName: 'attendance',
			documentId: record._id,
			action: 'create',
			user: userId as any,
			after: record.toObject ? record.toObject() : record,
		}).catch(() => undefined)

		return sendSuccess(res, record, 201)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const checkOut = async (req: Request, res: Response) => {
	try {
		const userId = req.user?._id
		if (!userId) return sendError(res, 'Not authenticated', 401)

		const { id } = req.params
		if (!id) return sendError(res, 'Attendance id required', 400)

		const rec = await Attendance.findById(id)
		if (!rec) return sendError(res, 'Attendance record not found', 404)

		// Only owner or admin should call routes; route-level ownership enforced
		const now = new Date()
		// Ensure there was a check-in before checking out
		if (!rec.checkIn)
			return sendError(res, 'Cannot check out before check in', 400)
		// Prevent double check-out
		if (rec.checkOut)
			return sendError(res, 'Attendance already checked out', 409)

		rec.checkOut = now
		await rec.save()

		safeAuditLog({
			collectionName: 'attendance',
			documentId: rec._id,
			action: 'update',
			user: req.user?._id as any,
			after: rec.toObject ? rec.toObject() : rec,
		}).catch(() => undefined)

		return sendSuccess(res, rec)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const getAttendance = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		if (!id) return sendError(res, 'Attendance id required', 400)

		const rec = await Attendance.findById(id)
			.populate('user', 'name email')
			.lean()
		if (!rec) return sendError(res, 'Attendance record not found', 404)
		return sendSuccess(res, rec)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

const listAttendance = async (req: Request, res: Response) => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1)
		const limit = Math.min(Number(req.query.limit) || 50, 200)
		const user = req.query.user as string | undefined
		const from = req.query.from as string | undefined
		const to = req.query.to as string | undefined

		const filter: Record<string, any> = {}
		if (user && mongoose.isValidObjectId(user))
			filter.user = new mongoose.Types.ObjectId(user)
		if (from || to) filter.date = {}
		if (from) filter.date.$gte = new Date(String(from))
		if (to) filter.date.$lte = new Date(String(to))

		const total = await Attendance.countDocuments(filter)
		const items = await Attendance.find(filter)
			.populate('user', 'name email')
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({ date: -1 })
			.lean()

		return sendSuccess(res, { items, total, page, limit })
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		return sendError(res, msg, 500)
	}
}

export { checkIn, checkOut, getAttendance, listAttendance }
