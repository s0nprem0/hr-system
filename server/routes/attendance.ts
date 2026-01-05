import express from 'express'
import { param, query } from 'express-validator'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import ownershipOrPermission from '../middleware/ownershipOrPermission'
import validationHandler from '../middleware/validationHandler'
import {
	checkIn,
	checkOut,
	getAttendance,
	listAttendance,
} from '../controllers/attendanceController'

const router = express.Router()

// Check in (employee)
router.post('/checkin', verifyUser, checkIn)

// Check out (owner or admin)
router.post(
	'/checkout/:id',
	verifyUser,
	ownershipOrPermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid id'),
	validationHandler,
	checkOut
)

// Get single attendance (owner or admin)
router.get(
	'/:id',
	verifyUser,
	ownershipOrPermission('manageEmployees'),
	param('id').isMongoId().withMessage('Invalid id'),
	validationHandler,
	getAttendance
)

// List attendance (admin/hr)
router.get(
	'/',
	verifyUser,
	requirePermission('manageEmployees'),
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1 }),
	validationHandler,
	listAttendance
)

export default router
