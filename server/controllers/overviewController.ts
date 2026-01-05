import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/User'
import Payroll from '../models/Payroll'
import AuditLog from '../models/AuditLog'
import { sendSuccess, sendError } from '../utils/apiResponse'

export async function getHrOverview(req: Request, res: Response) {
	try {
		const employeeCount = await User.countDocuments({
			role: { $in: ['employee', 'hr', 'admin'] },
		})

		// Sum gross for recent period (last 30 days)
		const since = new Date()
		since.setDate(since.getDate() - 30)
		const payrollItems = await Payroll.find({ payDate: { $gte: since } }).lean()
		const payrollTotal = payrollItems.reduce(
			(s, it: any) => s + (Number(it.gross) || 0),
			0
		)

		// Pending approvals: approximate by counting drafts and audit entries for drafts
		const draftApprovals = await AuditLog.countDocuments({
			collectionName: 'employeeDrafts',
			action: 'update',
		})

		return sendSuccess(res, {
			employeeCount,
			payrollTotal,
			pendingApprovals: draftApprovals,
		})
	} catch (err: unknown) {
		return sendError(res, 'Failed to fetch overview', 500, err)
	}
}

export async function getEmployeeOverview(req: Request, res: Response) {
	try {
		const authUser = req.user as
			| { _id?: string | mongoose.Types.ObjectId }
			| undefined
		const userId = authUser?._id
		if (!userId) return sendError(res, 'Unauthorized', 401)

		// Recent payslips
		const payslips = await Payroll.find({ employee: String(userId) })
			.sort({ payDate: -1 })
			.limit(5)
			.lean()

		// Leave balance: placeholder (no leave model yet)
		const leaveBalance = 0

		return sendSuccess(res, { leaveBalance, payslips })
	} catch (err: unknown) {
		return sendError(res, 'Failed to fetch overview', 500, err)
	}
}

export default { getHrOverview, getEmployeeOverview }
