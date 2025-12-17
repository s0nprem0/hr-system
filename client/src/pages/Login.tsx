import { useState } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import type { AuthLoginResponse } from '@hr/shared';
import { safeSetItem } from '../utils/storage';
import PageContainer from '../components/layout/PageContainer';

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
        // server returns standardized payload: { success: true, data: { token, refreshToken, user } }
        const payload = res.data?.data as AuthLoginResponse | undefined;
        if (payload) {
          safeSetItem('token', payload.token);
          safeSetItem('refreshToken', payload.refreshToken);
          auth?.login(payload.user, payload.token);
        }
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
    <PageContainer>
      <div className="card w-full max-w-md mx-auto p-6">
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
    </PageContainer>
  );
};

export default Login;
