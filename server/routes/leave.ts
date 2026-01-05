import express from 'express'
import { param, body, query } from 'express-validator'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import ownershipOrPermission from '../middleware/ownershipOrPermission'
import validationHandler from '../middleware/validationHandler'
import {
	createLeave,
	listLeaves,
	getLeave,
	approveLeave,
	rejectLeave,
} from '../controllers/leaveController'

const router = express.Router()

// Create leave request (employee)
router.post(
	'/',
	verifyUser,
	[
		body('startDate').notEmpty(),
		body('endDate').notEmpty(),
		body('type').optional().isIn(['vacation', 'sick', 'unpaid']),
	],
	validationHandler,
	createLeave
)

// Get leave request (owner or admin/hr)
router.get(
	'/:id',
	verifyUser,
	ownershipOrPermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid id'),
	validationHandler,
	getLeave
)

// List leave requests (admin/hr)
router.get(
	'/',
	verifyUser,
	requirePermission('manageEmployees'),
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1 }),
	validationHandler,
	listLeaves
)

// Approve / reject (admin/hr)
router.post(
	'/:id/approve',
	verifyUser,
	requirePermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid id'),
	validationHandler,
	approveLeave
)
router.post(
	'/:id/reject',
	verifyUser,
	requirePermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid id'),
	validationHandler,
	rejectLeave
)

export default router
