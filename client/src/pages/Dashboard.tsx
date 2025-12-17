import { useAuth } from '../context/AuthContext';
import { formatRole } from '../context/AuthPermissions';
import { useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    auth?.logout();
    navigate('/login');
  };

  const canManageEmployees = auth?.can?.("manageEmployees") ?? false;
  const canManageUsers = auth?.can?.("manageUsers") ?? false;

  const title = auth?.user ? formatRole(auth.user?.role) : 'Dashboard';

  return (
    <PageContainer>
      <div className="card mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="muted">Welcome, {auth?.user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="muted">Home</Link>
            <button onClick={logout} className="btn">Logout</button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Employee Management</h3>
              <div className="space-y-3">
                <button className="w-full btn text-left">➕ Add New Employee</button>
                <button className="w-full btn text-left">📋 View All Employees</button>
                <button className="w-full btn text-left">🏢 Manage Departments</button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Leave & Attendance</h3>
              <div className="space-y-3">
                <button className="w-full btn text-left">✅ Approve Leave Requests</button>
                <button className="w-full btn text-left">🕒 Review Attendance Logs</button>
                <button className="w-full btn text-left">⚠️ View Audit Logs</button>
              </div>
            </div>
          </div>
        )}

        {/* Employee view */}
        {auth?.user && !canManageEmployees && !canManageUsers && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-2">My Profile</h2>
            <p className="muted">Name: {auth?.user?.name}</p>
            <p className="muted">Role: {formatRole(auth?.user?.role)}</p>
          </div>
        )}

        {/* Fallback for roles not matched */}
        {!auth?.user && (
          <div className="card">
            <p className="muted">No role assigned. Contact administrator.</p>
          </div>
        )}
    </PageContainer>
  );
};

export default Dashboard;
