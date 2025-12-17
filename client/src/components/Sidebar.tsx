import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, Building2, DollarSign, FileText, User } from 'lucide-react';

const Sidebar = () => {
  const auth = useAuth();

  if (!auth?.user) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-(--cp-surface) border-r border-(--cp-border) overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase className="h-6 w-6 text-(--cp-cta)" />
          <span className="text-xl font-bold">HR System</span>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          {auth.can('manageUsers') && (
            <NavLink
              to="/users"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </NavLink>
          )}

          {auth.can('manageEmployees') && (
            <NavLink
              to="/employees"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
            >
              <User className="h-5 w-5" />
              <span>Employees</span>
            </NavLink>
          )}

          {auth.can('manageDepartments') && (
            <NavLink
              to="/departments"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
            >
              <Building2 className="h-5 w-5" />
              <span>Departments</span>
            </NavLink>
          )}

          {auth.can('managePayroll') && (
            <NavLink
              to="/payroll"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-(--cp-cta) text-white' : 'hover:bg-(--cp-bg)'}`}
            >
              <DollarSign className="h-5 w-5" />
              <span>Payroll</span>
            </NavLink>
          )}

          {auth.can('viewAuditLogs') && (
            <NavLink
              to="/audits"
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
  );
};

export default Sidebar;
