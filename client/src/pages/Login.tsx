import { useState } from 'react';
import api from '../utils/api';
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
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data?.success) {
        const token = res.data.token;
        try { localStorage.setItem('token', token); } catch { /* ignore storage errors */ }
        auth?.login(res.data.user, token);
        // Redirect to unified dashboard
        navigate('/dashboard');
      } else {
        setError(res.data.error || 'Login failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Login failed');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-(--cp-text)">Email</label>
            <input id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-(--cp-text) placeholder:text-(--cp-muted) border-border" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-(--cp-text)">Password</label>
            <input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-(--cp-text) placeholder:text-(--cp-muted) border-border" />
          </div>
          {error && <div className="text-sm text-danger">{error}</div>}
          <div className="flex justify-end">
            <button type="submit" className="btn">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
