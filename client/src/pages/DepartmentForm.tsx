import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';

const DepartmentForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const fetchDepartment = async () => {
    if (!params.id) return;
    const isValidHex24 = /^[0-9a-fA-F]{24}$/.test(params.id);
    if (!isValidHex24) {
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

  useEffect(() => { if (isEdit) fetchDepartment(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !name.trim()) return setError('Name is required');
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit' : 'Create'} Department</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}

          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
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

export default DepartmentForm;
