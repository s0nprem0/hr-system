import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const auth = useAuth();

  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  return (
    <header className="w-full app-header sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="text-lg font-semibold">HR System</NavLink>
          <nav className="flex items-center gap-3">
            <button
              className="md:hidden btn"
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
            <div className={`${open ? 'block' : 'hidden'} md:flex md:items-center md:gap-3`}
            >
            {auth?.user ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'muted font-semibold' : 'muted'}>Dashboard</NavLink>
                {/* Role-based links */}
                {/** Render links with disabled styling when permission missing */}
                {auth?.can ? (
                  <>
                    <NavLink to="/users" className={({isActive}) => (auth.can('manageUsers') ? (isActive ? 'muted font-semibold' : 'muted') : 'muted opacity-50 cursor-not-allowed')}>Users</NavLink>
                    <NavLink to="/employees" className={({isActive}) => (auth.can('manageEmployees') ? (isActive ? 'muted font-semibold' : 'muted') : 'muted opacity-50 cursor-not-allowed')}>Employees</NavLink>
                    <NavLink to="/departments" className={({isActive}) => (auth.can('manageDepartments') ? (isActive ? 'muted font-semibold' : 'muted') : 'muted opacity-50 cursor-not-allowed')}>Departments</NavLink>
                    <NavLink to="/payroll" className={({isActive}) => (auth.can('managePayroll') ? (isActive ? 'muted font-semibold' : 'muted') : 'muted opacity-50 cursor-not-allowed')}>Payroll</NavLink>
                  </>
                ) : null}

                <NavLink to="/profile" className={({isActive}) => isActive ? 'muted font-semibold' : 'muted'}>Profile</NavLink>

                <div className="relative">
                  <button className="muted" aria-haspopup="true" aria-expanded={userMenu} onClick={() => setUserMenu(!userMenu)}>
                    {auth.user.name}
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 mt-2 bg-white shadow rounded p-2">
                      <NavLink to="/profile" className="block px-2 py-1">Profile</NavLink>
                      <button className="block px-2 py-1 w-full text-left" onClick={() => { setUserMenu(false); auth.logout(); navigate('/login') }}>Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <NavLink to="/login" className={({isActive}) => isActive ? 'btn font-semibold' : 'btn'}>Login</NavLink>
            )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
