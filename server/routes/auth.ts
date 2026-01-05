import express from 'express'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { login, verify, refresh, logout } from '../controllers/authController'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import { body } from 'express-validator'
import loginRateLimiter, { refreshRateLimiter } from '../middleware/rateLimit'
import validationHandler from '../middleware/validationHandler'
import { enforceContentLength } from '../middleware/security'

const router = express.Router()

// NOTE: Public 'register' route removed.
// Users must be created by Admin/HR via /api/users (see users.ts)
// If you need a "first run" setup, implementing a seed script is safer.

router.post(
	'/login',
	enforceContentLength(2048), // Strict size limit for login
	loginRateLimiter,
	[
		body('email').isEmail().withMessage('Valid email required'),
		body('password').notEmpty().withMessage('Password is required'),
	],
	validationHandler,
	login
)

router.get('/verify', verifyUser, verify)

// Refresh and logout endpoints are rate-limited to mitigate abuse.
router.post('/refresh', refreshRateLimiter, validationHandler, refresh)
router.post('/logout', refreshRateLimiter, validationHandler, logout)

// Sample protected admin route
router.get(
	'/admin',
	verifyUser,
	requirePermission('manageUsers'),
	(req, res) => {
		return sendSuccess(
			res,
			{ message: 'Admin access granted', user: req.user },
			200
		)
	}
)

export default router
