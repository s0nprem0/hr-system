import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import api from '../utils/api';
import type { ApiResponse, DepartmentDTO } from '@hr/shared';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';
import { Input, Textarea, Button, FormCard } from '../components/ui';

const DepartmentForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!params.id) return;
      if (!isValidMongoId(params.id)) {
        setError('Invalid department id');
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/departments/${params.id}`);
        const r = res.data as ApiResponse<DepartmentDTO>;
        if (r?.success) {
          const d = r.data;
          setName(d?.name || '');
          setDescription(d?.description || '');
        } else {
          throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Failed to load department');
        }
      } catch (err: unknown) {
        const apiErr = handleApiError(err);
        if (/not found/i.test(apiErr.message)) setError('Department not found');
        else setError(apiErr.message);
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) fetchDepartment();
  }, [isEdit, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};
    if (!name || !name.trim()) errs.name = 'Name is required';
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      if (errs.name) nameRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      if (isEdit && params.id) {
        const res = await api.put(`/api/departments/${params.id}`, { name, description });
        const r = res.data as ApiResponse<DepartmentDTO>;
        if (r?.success) {
          toast.showToast('Department updated', 'success');
          navigate('/departments');
        } else {
          throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Update failed');
        }
      } else {
        const res = await api.post('/api/departments', { name, description });
        const r = res.data as ApiResponse<DepartmentDTO>;
        if (r?.success) {
          toast.showToast('Department created', 'success');
          navigate('/departments');
        } else {
          throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Create failed');
        }
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className="">
        <FormCard>
          <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit' : 'Create'} Department</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}

          <div>
            <Input ref={nameRef} label="Name" aria-invalid={!!formErrors.name} value={name} onChange={(e) => { setName(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.name; return c; }); }} />
          </div>

          <div>
            <Textarea label="Description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </FormCard>
      </form>
    </PageContainer>
  );
};

export default DepartmentForm;
