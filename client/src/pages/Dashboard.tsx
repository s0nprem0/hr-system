import { useAuth } from '../context/AuthContext'
import { formatRole } from '../context/AuthPermissions'
import { useNavigate, Link } from 'react-router-dom'
import { redirectToLogin } from '../utils/authRedirect'
import PageContainer from '../components/layout/PageContainer'
import HRCards from '../components/dashboard/HRCards'
import EmployeeCards from '../components/dashboard/EmployeeCards'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'

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

	return (
		<PageContainer>
			<div className="card mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">{title}</h1>
					<p className="muted">Welcome, {auth?.user?.name}</p>
				</div>
				<div className="flex items-center gap-3">
					<Link to="/" className="muted">
						Home
					</Link>
					<button onClick={logout} className="btn">
						Logout
					</button>
				</div>
			</div>

			{/* Admin view */}
			{canManageUsers && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="card">
						<h2 className="text-xl font-semibold mb-2">Site Administration</h2>
						<p className="muted">Manage users, roles and system settings.</p>
					</div>
					<div className="card">
						<h2 className="text-xl font-semibold mb-2">Reports</h2>
						<p className="muted">View system reports and analytics.</p>
					</div>
				</div>
			)}

			{/* HR view */}
			{canManageEmployees && !canManageUsers && (
				<>
					<HRCards />
				</>
			)}

			{/* Employee view */}
			{auth?.user && !canManageEmployees && !canManageUsers && (
				<>
					<EmployeeCards />
				</>
			)}

			{/* Fallback for roles not matched */}
			{!auth?.user && (
				<div className="card">
					<p className="muted">No role assigned. Contact administrator.</p>
				</div>
			)}
		</PageContainer>
	)
}

export default Dashboard
