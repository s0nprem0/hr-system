import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import api from '../../utils/api'

const HRCards: React.FC = () => {
	const [loading, setLoading] = useState(true)
	const [employeeCount, setEmployeeCount] = useState<number | null>(null)
	const [payrollTotal, setPayrollTotal] = useState<number | null>(null)
	const [auditRecent, setAuditRecent] = useState<number | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const resp = await api.get('/api/overview/hr')
				if (!mounted) return
				setEmployeeCount(resp.data?.data?.employeeCount ?? null)
				setPayrollTotal(resp.data?.data?.payrollTotal ?? null)
				setAuditRecent(resp.data?.data?.pendingApprovals ?? 0)
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : String(err)
				setError(message || 'Failed to load')
			} finally {
				if (mounted) setLoading(false)
			}
		}

		load()
		return () => {
			mounted = false
		}
	}, [])

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<h3 className="text-xl font-semibold mb-2">Pending Approvals</h3>
				{loading ? (
					<p className="muted">Loading…</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<>
						<p className="muted">Recent audit events: {auditRecent}</p>
						<div className="mt-4">
							<button className="btn">View Approvals</button>
						</div>
					</>
				)}
			</Card>

			<Card>
				<h3 className="text-xl font-semibold mb-2">Payroll Snapshot</h3>
				{loading ? (
					<p className="muted">Loading…</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<>
						<p className="muted">Employees: {employeeCount ?? '—'}</p>
						<p className="muted">
							Period gross total:{' '}
							{payrollTotal != null ? payrollTotal.toFixed(2) : '—'}
						</p>
						<div className="mt-4">
							<button className="btn">Open Payroll</button>
						</div>
					</>
				)}
			</Card>
		</div>
	)
}

export default HRCards
