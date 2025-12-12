import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        auth?.login(res.data.user);
        // Redirect based on role
        if (res.data.user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/employee-dashboard');
      } else {
        setError(res.data.error || 'Login failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Login failed');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end">
            <button type="submit" className="btn">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
