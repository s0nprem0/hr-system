import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const auth = useAuth();

  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setUserMenu(false)
      }
    }
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (userRef.current && !userRef.current.contains(target)) {
        setUserMenu(false)
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        // keep mobile menu closed when clicking outside
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onDocClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onDocClick)
    }
  }, [])

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
            <div ref={menuRef} className={`${open ? 'block' : 'hidden'} md:flex md:items-center md:gap-3`}
            >
            {auth?.user ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'muted font-semibold' : 'muted'}>Dashboard</NavLink>
                {/* Role-based links */}
                {/** Render links with disabled styling when permission missing */}
                {auth?.can ? (
                  <>
                    {auth.can('manageUsers') ? (
                      <NavLink onClick={() => setOpen(false)} to="/users" className={({ isActive }) => (isActive ? 'muted font-semibold' : 'muted')}>Users</NavLink>
                    ) : (
                      <span aria-disabled="true" tabIndex={-1} className="muted opacity-50 cursor-not-allowed">Users</span>
                    )}

                    {auth.can('manageEmployees') ? (
                      <NavLink onClick={() => setOpen(false)} to="/employees" className={({ isActive }) => (isActive ? 'muted font-semibold' : 'muted')}>Employees</NavLink>
                    ) : (
                      <span aria-disabled="true" tabIndex={-1} className="muted opacity-50 cursor-not-allowed">Employees</span>
                    )}

                    {auth.can('manageDepartments') ? (
                      <NavLink onClick={() => setOpen(false)} to="/departments" className={({ isActive }) => (isActive ? 'muted font-semibold' : 'muted')}>Departments</NavLink>
                    ) : (
                      <span aria-disabled="true" tabIndex={-1} className="muted opacity-50 cursor-not-allowed">Departments</span>
                    )}

                    {auth.can('managePayroll') ? (
                      <NavLink onClick={() => setOpen(false)} to="/payroll" className={({ isActive }) => (isActive ? 'muted font-semibold' : 'muted')}>Payroll</NavLink>
                    ) : (
                      <span aria-disabled="true" tabIndex={-1} className="muted opacity-50 cursor-not-allowed">Payroll</span>
                    )}
                    {auth.can('viewAuditLogs') ? (
                      <NavLink onClick={() => setOpen(false)} to="/audits" className={({ isActive }) => (isActive ? 'muted font-semibold' : 'muted')}>Audit Logs</NavLink>
                    ) : (
                      <span aria-disabled="true" tabIndex={-1} className="muted opacity-50 cursor-not-allowed">Audit Logs</span>
                    )}
                  </>
                ) : null}

                <NavLink onClick={() => setOpen(false)} to="/profile" className={({isActive}) => isActive ? 'muted font-semibold' : 'muted'}>Profile</NavLink>

                <div ref={userRef} className="relative">
                  <button className="muted" aria-haspopup="true" aria-expanded={userMenu} onClick={() => setUserMenu(!userMenu)}>
                    {auth.user.name}
                  </button>
                  {userMenu && (
                    <div role="menu" aria-label="User menu" className="absolute right-0 mt-2 bg-white shadow rounded p-2">
                      <NavLink onClick={() => { setUserMenu(false); setOpen(false) }} to="/profile" className="block px-2 py-1">Profile</NavLink>
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
