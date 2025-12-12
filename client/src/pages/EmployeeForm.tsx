import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import axios from 'axios';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'hr' | 'employee'>('employee');
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);

  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const navTimeout = useRef<number | null>(null);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data?.data?.items || []);
    } catch {
      // ignore
    }
  };

  const fetchEmployee = async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/employees/${params.id}`);
      const e = res.data?.data;
      setName(e?.name || '');
      setEmail(e?.email || '');
      setRole(e?.role || 'employee');
      setDepartmentId(e?.profile?.department?._id || e?.profile?.department || undefined);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error?.message || err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    if (isEdit) fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    // Basic client-side validation
    const errs: Record<string, string> = {};
    if (!name || !name.trim()) errs.name = 'Name is required';
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) errs.email = 'A valid email is required';
    if (!isEdit) {
      if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
    } else {
      if (password && password.length > 0 && password.length < 6) errs.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    const payload: any = { name, email, role, profile: { department: departmentId } };
    if (!isEdit && password) payload.password = password;
    if (isEdit && password) payload.password = password; // allow changing password

    setLoading(true);
    try {
      if (isEdit && params.id) {
        await api.put(`/api/employees/${params.id}`, payload);
        setSuccess('Employee updated');
        // give user a chance to see success message
        navTimeout.current = window.setTimeout(() => navigate(`/employees/${params.id}`), 900) as unknown as number;
      } else {
        const res = await api.post('/api/employees', { ...payload, password });
        const created = res.data?.data;
        setSuccess('Employee created');
        navTimeout.current = window.setTimeout(() => navigate(`/employees/${created?._id || ''}`), 900) as unknown as number;
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resp = err.response?.data?.error;
        // Map server validation errors (express-validator) to form fields
        if (resp?.details && Array.isArray(resp.details)) {
          const fieldErrors: Record<string, string> = {};
          for (const d of resp.details) {
            if (d.param && d.msg) fieldErrors[d.param] = d.msg;
          }
          setFormErrors(fieldErrors);
          setError(resp?.message || 'Validation failed');
        } else {
          setError(resp?.message || err.message);
        }
      } else if (err instanceof Error) setError(err.message);
      else setError('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (navTimeout.current) {
        clearTimeout(navTimeout.current as unknown as number);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h1 className="text-2xl font-bold mb-2">{isEdit ? 'Edit' : 'Create'} Employee</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}
          {success && <div className="text-success">{success}</div>}

          <div>
            <label className="block text-sm font-medium">Name</label>
            <input aria-invalid={!!formErrors.name} className="input" value={name} onChange={(e) => setName(e.target.value)} />
            {formErrors.name && <div className="text-sm text-danger mt-1">{formErrors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input aria-invalid={!!formErrors.email} className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            {formErrors.email && <div className="text-sm text-danger mt-1">{formErrors.email}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Password {isEdit ? '(leave blank to keep)' : ''}</label>
            <input aria-invalid={!!formErrors.password} type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            {formErrors.password && <div className="text-sm text-danger mt-1">{formErrors.password}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Department</label>
            <select className="input" value={departmentId || ''} onChange={(e) => setDepartmentId(e.target.value || undefined)}>
              <option value="">-- none --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
