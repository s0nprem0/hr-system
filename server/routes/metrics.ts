import express from 'express'
import type { Request, Response } from 'express'

const router = express.Router()

// Minimal metrics endpoint used by the client dashboard during development.
// Returns a small set of sample metrics; the client accepts either
// an array or `{ metrics: [...] }`, so we return an object for clarity.
router.get('/', (req: Request, res: Response) => {
	const metrics = [
		{ id: 'employees', title: 'Employees', value: 128 },
		{ id: 'onboarded', title: 'New This Month', value: 4 },
		{ id: 'open-positions', title: 'Open Positions', value: 3 },
		{ id: 'pending-approvals', title: 'Pending Approvals', value: 5 },
	]

	return res.json({ metrics })
})

export default router
