import express from 'express'
import type { Request, Response } from 'express'
import verifyUser from '../middleware/authMiddleware'
import requirePermission from '../middleware/requirePermission'
// import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Simple in-memory sample items for local development. Not persisted.
const sample = [
	{
		id: 'approval-1',
		title: 'Expense reimbursement — Jane Doe',
		subtitle: 'Amount: $120.00',
	},
	{
		id: 'approval-2',
		title: 'Leave request — Alan Smith',
		subtitle: '3 days (Apr 10–12)',
	},
	{
		id: 'approval-3',
		title: 'Profile update — Rita Gomez',
		subtitle: 'Address change',
	},
]

// List pending approvals
router.get(
	'/',
	verifyUser,
	requirePermission('manageEmployees'),
	(req: Request, res: Response) => {
		return res.json({ items: sample })
	}
)

// Approve item (development stub)
router.post(
	'/:id/approve',
	verifyUser,
	requirePermission('manageEmployees'),
	(req: Request, res: Response) => {
		const { id } = req.params
		// In a real implementation we'd update DB and audit. Here we simply acknowledge.
		const item = sample.find((s) => s.id === id)
		if (!item) return res.status(404).send('Not found')
		return res.json({ ok: true, message: 'Approved' })
	}
)

// Deny item (development stub)
router.post(
	'/:id/deny',
	verifyUser,
	requirePermission('manageEmployees'),
	(req: Request, res: Response) => {
		const { id } = req.params
		const item = sample.find((s) => s.id === id)
		if (!item) return res.status(404).send('Not found')
		return res.json({ ok: true, message: 'Denied' })
	}
)

export default router
