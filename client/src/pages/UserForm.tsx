import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';

type Role = 'admin' | 'hr' | 'employee';
type User = { _id: string; name?: string; email: string; role?: Role };

const UserForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'hr' | 'employee'>('employee');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    if (!isEdit || !params.id) return;
    // simple client-side validation to avoid requesting invalid ids (which return 404)
    if (!isValidMongoId(params.id)) {
      setError('Invalid user id');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/users/${params.id}`);
        const u: User = res.data?.data;
        setName(u?.name || '');
        setEmail(u?.email || '');
        setRole((u?.role) || 'employee');
      } catch (err: unknown) {
        const apiErr = handleApiError(err);
        // user not found -> show friendly message
        if (/not found/i.test(apiErr.message)) setError('User not found');
        else setError(apiErr.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Name is required');
    if (!email.trim()) return setError('Email is required');
    setSaving(true);
    try {
      const payload: { name: string; email: string; role: Role; password?: string } = { name, email, role };
      if (!isEdit && password) payload.password = password;
      if (isEdit && params.id) {
        await api.put(`/api/users/${params.id}`, payload);
        toast.showToast('User updated', 'success');
      } else {
        // create via employees endpoint
        if (!password) return setError('Password is required for new user');
        await api.post('/api/users', { ...payload, password });
        toast.showToast('User created', 'success');
      }
      navigate('/users');
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit' : 'Create'} User</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}

          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
