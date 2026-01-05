import { useAuth } from '../context/AuthContext'
import { formatRole } from '../context/AuthPermissions'
import { useNavigate, Link } from 'react-router-dom'
import { redirectToLogin } from '../utils/authRedirect'
import PageContainer from '../components/layout/PageContainer'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	Button,
} from '../components/ui'
import MetricCard from '../components/ui/MetricCard'
import ApprovalList from '../components/ui/ApprovalList'
import Skeleton from '../components/ui/Skeleton'
import { useEffect, useState } from 'react'
import { apiGetJson, apiPostJson } from '../lib/api'
import { useToast } from '../context/ToastContext'

type Metric = { id: string; title: string; value: number }
type Approval = { id: string; title: string; subtitle?: string }

const Dashboard = () => {
	const auth = useAuth()
	const navigate = useNavigate()

	const logout = () => {
		auth?.logout()
		redirectToLogin(navigate)
	}

	const canManageEmployees = auth?.can?.('manageEmployees') ?? false
	const canManageUsers = auth?.can?.('manageUsers') ?? false

	const title = auth?.user ? formatRole(auth.user?.role) : 'Dashboard'

	// Local UI state for metrics and approvals (fetched from API)
	const [metricsData, setMetricsData] = useState<
		{ id: string; title: string; value: number }[]
	>([])
	const [metricsLoading, setMetricsLoading] = useState(true)

	const [approvals, setApprovals] = useState<
		{ id: string; title: string; subtitle?: string }[]
	>([])
	const [approvalsLoading, setApprovalsLoading] = useState(true)

	// Fetch metrics
	useEffect(() => {
		let mounted = true
		const fetchMetrics = async () => {
			setMetricsLoading(true)
			try {
				const data = await apiGetJson<{ metrics?: Metric[] }>('/api/metrics')
				if (!mounted) return
				// Expecting data.metrics or raw array
				setMetricsData(
					(data as { metrics?: Metric[] }).metrics ??
						(data as unknown as Metric[])
				)
			} catch (err) {
				console.error(err)
			} finally {
				if (mounted) setMetricsLoading(false)
			}
		}
		fetchMetrics()
		return () => {
			mounted = false
		}
	}, [])

	// Fetch approvals
	useEffect(() => {
		let mounted = true
		const fetchApprovals = async () => {
			setApprovalsLoading(true)
			try {
				const data = await apiGetJson<{ items?: Approval[] }>('/api/approvals')
				if (!mounted) return
				setApprovals(
					(data as { items?: Approval[] }).items ??
						(data as unknown as Approval[])
				)
			} catch (err) {
				console.error(err)
			} finally {
				if (mounted) setApprovalsLoading(false)
			}
		}
		fetchApprovals()
		return () => {
			mounted = false
		}
	}, [])

	const toast = useToast()

	// Optimistic approve/deny handlers with toast feedback
	const handleApprove = async (id: string) => {
		const prev = approvals
		setApprovals((s) => s.filter((a) => a.id !== id))
		try {
			await apiPostJson(`/api/approvals/${id}/approve`)
			toast.showToast('Approval successful', 'success')
		} catch (err: unknown) {
			console.error(err)
			setApprovals(prev)
			const msg = err instanceof Error ? err.message : String(err)
			toast.showToast(msg || 'Failed to approve', 'error')
		}
	}

	const handleDeny = async (id: string) => {
		const prev = approvals
		setApprovals((s) => s.filter((a) => a.id !== id))
		try {
			await apiPostJson(`/api/approvals/${id}/deny`)
			toast.showToast('Denied successfully', 'success')
		} catch (err: unknown) {
			console.error(err)
			setApprovals(prev)
			const msg = err instanceof Error ? err.message : String(err)
			toast.showToast(msg || 'Failed to deny', 'error')
		}
	}

	// (approvalItems placeholder removed — using `approvals` state)

	return (
		<PageContainer>
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">{title}</h1>
						<p className="muted">Welcome, {auth?.user?.name}</p>
					</div>
					<div className="flex items-center gap-3">
						<Link to="/" className="muted">
							Home
						</Link>
						<Button onClick={logout} variant="ghost">
							Logout
						</Button>
					</div>
				</div>
			</div>

			{/* Metric cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{metricsLoading
					? [1, 2, 3, 4].map((n) => (
							<div key={n} className="p-4">
								<Skeleton className="h-20 w-full" />
							</div>
					  ))
					: metricsData.map((m) => (
							<MetricCard key={m.id} title={m.title} value={m.value} />
					  ))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Approvals / Tasks (wide) */}
				<div className="lg:col-span-2">
					{approvalsLoading ? (
						<Card>
							<CardHeader>
								<CardTitle>Approvals</CardTitle>
								<CardDescription>Recent items requiring action</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									<li>
										<Skeleton className="h-6 w-3/4 mb-2" />
										<Skeleton className="h-6 w-1/2" />
									</li>
									<li>
										<Skeleton className="h-6 w-3/4 mb-2" />
										<Skeleton className="h-6 w-1/2" />
									</li>
								</ul>
							</CardContent>
						</Card>
					) : (
						<ApprovalList
							items={approvals}
							onApprove={handleApprove}
							onDeny={handleDeny}
						/>
					)}
				</div>

				{/* Attendance exceptions / quick actions */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>Attendance Exceptions</CardTitle>
							<CardDescription>
								Late check-ins and missing punches
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								<li className="flex items-center justify-between">
									<div>
										<div className="font-medium">Mark late — Alan Smith</div>
										<div className="text-sm muted">Today, 09:22</div>
									</div>
									<Button size="sm" variant="ghost">
										Resolve
									</Button>
								</li>
								<li className="flex items-center justify-between">
									<div>
										<div className="font-medium">
											Missing punch — Rita Gomez
										</div>
										<div className="text-sm muted">Yesterday</div>
									</div>
									<Button size="sm" variant="ghost">
										Add entry
									</Button>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Role-specific smaller cards */}
			{canManageUsers && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<Card>
						<CardHeader>
							<CardTitle>System Health</CardTitle>
							<CardDescription>Background jobs and cron status</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-sm muted">All systems operational</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Reports</CardTitle>
							<CardDescription>Generate exports and analytics</CardDescription>
						</CardHeader>
						<CardContent>
							<Button>Generate report</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Audit</CardTitle>
							<CardDescription>Recent critical events</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-sm muted">No critical events</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Employee simple view */}
			{auth?.user && !canManageEmployees && !canManageUsers && (
				<div className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>My Profile</CardTitle>
							<CardDescription>Quick links for employees</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="muted">Name: {auth.user.name}</p>
							<p className="muted">Role: {formatRole(auth.user.role)}</p>
						</CardContent>
					</Card>
				</div>
			)}
		</PageContainer>
	)
}

export default Dashboard
