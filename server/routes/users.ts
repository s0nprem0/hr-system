import express from 'express'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import ownershipOrPermission from '../middleware/ownershipOrPermission'
import validationHandler from '../middleware/validationHandler'
import { param, body } from 'express-validator'
import type { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import { sendSuccess, sendError } from '../utils/apiResponse'
import logger from '../logger'
import safeAuditLog from '../utils/auditLogger'
import employeeService from '../services/employeeService'
import { writeRateLimiter } from '../middleware/rateLimit'
import { enforceContentLength } from '../middleware/security'

const router = express.Router()

// List users - accessible to admin and hr
router.get(
	'/',
	verifyUser,
	requirePermission('manageUsers'),
	async (req, res) => {
		try {
			const page = Math.max(Number(req.query.page) || 1, 1)
			const limit = Math.min(Number(req.query.limit) || 25, 100)
			const search =
				typeof req.query.search === 'string' ? req.query.search.trim() : ''
			const role =
				typeof req.query.role === 'string' ? req.query.role : undefined

			const filter: Record<string, unknown> = {}
			if (search) {
				filter.$or = [
					{ name: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
				]
			}
			if (role) filter.role = role

			const total = await User.countDocuments(filter)
			const users = await User.find(filter)
				.select('-password')
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean()

			return sendSuccess(res, { items: users, total, page, limit })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			return sendError(res, msg, 500)
		}
	}
)

// Delete user - admin only
router.delete(
	'/:id',
	verifyUser,
	requirePermission('manageUsers'),
	writeRateLimiter, // Rate limit DB writes
	[param('id').isMongoId().withMessage('Invalid id')],
	validationHandler,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			if (!id) return sendError(res, 'User id required', 400)
			if (!id) return sendError(res, 'User id required', 400)

			const authUser = req.user
			const auditUserId = authUser?._id

			const removed = await employeeService.deleteUserAndProfile(
				id,
				auditUserId
			)
			if (!removed) return sendError(res, 'User not found', 404)

			return sendSuccess(res, {
				user: {
					_id: removed._id,
					name: removed.name,
					email: removed.email,
					role: removed.role,
				},
			})
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			return sendError(res, msg, 500)
		}
	}
)

// Get single user - owner or admin/hr
router.get(
	'/:id',
	verifyUser,
	ownershipOrPermission('manageUsers'),
	[param('id').isMongoId().withMessage('Invalid id')],
	validationHandler,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			if (!id) return sendError(res, 'User id required', 400)
			const user = await User.findById(id).select('-password').lean()
			if (!user) return sendError(res, 'User not found', 404)
			return sendSuccess(res, user)
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			return sendError(res, msg, 500)
		}
	}
)

// Create user (admin)
router.post(
	'/',
	verifyUser,
	requirePermission('manageUsers'),
	enforceContentLength(10240), // Max 10KB
	writeRateLimiter,
	[
		body('name').trim().notEmpty().withMessage('Name is required'),
		body('email').isEmail().withMessage('Valid email is required'),
		body('password')
			.isLength({ min: 6 })
			.withMessage('Password must be at least 6 characters'),
		body('role')
			.optional()
			.isIn(['admin', 'hr', 'employee'])
			.withMessage('Invalid role'),
	],
	validationHandler,
	async (req: Request, res: Response) => {
		try {
			// Strict extraction of body to avoid injection of unwanted fields
			const { name, email, password, role } = req.body
			const existing = await User.findOne({ email })
			if (existing) return sendError(res, 'Email already in use', 409)

			const authUser = req.user
			const auditUserId = authUser?._id

			const dto = {
				name,
				email,
				password,
				role: role || 'employee',
			}

			const result = await employeeService.createUserAndProfile(
				dto as any,
				auditUserId
			)

			// Return created user without password
			const created = await User.findById(result.user._id)
				.select('-password')
				.lean()

			return sendSuccess(res, created, 201)
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			return sendError(res, msg, 500)
		}
	}
)

// Update user (admin)
router.put(
	'/:id',
	verifyUser,
	ownershipOrPermission('manageUsers'),
	// Prevent role changes unless the caller has manageUsers
	(req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.body || typeof req.body.role === 'undefined') return next()
			return requirePermission('manageUsers')(req, res, next)
		} catch (e) {
			return next(e)
		}
	},
	enforceContentLength(10240),
	writeRateLimiter,
	[
		param('id').isMongoId().withMessage('Invalid id'),
		body('name').optional().trim(),
		body('email').optional().isEmail(),
		body('password').optional().isLength({ min: 6 }),
		body('role').optional().isIn(['admin', 'hr', 'employee']),
	],
	validationHandler,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params

			const authUser = req.user
			const auditUserId = authUser?._id

			// Build allowlist for updates - only permitted fields
			const updates: Record<string, any> = {}
			if (typeof req.body.name !== 'undefined') updates.name = req.body.name
			if (typeof req.body.email !== 'undefined') updates.email = req.body.email
			if (typeof req.body.password !== 'undefined')
				updates.password = req.body.password
			if (typeof req.body.role !== 'undefined') updates.role = req.body.role

			const result = await employeeService.updateUserAndProfile(
				id as string,
				updates,
				auditUserId
			)
			if (!result || !result.user) return sendError(res, 'User not found', 404)

			const userSafe = await User.findById(result.user._id)
				.select('-password')
				.lean()
			return sendSuccess(res, userSafe)
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			return sendError(res, msg, 500)
		}
	}
)

export default router
