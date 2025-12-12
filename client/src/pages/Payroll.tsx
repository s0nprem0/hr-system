import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

type PayrollEntry = {
  _id: string;
  amount: number;
  payDate?: string;
  employee?: { _id: string; name?: string; email?: string } | null;
};

const Payroll = () => {
  const [items, setItems] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const toast = useToast();
  const confirm = useConfirm();

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/payroll', { params: { page, limit: pageSize, search } });
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
    const ok = await confirm('Delete this payroll entry?');
    if (!ok) return;
    try {
      await api.delete(`/api/payroll/${id}`);
      toast.showToast('Payroll entry deleted', 'success');
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
          <h1 className="text-2xl font-bold">Payroll</h1>
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee" className="input" />
            <Link to="/payroll/new" className="btn">Add Payroll Entry</Link>
          </div>
        </div>

        {loading && <div className="muted">Loading...</div>}
        {error && <div className="text-danger">{error}</div>}

        {!loading && !error && (
          <div className="card overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left p-2">Employee</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Pay Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">{p.employee ? `${p.employee.name || p.employee.email || '—'}` : '—'}</td>
                    <td className="p-2">{p.amount?.toFixed ? p.amount.toFixed(2) : p.amount}</td>
                    <td className="p-2">{p.payDate ? new Date(p.payDate).toLocaleDateString() : '-'}</td>
                    <td className="p-2">
                      <div className="inline-flex gap-2 float-right">
                        <Link to={`/payroll/${p._id}`} className="btn btn-sm">Edit</Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                      </div>
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

export default Payroll;
