import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';
import { Input, Select, Label, Checkbox, FormCard } from '../components/ui';
import type { Role } from '../context/AuthPermissions';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(true);

  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const navTimeout = useRef<number | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/api/departments');
        setDepartments(res.data?.data?.items || []);
      } catch {
        // ignore
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!params.id) return;
      if (!isValidMongoId(params.id)) {
        setError('Invalid employee id');
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/employees/${params.id}`);
        const e = res.data?.data;
        setName(e?.name || '');
        setEmail(e?.email || '');
        setRole(e?.role || 'employee');
        setDepartmentId(e?.profile?.department?._id || e?.profile?.department || undefined);
      } catch (err: unknown) {
        const apiErr = handleApiError(err);
        if (/not found/i.test(apiErr.message)) setError('Employee not found');
        else setError(apiErr.message);
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) fetchEmployee();
  }, [isEdit, params.id]);

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
      const first = Object.keys(errs)[0];
      if (first === 'name') nameRef.current?.focus();
      if (first === 'email') emailRef.current?.focus();
      if (first === 'password') passwordRef.current?.focus();
      return;
    }
    const payload: Record<string, unknown> = { name, email, role, profile: { department: departmentId } };
    if (!isEdit && password) payload.password = password;
    if (isEdit && password) payload.password = password; // allow changing password

    setSaving(true);
    try {
      if (isEdit && params.id) {
        (payload as Record<string, unknown>).active = active;
        await api.put(`/api/employees/${params.id}`, payload);
        setSuccess('Employee updated');
        toast.showToast('Employee updated', 'success');
        // give user a chance to see success message
        navTimeout.current = window.setTimeout(() => navigate(`/employees/${params.id}`), 900) as unknown as number;
      } else {
        const res = await api.post('/api/employees', { ...payload, password, active });
        const created = res.data?.data;
        setSuccess('Employee created');
        toast.showToast('Employee created', 'success');
        navTimeout.current = window.setTimeout(() => navigate(`/employees/${created?._id || ''}`), 900) as unknown as number;
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      if (apiErr.details && Array.isArray(apiErr.details)) {
        const fieldErrors: Record<string, string> = {};
        for (const d of apiErr.details) {
          if (d.param && d.msg) fieldErrors[d.param] = d.msg;
        }
        setFormErrors(fieldErrors);
        const first = Object.keys(fieldErrors)[0];
        if (first === 'name') nameRef.current?.focus();
        if (first === 'email') emailRef.current?.focus();
        if (first === 'password') passwordRef.current?.focus();
        setError(apiErr.message || 'Validation failed');
      } else {
        setError(apiErr.message);
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (navTimeout.current) {
        clearTimeout(navTimeout.current as unknown as number);
      }
    };

  }, []);

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className="">
        <FormCard>
          <h1 className="text-2xl font-bold mb-2">{isEdit ? 'Edit' : 'Create'} Employee</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}
          {success && <div className="text-success">{success}</div>}

          <div>
            <Input ref={nameRef} label="Name" aria-invalid={!!formErrors.name} value={name} onChange={(e) => { setName(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.name; return c; }); }} />
          </div>

          <div>
            <Input ref={emailRef} label="Email" aria-invalid={!!formErrors.email} value={email} onChange={(e) => { setEmail(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.email; return c; }); }} />
          </div>

          <div>
            <Input ref={passwordRef} label={`Password ${isEdit ? '(leave blank to keep)' : ''}`} aria-invalid={!!formErrors.password} type="password" value={password} onChange={(e) => { setPassword(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.password; return c; }); }} />
          </div>

          <div>
            <Select label="Role" value={role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as 'admin' | 'hr' | 'employee')}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <div>
            <Label>Department</Label>
            <select className="input" value={departmentId || ''} onChange={(e) => setDepartmentId(e.target.value || undefined)}>
              <option value="">-- none --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </FormCard>
      </form>
    </PageContainer>
  );
};

export default EmployeeForm;
