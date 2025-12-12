import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

const Departments = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const toast = useToast();
  const confirm = useConfirm();

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/departments', { params: { page, limit: pageSize, search } });
      const data = res.data?.data;
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, search]);

  const handleDelete = async (id: string) => {
    const ok = await confirm('Delete this department? This will not remove employees.');
    if (!ok) return;
    try {
      await api.delete(`/api/departments/${id}`);
      toast.showToast('Department deleted', 'success');
      fetchList();
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      toast.showToast(apiErr.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Departments</h1>
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="input" />
            <Link to="/departments/new" className="btn">Add Department</Link>
          </div>
        </div>

        {loading && <div className="muted">Loading...</div>}
        {error && <div className="text-danger">{error}</div>}

        {!loading && !error && (
          <div className="card overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d._id}>
                    <td className="p-2">{d.name}</td>
                    <td className="p-2">{d.description ?? '-'}</td>
                    <td className="p-2">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="p-2">
                      <Link to={`/departments/${d._id}`} className="muted mr-2">Edit</Link>
                      <button className="text-danger" onClick={() => handleDelete(d._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <div className="muted">{Math.min((page - 1) * pageSize + 1, total)} - {Math.min(page * pageSize, total)} of {total}</div>
              <div className="flex gap-2">
                <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                <button className="btn" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
