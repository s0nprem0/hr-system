import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, Building2, DollarSign, FileText, User, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const auth = useAuth();

  if (!auth?.user) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-(--cp-surface) border-r border-(--cp-border) overflow-y-auto z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-(--cp-cta)" />
              <span className="text-xl font-bold">HR System</span>
            </div>
            <button
              className="md:hidden p-1 hover:bg-(--cp-bg) rounded-md"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
            >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

            {auth.can('manageUsers') && (
              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </NavLink>
            )}

            {auth.can('manageEmployees') && (
              <NavLink
                to="/employees"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
              >
                <User className="h-5 w-5" />
                <span>Employees</span>
              </NavLink>
            )}

            {auth.can('manageDepartments') && (
              <NavLink
                to="/departments"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
              >
                <Building2 className="h-5 w-5" />
                <span>Departments</span>
              </NavLink>
            )}

            {auth.can('managePayroll') && (
              <NavLink
                to="/payroll"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
              >
                <DollarSign className="h-5 w-5" />
                <span>Payroll</span>
              </NavLink>
            )}

            {auth.can('viewAuditLogs') && (
              <NavLink
                to="/audits"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
              >
                <FileText className="h-5 w-5" />
                <span>Audit Logs</span>
              </NavLink>
            )}
          </nav>

          <div className="mt-8 pt-8 border-t border-(--cp-border)">
            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
            >
              <User className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="font-medium">{auth.user.name}</span>
                <span className="text-xs muted">View Profile</span>
              </div>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
