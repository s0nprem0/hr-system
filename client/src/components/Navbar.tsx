import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const auth = useAuth();

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
                {auth.user.role === 'admin' && (
                  <>
                    <Link to="/users" className="muted">Users</Link>
                  </>
                )}
                {auth.user.role === 'hr' && (
                  <>
                    <Link to="/employees" className="muted">Employees</Link>
                    <Link to="/departments" className="muted">Departments</Link>
                    <Link to="/payroll" className="muted">Payroll</Link>
                  </>
                )}
                {auth.user.role === 'employee' && (
                  <>
                    <Link to="/profile" className="muted">Profile</Link>
                  </>
                )}

                <span className="muted">{auth.user.name}</span>
                <button className="btn" onClick={() => { auth.logout(); window.location.href = '/login'; }}>Logout</button>
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
