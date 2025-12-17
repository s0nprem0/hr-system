import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const auth = useAuth();

  const navigate = useNavigate()

  return (
    <header className="w-full app-header sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-semibold">HR System</Link>
          <nav className="flex items-center gap-3">
            {auth?.user ? (
              <>
                <Link to="/dashboard" className="muted">Dashboard</Link>
                {/* Role-based links */}
                {auth?.can && auth.can('manageUsers') && (
                  <Link to="/users" className="muted">Users</Link>
                )}
                {auth?.can && auth.can('manageEmployees') && (
                  <Link to="/employees" className="muted">Employees</Link>
                )}
                {auth?.can && auth.can('manageDepartments') && (
                  <Link to="/departments" className="muted">Departments</Link>
                )}
                {auth?.can && auth.can('managePayroll') && (
                  <Link to="/payroll" className="muted">Payroll</Link>
                )}
                {/* Profile is visible to any logged-in user */}
                <Link to="/profile" className="muted">Profile</Link>

                <span className="muted">{auth.user.name}</span>
                <button
                  className="btn"
                  onClick={() => {
                    auth.logout()
                    navigate('/login')
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn">Login</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
