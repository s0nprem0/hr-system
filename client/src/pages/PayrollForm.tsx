import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';

interface EmployeeShort {
  _id: string;
  name?: string;
  email: string;
}

const PayrollForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;
  const [employeeId, setEmployeeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [employees, setEmployees] = useState<EmployeeShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees', { params: { page: 1, limit: 200 } });
      const data = res.data?.data;
      setEmployees(data?.items || []);
    } catch (err: unknown) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchPayroll = useCallback(async () => {
    if (!params.id) return;
    const isValidHex24 = /^[0-9a-fA-F]{24}$/.test(params.id);
    if (!isValidHex24) {
      setError('Invalid payroll id');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/api/payroll/${params.id}`);
      const p = res.data?.data;
      setEmployeeId(p?.employee?._id || '');
      setAmount(p?.amount != null ? String(p.amount) : '');
      setPayDate(p?.payDate ? new Date(p.payDate).toISOString().slice(0, 10) : '');
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      if (/not found/i.test(apiErr.message)) setError('Payroll entry not found');
      else setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchEmployees(); if (isEdit) fetchPayroll(); }, [params.id, fetchPayroll, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!employeeId) return setError('Employee is required');
    if (!amount || Number.isNaN(Number(amount))) return setError('Valid amount is required');
    setSaving(true);
    try {
      const payload: { employeeId: string; amount: number; payDate?: string } = {
        employeeId,
        amount: Number(amount),
        payDate: payDate || undefined,
      };
      if (isEdit && params.id) {
        await api.put(`/api/payroll/${params.id}`, payload);
        toast.showToast('Payroll entry updated', 'success');
      } else {
        await api.post('/api/payroll', payload);
        toast.showToast('Payroll entry created', 'success');
      }
      navigate('/payroll');
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
          <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit' : 'Create'} Payroll Entry</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}

          <div>
            <label className="block text-sm font-medium">Employee</label>
            <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">-- Select employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" />
          </div>

          <div>
            <label className="block text-sm font-medium">Pay Date</label>
            <input className="input" value={payDate} onChange={(e) => setPayDate(e.target.value)} type="date" />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollForm;
