import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';

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
        const d = res.data?.data;
        setName(d?.name || '');
        setDescription(d?.description || '');
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
        await api.put(`/api/departments/${params.id}`, { name, description });
        toast.showToast('Department updated', 'success');
        navigate('/departments');
      } else {
        await api.post('/api/departments', { name, description });
        toast.showToast('Department created', 'success');
        navigate('/departments');
      }
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-main py-6">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="card space-y-4 max-w-3xl mx-auto">
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
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;
