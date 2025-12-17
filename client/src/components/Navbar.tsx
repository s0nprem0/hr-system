import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { redirectToLogin } from '../utils/authRedirect';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth?.logout();
    redirectToLogin(navigate);
  };

  if (!auth?.user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-(--cp-surface) border-b border-(--cp-border) z-10 md:left-64">
      <div className="h-full px-6 flex items-center justify-between">
        <button
          className="md:hidden btn p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="font-medium text-sm">{auth.user.name}</span>
            <span className="text-xs muted">{auth.user.role}</span>
          </div>
          <button onClick={handleLogout} className="btn flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
