import React from 'react'
import { Card } from '../ui/Card'

const EmployeeCards: React.FC = () => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<h3 className="text-xl font-semibold mb-2">Leave Balance</h3>
				<p className="muted">Current balances and recent requests.</p>
				<div className="mt-4">
					<button className="btn">Request Leave</button>
				</div>
			</Card>

			<Card>
				<h3 className="text-xl font-semibold mb-2">Recent Payslips</h3>
				<p className="muted">Download or view recent payslips.</p>
				<div className="mt-4">
					<button className="btn">View Payslips</button>
				</div>
			</Card>
		</div>
	)
}

export default EmployeeCards
