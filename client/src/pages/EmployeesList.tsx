import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import axios from 'axios';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: { department?: { name?: string } } | null;
}

const EmployeesList = () => {
  const auth = useAuth();
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/employees', { params: { page, limit: pageSize, search } });
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

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const toast = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      // refresh
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
          <h1 className="text-2xl font-bold">Employees</h1>
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="input" />
            <Link to="/employees/new" className="btn">Add Employee</Link>
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
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id}>
                    <td className="p-2">{it.name}</td>
                    <td className="p-2">{it.email}</td>
                    <td className="p-2">{it.role}</td>
                    <td className="p-2">{(it.profile as any)?.department?.name ?? '-'}</td>
                    <td className="p-2">
                      <Link to={`/employees/${it._id}`} className="muted mr-2">View</Link>
                      <Link to={`/employees/${it._id}/edit`} className="muted mr-2">Edit</Link>
                      {(auth?.user?.role === 'admin') && (
                        <button className="text-danger" onClick={() => handleDelete(it._id)}>Delete</button>
                      )}
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

        <p className="muted mt-4">Signed in as: {auth?.user?.name} ({auth?.user?.role})</p>
      </div>
    </div>
  );
};

export default EmployeesList;
