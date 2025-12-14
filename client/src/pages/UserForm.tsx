import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';

type Role = 'admin' | 'hr' | 'employee';
type User = { _id: string; name?: string; email: string; role?: Role };

const UserForm = () => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'hr' | 'employee'>('employee');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

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
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    setSaving(true);
    try {
      const payload: { name: string; email: string; role: Role; password?: string; active?: boolean } = { name, email, role };
      payload.active = active;
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
            <Input ref={nameRef} label="Name" aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? 'name-error' : undefined} value={name} onChange={(e) => { setName(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.name; return c; }); }} />
          </div>

          <div>
            <Input ref={emailRef} label="Email" aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? 'email-error' : undefined} value={email} onChange={(e) => { setEmail(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.email; return c; }); }} type="email" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select label="Role" value={role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as Role)}>
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
            </div>
          </div>

          {!isEdit && (
            <div>
              <Input ref={passwordRef} label="Password" aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? 'password-error' : undefined} value={password} onChange={(e) => { setPassword(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.password; return c; }); }} type="password" />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" className="" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
