import { useState } from 'react';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, CenteredCard } from '../components/ui';
import type { AuthLoginResponse, ApiResponse } from '@hr/shared';
import { safeSetItem } from '../utils/storage';
import { getAndClearPostLoginRedirect } from '../utils/authRedirect';
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
      const r = res.data as ApiResponse<AuthLoginResponse>;
      if (r?.success) {
        const payload = r.data;
        if (payload) {
          safeSetItem('token', payload.token);
          safeSetItem('refreshToken', payload.refreshToken);
          auth?.login(payload.user, payload.token);
        }
        // Redirect to the originally requested path, or fallback to dashboard
        let dest = getAndClearPostLoginRedirect() || '/dashboard';
        // If the saved redirect points back to the login page, ignore it.
        if (dest === '/login' || dest.startsWith('/login?')) {
          dest = '/dashboard';
        }
        navigate(dest);
      } else {
        setError((r as { success: false; error?: { message?: string } }).error?.message || 'Login failed');
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <CenteredCard>
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
      </CenteredCard>
    </PageContainer>
  );
};

export default Login;
