import express from 'express'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
import {
	getHrOverview,
	getEmployeeOverview,
} from '../controllers/overviewController'

const router = express.Router()

// HR overview (admin/hr)
router.get(
	'/hr',
	verifyUser,
	requirePermission('manageEmployees'),
	getHrOverview
)

// Employee overview (self)
router.get('/me', verifyUser, getEmployeeOverview)

export default router
