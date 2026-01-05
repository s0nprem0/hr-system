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

	// Metrics — these would normally come from APIs; use placeholders
	const metrics = [
		{ id: 'headcount', title: 'Headcount', value: 124 },
		{ id: 'new', title: 'New Joiners (30d)', value: 6 },
		{ id: 'pending', title: 'Pending Approvals', value: 4 },
		{ id: 'leaves', title: 'Upcoming Leaves', value: 3 },
	]

	const approvalItems = [
		{
			id: '1',
			title: 'Leave request — Jane Employee',
			subtitle: 'Mar 18 — 3 days',
		},
		{
			id: '2',
			title: 'Profile change request — John Employee',
			subtitle: 'Pending manager review',
		},
	]

	const handleApprove = (id: string) => {
		// wire to API or state update
		console.log('approve', id)
	}

	const handleDeny = (id: string) => {
		console.log('deny', id)
	}

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
				{metrics.map((m) => (
					<MetricCard key={m.id} title={m.title} value={m.value} />
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Approvals / Tasks (wide) */}
				<div className="lg:col-span-2">
					<ApprovalList
						items={approvalItems}
						onApprove={handleApprove}
						onDeny={handleDeny}
					/>
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
