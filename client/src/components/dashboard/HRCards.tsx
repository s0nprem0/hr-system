import React from 'react'
import { Card } from '../ui/Card'

const HRCards: React.FC = () => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<h3 className="text-xl font-semibold mb-2">Pending Approvals</h3>
				<p className="muted">
					List of leave and profile changes awaiting approval.
				</p>
				<div className="mt-4">
					<button className="btn">View Approvals</button>
				</div>
			</Card>

			<Card>
				<h3 className="text-xl font-semibold mb-2">Payroll Snapshot</h3>
				<p className="muted">Current period totals and quick reconciliation.</p>
				<div className="mt-4">
					<button className="btn">Open Payroll</button>
				</div>
			</Card>
		</div>
	)
}

export default HRCards
