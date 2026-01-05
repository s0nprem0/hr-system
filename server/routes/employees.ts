import express from 'express'
import { param, body, query } from 'express-validator'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import validationHandler from '../middleware/validationHandler'
import { draftRateLimiter } from '../middleware/rateLimit'
import {
	listEmployees,
	getEmployee,
	createEmployee,
	updateEmployee,
	deleteEmployee,
} from '../controllers/employeesController'
import {
	importDryRun,
	importCommit,
} from '../controllers/employeeImportController'
import { getDraft, saveDraft } from '../controllers/employeeDraftController'

const router = express.Router()

// Get current user's profile - authenticated users
router.get('/me', verifyUser, async (req, res) => {
	return res.json({ success: true, user: req.user })
})

// List employees - admin and hr
router.get(
	'/',
	verifyUser,
	requirePermission('manageEmployees'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1 })
		.withMessage('limit must be a positive integer'),
	validationHandler,
	listEmployees
)

// Get employee by id - admin and hr
router.get(
	'/:id',
	verifyUser,
	requirePermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid employee id'),
	validationHandler,
	getEmployee
)

// Create employee - admin/hr
router.post(
	'/',
	verifyUser,
	requirePermission('manageEmployees'),
	body('name').isString().notEmpty().withMessage('name is required'),
	body('email').isEmail().withMessage('valid email is required'),
	// profile validations
	body('profile.department')
		.optional()
		.isMongoId()
		.withMessage('invalid department id'),
	body('profile.salary')
		.optional()
		.custom((v) => {
			if (v == null || String(v).trim() === '') return true
			return !Number.isNaN(Number(v))
		})
		.withMessage('profile.salary must be a number'),
	body('password')
		.isLength({ min: 6 })
		.withMessage('password must be at least 6 characters'),
	body('role')
		.optional()
		.isIn(['admin', 'hr', 'employee'])
		.withMessage('invalid role'),
	validationHandler,
	createEmployee
)

// Draft endpoints (per-user) - admin/hr
router.get('/draft', verifyUser, requirePermission('manageEmployees'), getDraft)
router.post(
	'/draft',
	draftRateLimiter,
	verifyUser,
	requirePermission('manageEmployees'),
	// lightweight body-size guard: use Content-Length header when available
	(req, res, next) => {
		try {
			const maxBytes = 8 * 1024 // 8 KB
			const cl = req.headers['content-length']
			if (cl) {
				const n = Number(cl)
				if (!Number.isNaN(n) && n > maxBytes) {
					return res
						.status(413)
						.json({ success: false, error: 'Payload too large' })
				}
			}
		} catch {
			// ignore and proceed
		}
		return next()
	},
	// validate draft payload: only allow expected fields and types
	body('firstName')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 200 })
		.withMessage('firstName must be a short string'),
	body('lastName')
		.optional()
		.isString()
		.trim()
		.isLength({ max: 200 })
		.withMessage('lastName must be a short string'),
	body('email').optional().isEmail().withMessage('valid email is required'),
	body('jobTitle').optional().isString().trim().isLength({ max: 200 }),
	body('department')
		.optional()
		.isMongoId()
		.withMessage('invalid department id'),
	body('salary')
		.optional()
		.custom((v) => {
			if (v == null || String(v).trim() === '') return true
			return !Number.isNaN(Number(v))
		})
		.withMessage('salary must be a number'),
	validationHandler,
	saveDraft
)

// CSV import (dry-run): accept CSV text and a mapping, return preview with errors
router.post(
	'/import',
	verifyUser,
	requirePermission('manageEmployees'),
	body('csv').isString().withMessage('csv (string) is required'),
	validationHandler,
	importDryRun
)

// CSV import (commit): insert valid rows into DB
router.post(
	'/import/commit',
	verifyUser,
	requirePermission('manageEmployees'),
	body('csv').isString().withMessage('csv (string) is required'),
	validationHandler,
	importCommit
)

// Update employee - admin/hr
router.put(
	'/:id',
	verifyUser,
	requirePermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid employee id'),
	body('name').optional().isString(),
	body('email').optional().isEmail(),
	body('password').optional().isLength({ min: 6 }),
	body('role').optional().isIn(['admin', 'hr', 'employee']),
	// profile validations on update
	body('profile.department')
		.optional()
		.isMongoId()
		.withMessage('invalid department id'),
	body('profile.salary')
		.optional()
		.custom((v) => {
			if (v == null || String(v).trim() === '') return true
			return !Number.isNaN(Number(v))
		})
		.withMessage('profile.salary must be a number'),
	validationHandler,
	updateEmployee
)

// Delete employee - admin only
router.delete(
	'/:id',
	verifyUser,
	requirePermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid employee id'),
	validationHandler,
	deleteEmployee
)

export default router
