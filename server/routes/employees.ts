import express from 'express'
import { param, body, query } from 'express-validator'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import validationHandler from '../middleware/validationHandler'
import {
	listEmployees,
	getEmployee,
	createEmployee,
	updateEmployee,
	deleteEmployee,
} from '../controllers/employeesController'
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
	verifyUser,
	requirePermission('manageEmployees'),
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
