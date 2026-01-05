import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

type Payslip = {
	_id?: string
	payDate?: string
	net?: number | string
	employee?: { _id?: string }
	employeeId?: string
}

const EmployeeCards: React.FC = () => {
	const auth = useAuth()
	const [loading, setLoading] = useState(true)
	const [leaveBalance, setLeaveBalance] = useState<number | null>(null)
	const [recentPayslips, setRecentPayslips] = useState<Payslip[]>([])
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true
		async function load() {
			setLoading(true)
			setError(null)
			try {
				// Placeholder: no dedicated leave API — show mock or 0
				const payslipResp = await api.get('/api/payroll?page=1&limit=5')
				if (!mounted) return
				const items: Payslip[] = payslipResp.data?.data?.items ?? []
				// Filter payslips for current user if possible
				const userId = auth?.user?._id
				const myPayslips = userId
					? items.filter(
							(it) =>
								String(it.employee?._id || it.employeeId) === String(userId)
					  )
					: []
				setRecentPayslips(myPayslips)
				// Leave balance unknown -> placeholder 0
				setLeaveBalance(0)
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
	}, [auth?.user?._id])

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<h3 className="text-xl font-semibold mb-2">Leave Balance</h3>
				{loading ? (
					<p className="muted">Loading…</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<>
						<p className="muted">Available days: {leaveBalance}</p>
						<div className="mt-4">
							<button className="btn">Request Leave</button>
						</div>
					</>
				)}
			</Card>

			<Card>
				<h3 className="text-xl font-semibold mb-2">Recent Payslips</h3>
				{loading ? (
					<p className="muted">Loading…</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<>
						{recentPayslips.length === 0 ? (
							<p className="muted">No recent payslips</p>
						) : (
							<ul className="space-y-2">
								{recentPayslips.map((p) => (
									<li key={p._id} className="flex justify-between items-center">
										<span className="truncate">
											{new Date(p.payDate ?? '').toLocaleDateString()} —{' '}
											{Number(p.net ?? 0).toFixed(2)}
										</span>
										<button className="btn small">Download</button>
									</li>
								))}
							</ul>
						)}
						<div className="mt-4">
							<button className="btn">View Payslips</button>
						</div>
					</>
				)}
			</Card>
		</div>
	)
}

export default EmployeeCards
