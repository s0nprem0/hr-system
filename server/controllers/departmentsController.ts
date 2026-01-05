import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import Department, { IDepartment } from '../models/Department'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'

export const listDepartments = async (req: Request, res: Response) => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1)
		const limit = Math.min(Number(req.query.limit) || 25, 100)
		const search =
			typeof req.query.search === 'string' ? req.query.search.trim() : ''

		const filter: Record<string, unknown> = {}
		if (search) {
			filter.name = { $regex: search, $options: 'i' }
		}

		const total = await Department.countDocuments(filter)
		const items = await Department.find(filter)
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({ createdAt: -1 })
			.lean()

		return sendSuccess(res, { items, total, page, limit })
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'List departments error')
		return sendError(res, msg, 500, err)
	}
}

export const getDepartment = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const dept = await Department.findById(id).lean()
		if (!dept) return sendError(res, 'Department not found', 404)
		return sendSuccess(res, dept)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'Get department error')
		return sendError(res, msg, 500, err)
	}
}

export const createDepartment = async (req: Request, res: Response) => {
	try {
		const { name, description } = req.body
		const exists = await Department.findOne({ name })
		if (exists) return sendError(res, 'Department already exists', 409)

		const created = await Department.create({ name, description })
		return sendSuccess(res, created, 201)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'Create department error')
		return sendError(res, msg, 500, err)
	}
}

export const updateDepartment = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { name, description } = req.body
		const updated = await Department.findByIdAndUpdate(
			id,
			{ name, description },
			{ new: true }
		).lean()
		if (!updated) return sendError(res, 'Department not found', 404)
		return sendSuccess(res, updated)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'Update department error')
		return sendError(res, msg, 500, err)
	}
}

export const deleteDepartment = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const deleted = await Department.findByIdAndDelete(id).lean()
		if (!deleted) return sendError(res, 'Department not found', 404)
		return sendSuccess(res, deleted)
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err)
		logger.error({ err }, 'Delete department error')
		return sendError(res, msg, 500, err)
	}
}

export default {
	listDepartments,
	getDepartment,
	createDepartment,
	updateDepartment,
	deleteDepartment,
}
