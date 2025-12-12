import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    auth?.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Admin Dashboard</h2>
        <p className="muted">Welcome, {auth?.user?.name}</p>
        <p className="muted">Role: {auth?.user?.role}</p>
        <div className="mt-4">
          <button onClick={logout} className="btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
