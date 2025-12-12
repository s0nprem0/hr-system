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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-lg p-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Admin Dashboard</h2>
        <p className="text-sm text-gray-700 dark:text-gray-200">Welcome, {auth?.user?.name}</p>
        <p className="text-sm text-gray-700 dark:text-gray-200">Role: {auth?.user?.role}</p>
        <div className="mt-4">
          <button onClick={logout} className="btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
