import type { Request, Response } from 'express'
import Payroll, { IPayroll } from '../models/Payroll'
import User from '../models/User'
import logger from '../logger'
import { sendSuccess, sendError } from '../utils/apiResponse'
import safeAuditLog from '../utils/auditLogger'
import mongoose from 'mongoose'

type PayrollDoc = IPayroll | mongoose.Document | Record<string, unknown>
type WithToObject = { toObject?: () => unknown }

type AuthUser = { _id?: mongoose.Types.ObjectId }

function toPayrollDTO(doc: PayrollDoc | null | undefined) {
	if (!doc) return null
	const maybe = doc as WithToObject
	let obj: Record<string, any> = {}
	if (maybe && typeof maybe.toObject === 'function') {
		const res = maybe.toObject()
		obj =
			typeof res === 'object' && res !== null
				? (res as Record<string, any>)
				: {}
	} else if (typeof doc === 'object' && doc !== null) {
		obj = doc as Record<string, any>
	}

	const emp = (obj.employee as any) || undefined
	return {
		_id: obj._id != null ? String(obj._id) : undefined,
		employeeId:
			emp && emp._id ? String(emp._id) : emp ? String(emp) : undefined,
		gross: typeof obj.gross === 'number' ? obj.gross : Number(obj.gross),
		net: typeof obj.net === 'number' ? obj.net : Number(obj.net),
		tax: obj.tax != null ? Number(obj.tax) : undefined,
		periodStart: obj.periodStart
			? new Date(String(obj.periodStart)).toISOString()
			: undefined,
		periodEnd: obj.periodEnd
			? new Date(String(obj.periodEnd)).toISOString()
			: undefined,
		payDate: obj.payDate
			? new Date(String(obj.payDate)).toISOString()
			: undefined,
		createdAt: obj.createdAt
			? new Date(String(obj.createdAt)).toISOString()
			: undefined,
		employee: emp && emp._id ? emp : undefined,
	}
}

const listPayroll = async (req: Request, res: Response) => {
	try {
		const page = Number(req.query.page || 1)
		const pageSize = Number(req.query.limit || 20)
		const employeeId = req.query.employeeId as string | undefined
		const from = req.query.from as string | undefined
		const to = req.query.to as string | undefined

		const filter: any = {}
		if (employeeId && mongoose.isValidObjectId(employeeId))
			filter.employee = employeeId
		// support filtering by payDate or periodStart range (legacy clients may use payDate)
		if (from || to) {
			// prefer periodStart filter if present in query
			const usePeriod = req.query.period === '1' || false
			if (usePeriod) filter.periodStart = {}
			else filter.payDate = {}
		}
		if (from) {
			if (req.query.period === '1') filter.periodStart.$gte = new Date(from)
			else filter.payDate.$gte = new Date(from)
		}
		if (to) {
			if (req.query.period === '1') filter.periodStart.$lte = new Date(to)
			else filter.payDate.$lte = new Date(to)
		}

		const total = await Payroll.countDocuments(filter)
		const rawItems = await Payroll.find(filter)
			.populate('employee', 'name email role profile')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
		const items = rawItems.map(toPayrollDTO)

		return sendSuccess(res, { items, total, page, pageSize })
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'listPayroll error')
		return sendError(res, message, 500, err)
	}
}

const getPayroll = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const entry = await Payroll.findById(id).populate(
			'employee',
			'name email role profile'
		)
		if (!entry) return sendError(res, 'Payroll entry not found', 404)
		return sendSuccess(res, toPayrollDTO(entry))
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'getPayroll error')
		return sendError(res, message, 500, err)
	}
}

const createPayroll = async (req: Request, res: Response) => {
	try {
		const { employeeId, gross, amount, periodStart, periodEnd, payDate } =
			req.body
		if (!mongoose.isValidObjectId(employeeId))
			return sendError(res, 'Invalid employee id', 400)
		const employee = await User.findById(employeeId).select('_id')
		if (!employee) return sendError(res, 'Employee not found', 404)

		// support legacy `amount` field by treating it as gross and accept numeric strings
		let resolvedGross: number | undefined = undefined
		if (gross !== undefined && gross !== null) resolvedGross = Number(gross)
		else if (amount !== undefined && amount !== null)
			resolvedGross = Number(amount)
		if (!Number.isFinite(resolvedGross) || resolvedGross! <= 0)
			return sendError(res, 'Invalid gross amount', 400)

		const taxRate = Number(process.env.PAYROLL_TAX_RATE ?? 0.1)
		const tax = Number(resolvedGross! * taxRate)
		const net = Number(resolvedGross! - tax)

		const pStart = periodStart ? new Date(periodStart) : new Date()
		const pEnd = periodEnd ? new Date(periodEnd) : undefined
		if (isNaN(pStart.getTime()))
			return sendError(res, 'Invalid periodStart', 400)
		if (pEnd && isNaN(pEnd.getTime()))
			return sendError(res, 'Invalid periodEnd', 400)
		if (pEnd && pEnd < pStart)
			return sendError(res, 'periodEnd must be same or after periodStart', 400)

		const entry = await Payroll.create({
			employee: employeeId,
			gross: resolvedGross,
			net,
			tax,
			periodStart: pStart,
			periodEnd: pEnd,
			payDate: payDate ? new Date(payDate) : undefined,
		})
		const result = await Payroll.findById(entry._id).populate(
			'employee',
			'name email role profile'
		)

		// audit log (non-blocking)
		const authUser = req.user as AuthUser | undefined
		await safeAuditLog({
			collectionName: 'Payroll',
			documentId: entry._id,
			action: 'create',
			user: authUser?._id,
			before: null,
			after: result,
		})

		return sendSuccess(res, toPayrollDTO(result), 201)
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'createPayroll error')
		return sendError(res, message, 500, err)
	}
}

const updatePayroll = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const updates: Partial<Record<string, unknown>> = { ...req.body }
		if (updates.employeeId) {
			if (!mongoose.isValidObjectId(updates.employeeId))
				return sendError(res, 'Invalid employee id', 400)
			updates.employee = updates.employeeId
			delete updates.employeeId
		}
		if (updates.payDate) updates.payDate = new Date(String(updates.payDate))
		if (updates.periodStart) {
			const ps = new Date(String(updates.periodStart))
			if (isNaN(ps.getTime())) return sendError(res, 'Invalid periodStart', 400)
			updates.periodStart = ps
		}
		if (updates.periodEnd) {
			const pe = new Date(String(updates.periodEnd))
			if (isNaN(pe.getTime())) return sendError(res, 'Invalid periodEnd', 400)
			// If both provided, ensure end >= start
			if (updates.periodStart && pe < (updates.periodStart as Date))
				return sendError(
					res,
					'periodEnd must be same or after periodStart',
					400
				)
			updates.periodEnd = pe
		}
		// if gross provided (string or number), coerce and recompute tax/net
		if (updates.gross !== undefined && updates.gross !== null) {
			const grossVal = Number(updates.gross)
			if (!Number.isFinite(grossVal) || grossVal <= 0)
				return sendError(res, 'Invalid gross amount', 400)
			const taxRate = Number(process.env.PAYROLL_TAX_RATE ?? 0.1)
			const tax = Number(grossVal * taxRate)
			updates.tax = tax
			updates.net = Number(grossVal - tax)
			updates.gross = grossVal
		}

		const before = await Payroll.findById(id).lean()
		const updated = await Payroll.findByIdAndUpdate(id, updates, {
			new: true,
		}).populate('employee', 'name email role profile')
		if (!updated) return sendError(res, 'Payroll entry not found', 404)

		const authUser = req.user as AuthUser | undefined
		await safeAuditLog({
			collectionName: 'Payroll',
			documentId: id,
			action: 'update',
			user: authUser?._id,
			before,
			after: updated,
		})

		return sendSuccess(res, toPayrollDTO(updated))
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'updatePayroll error')
		return sendError(res, message, 500, err)
	}
}

const deletePayroll = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const removed = await Payroll.findByIdAndDelete(id).populate(
			'employee',
			'name email'
		)
		if (!removed) return sendError(res, 'Payroll entry not found', 404)

		const authUser = req.user as AuthUser | undefined
		await safeAuditLog({
			collectionName: 'Payroll',
			documentId: id,
			action: 'delete',
			user: authUser?._id,
			before: removed,
			after: null,
		})

		return sendSuccess(res, toPayrollDTO(removed))
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'deletePayroll error')
		return sendError(res, message, 500, err)
	}
}

export { listPayroll, getPayroll, createPayroll, updatePayroll, deletePayroll }
