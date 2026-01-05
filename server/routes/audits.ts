import express from 'express'
import { query, param, body } from 'express-validator'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import validationHandler from '../middleware/validationHandler'
import { writeRateLimiter } from '../middleware/rateLimit'
import { listAuditLogs } from '../controllers/auditController'
import { getAuditLog, logAuditEvent } from '../controllers/auditController'

const router = express.Router()

// List audit logs - admin and hr
router.get(
	'/',
	verifyUser,
	requirePermission('viewAuditLogs'),
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1 }),
	validationHandler,
	listAuditLogs
)

// Get single audit entry
router.get(
	'/:id',
	verifyUser,
	requirePermission('viewAuditLogs'),
	param('id').isMongoId().withMessage('Invalid id'),
	validationHandler,
	getAuditLog
)

// Log a UI audit event (e.g., viewing/masking toggle). Authenticated users can post events.
router.post(
	'/event',
	verifyUser,
	writeRateLimiter,
	[
		body('collectionName')
			.trim()
			.notEmpty()
			.withMessage('collectionName is required'),
		body('documentId')
			.optional()
			.isMongoId()
			.withMessage('documentId must be a valid id'),
		body('message')
			.optional()
			.trim()
			.isLength({ max: 2000 })
			.withMessage('message is too long'),
	],
	validationHandler,
	logAuditEvent
)

export default router
