import { useState } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data?.success) {
        // server returns standardized payload: { success: true, data: { token, user } }
        const token = res.data?.data?.token;
        const refreshToken = res.data?.data?.refreshToken;
        const user = res.data?.data?.user;
        try { if (token) localStorage.setItem('token', token); if (refreshToken) localStorage.setItem('refreshToken', refreshToken); } catch { /* ignore storage errors */ }
        auth?.login(user, token);
        // Redirect to unified dashboard
        navigate('/dashboard');
      } else {
        setError(res.data?.error?.message || res.data?.error || 'Login failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Login failed');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input id="email" label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Input id="password" label="Password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="text-sm text-danger">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
